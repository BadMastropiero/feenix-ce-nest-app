import * as bcrypt from 'bcrypt';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { Conversation } from '../chat/conversation.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 70, nullable: true })
  password: string;

  @BeforeInsert()
  async hashPassword() {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compareSync(password, this.password);
  }

  @OneToMany(() => Conversation, (conversation) => conversation.user)
  conversations: Conversation[];

  toJSON(): Record<string, any> {
    const { password, ...self } = this;
    return self;
  }
}
