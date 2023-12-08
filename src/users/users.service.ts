import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async create(user: Partial<User>): Promise<User> {
    const new_user = this.usersRepository.create(user);
    return this.usersRepository.save(new_user);
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, user);
    return this.usersRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
