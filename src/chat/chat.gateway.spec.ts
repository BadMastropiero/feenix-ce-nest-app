import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmTestingModule } from '../../test/utils/type-orm-testing-module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { INestApplication } from '@nestjs/common';
import { Socket, io } from 'socket.io-client';

describe('ChatGateway', () => {
  let chatGateways: ChatGateway;
  let jwtService: JwtService;
  let app: INestApplication;
  let ioClient: Socket;

  beforeAll(async () => {
    const testingM: TestingModule = await Test.createTestingModule({
      imports: [
        ...TypeOrmTestingModule(),
        JwtModule.register({
          global: true,
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: process.env.JWT_EXPIRATION },
        }),
      ],
      providers: [ChatGateway, UsersService, AuthService, ChatService],
      controllers: [ChatController],
    }).compile();

    app = testingM.createNestApplication();
    chatGateways = app.get<ChatGateway>(ChatGateway);
    jwtService = app.get<JwtService>(JwtService);

    ioClient = io('http://localhost:3000', {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });

    app.listen(3000);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(chatGateways).toBeDefined();
  });

  it('should not connect without auth', async () => {
    ioClient.connect();
    expect(ioClient.connected).toBeFalsy();
  });

  it('should connect with auth', async () => {
    const token = jwtService.sign({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@doe.com',
    });

    ioClient.auth = { token };
    ioClient.connect();

    await new Promise<void>((resolve) => {
      ioClient.on('connect', () => {
        expect(ioClient.connected).toBeTruthy();
        resolve();
      });
      ioClient.on('disconnect', () => {
        resolve();
      });
    });
  });

  it('should reply with test message', async () => {
    const token = jwtService.sign({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@doe.com',
    });

    ioClient.auth = { token };
    ioClient.connect();
    ioClient.emit('message', {
      text: 'Reply to this with Hello world!',
      createdAt: new Date(),
    });

    let aggregatedAnswer = '';
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 4000);
      ioClient.on('message', (data) => {
        aggregatedAnswer += data.text;
      });
    });
    expect(aggregatedAnswer).toBe('Hello world!');
  });
});
