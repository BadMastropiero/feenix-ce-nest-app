import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import {v4 as uuidv4} from 'uuid';

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
  users: number = 0;

  async handleConnection(client) {
    // A client has connected
    this.users++;

    client.emit('message', {id: uuidv4(), text: "Hello you", user: chatbotUser, createdAt: new Date()});

    // Notify connected clients of current users
    this.server.emit('users', this.users);
  }

  async handleDisconnect() {
    // A client has disconnected
    this.users--;

    // Notify connected clients of current users
    this.server.emit('users', this.users);
  }

  @SubscribeMessage('message')
  async onChat(client, message) {
    const response = "Response to: " + message.text;
    client.emit('message', {id: uuidv4(), text: response, user: chatbotUser, createdAt: new Date()});
  }
}