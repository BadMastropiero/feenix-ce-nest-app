import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  BeforeInsert,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Conversation } from './conversation.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  created_at: Date;

  @Column()
  text: string;

  @ManyToOne(() => Conversation)
  conversation: Conversation;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @BeforeInsert()
  generateDate() {
    if (!this.created_at) {
      this.created_at = new Date();
    }
  }
}
