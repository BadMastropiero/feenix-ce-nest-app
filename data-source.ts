import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './src/users/user.entity';
import * as dotenv from 'dotenv';
import { RefreshToken } from './src/auth/refreshtoken.entity';
import { Message } from './src/chat/message.entity';
import { Conversation } from './src/chat/conversation.entity';

dotenv.config();
export const options: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [User, RefreshToken, Message, Conversation],
  synchronize: false,
  logging: true,
  subscribers: [],
};
export const AppDataSource = new DataSource({
  ...options,
  migrations: ['src/migrations/*.ts'],
});
