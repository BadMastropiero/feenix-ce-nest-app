import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  expires_at: Date;

  @Column()
  token: string;

  @ManyToOne(() => User)
  user: User;
}
