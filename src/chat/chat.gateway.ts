import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from '../auth/jwt.payload';
import { AuthService } from '../auth/auth.service';
import { ChatService } from './chat.service';

interface User {
  id: string;
  name: string;
}

interface Message {
  id: string;
  text: string;
  createdAt?: Date;
  user?: User;
}

const chatbotUser: User = {
  id: 'chatbot',
  name: 'ChatBot',
};

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  MESSAGES_BEFORE_PERSIST = parseInt(process.env.MESSAGES_BEFORE_PERSIST) || 3;

  @WebSocketServer() server;
  messagesByUserId: Record<string, Message[]> = {};
  conversationByUser: Record<string, string> = {};
  cleanupTimeoutsByUserId: Record<string, NodeJS.Timeout> = {};

  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
  });

  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private chatService: ChatService,
  ) {}

  async handleConnection(client) {
    // A client has connected
    try {
      await this.authService.validateToken(client.handshake.auth.token);
    } catch {
      client.emit('message', {
        id: uuidv4(),
        text: `Hello you, please authenticate yourself`,
        user: chatbotUser,
        createdAt: new Date(),
      });
      client.disconnect();
      return;
    }

    const user = this.extractUserFromToken(client.handshake.auth.token);
    const cleanupTimeout = this.cleanupTimeoutsByUserId[user.userId];
    if (cleanupTimeout) {
      clearTimeout(cleanupTimeout);
      delete this.cleanupTimeoutsByUserId[user.userId];
    }

    this.messagesByUserId[user.userId] =
      this.messagesByUserId[user.userId] || [];

    // Notify connected clients of current users
    this.server.emit('users', this.messagesByUserId);
  }

  async handleDisconnect(client) {
    const user = this.extractUserFromToken(client.handshake.auth.token);
    // A client has disconnected
    this.cleanupTimeoutsByUserId[user.userId] = setTimeout(() => {
      delete this.messagesByUserId[user.userId];
      delete this.conversationByUser[user.userId];
    }, 10000);

    this.server.emit('users', this.messagesByUserId);
  }

  @SubscribeMessage('message')
  async onChat(client, message) {
    const answerId = uuidv4();

    const user = this.extractUserFromToken(client.handshake.auth.token);
    if (!user) return;

    this.messagesByUserId[user.userId].push({
      id: answerId,
      text: message.text,
      user: {
        id: user.userId,
        name: user.firstName,
      },
      createdAt: new Date(),
    });

    // Persist message if more than 3 messages
    const conversationId = this.conversationByUser[user.userId];
    console.log({ m: this.messagesByUserId[user.userId], c: conversationId });
    if (
      this.messagesByUserId[user.userId].length === this.MESSAGES_BEFORE_PERSIST
    ) {
      for (const message1 of this.messagesByUserId[user.userId]) {
        await this.chatService.addMessageWithUserId(
          conversationId,
          user.userId,
          {
            text: message1.text,
          },
        );
      }
    }
    if (
      this.messagesByUserId[user.userId].length > this.MESSAGES_BEFORE_PERSIST
    ) {
      await this.chatService.addMessageWithUserId(conversationId, user.userId, {
        text: message.text,
      });
    }

    const stream = await this.openai.chat.completions.create({
      // messages: [{role: 'user', content: message.text}],
      messages: this.messagesByUserId[user.userId].map((message) =>
        message.user
          ? {
              role: 'user',
              content: message.text,
            }
          : {
              role: 'assistant',
              content: message.text,
            },
      ),
      model: 'gpt-3.5-turbo',
      stream: true,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const response = chunk.choices[0]?.delta?.content || '';
      fullResponse += response;
      client.emit('message', {
        id: answerId,
        text: response,
        user: chatbotUser,
        createdAt: new Date(),
      });
    }

    // After stream end, save the response to messages
    const fullAssistantMsg: Message = {
      id: answerId,
      text: fullResponse,
      user: null,
      createdAt: new Date(),
    };
    this.messagesByUserId[user.userId].push(fullAssistantMsg);
    if (
      this.messagesByUserId[user.userId].length > this.MESSAGES_BEFORE_PERSIST
    ) {
      await this.chatService.addMessageWithUserId(conversationId, null, {
        text: fullAssistantMsg.text,
        created_at: fullAssistantMsg.createdAt,
      });
    }
  }

  @SubscribeMessage('hello')
  async onHello(client) {
    const user = this.extractUserFromToken(client.handshake.auth.token);
    if (!user) return;

    // Assign new conversation to user
    this.conversationByUser[user.userId] = uuidv4();
    this.messagesByUserId[user.userId] = [];

    client.emit('hello_back', {});
    client.emit('message', {
      text: `Hello ${user?.firstName} ${user?.lastName}, how can I help you?`,
      user: chatbotUser,
      createdAt: new Date(),
    });
  }

  private extractUserFromToken(token: string): JWTPayload | undefined {
    try {
      return this.jwtService.decode(token);
    } catch {
      return undefined;
    }
  }
}
