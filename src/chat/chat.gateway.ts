import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import {v4 as uuidv4} from 'uuid';
import OpenAI from "openai";

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
  @WebSocketServer() server;
  users: Record<string, Message[]> = {};

  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
  });

  async handleConnection(client) {
    // A client has connected
    this.users[client.id] = [];

    client.emit('message', {id: uuidv4(), text: "Hello you", user: chatbotUser, createdAt: new Date()});

    // Notify connected clients of current users
    this.server.emit('users', this.users);
  }

  async handleDisconnect(client) {
    // A client has disconnected
    delete this.users[client.id];

    this.server.emit('users', this.users);
  }

  @SubscribeMessage('message')
  async onChat(client, message) {
    const answerId = uuidv4();
    this.users[client.id].push({id: answerId, text: message.text, user: message.user, createdAt: new Date()});
    console.log({m: this.users[client.id]})
    const stream = await this.openai.chat.completions.create({
      // messages: [{role: 'user', content: message.text}],
      messages: this.users[client.id].map(message => ({role: 'user', content: message.text})),
      model: 'gpt-3.5-turbo',
      stream: true,
    });
    for await (const chunk of stream) {
      const response = chunk.choices[0]?.delta?.content || '';
      client.emit('message', {id: answerId, text: response, user: chatbotUser, createdAt: new Date()});
    }
  }
}