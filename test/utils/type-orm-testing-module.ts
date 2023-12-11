import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../src/users/user.entity';
import { RefreshToken } from '../../src/auth/refreshtoken.entity';
import { Message } from '../../src/chat/message.entity';
import { Conversation } from '../../src/chat/conversation.entity';
import * as dotenv from "dotenv";

dotenv.config();

export const TypeOrmTestingModule = () => [
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_TEST_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [User, RefreshToken, Message, Conversation],
    synchronize: true,
    logging: false,
    subscribers: [],
  }),
  TypeOrmModule.forFeature([User, RefreshToken, Message, Conversation]),
];
