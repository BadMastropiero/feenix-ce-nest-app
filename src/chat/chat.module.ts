import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { RefreshToken } from '../auth/refreshtoken.entity';
import { ChatService } from './chat.service';
import { Message } from './message.entity';
import { Conversation } from './conversation.entity';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken, Message, Conversation]),
  ],
  providers: [ChatGateway, UsersService, AuthService, ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
