import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './src/users/user.entity';
import * as dotenv from 'dotenv';

dotenv.config();
export const options: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [User],
  synchronize: false,
  logging: true,
  subscribers: [],
};
export const AppDataSource = new DataSource({
  ...options,
  migrations: ['src/migrations/*.ts'],
});