import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { Conversation } from './conversation.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<Conversation[]> {
    return this.conversationsRepository.find();
  }

  findOne(id: string): Promise<Conversation | null> {
    return this.conversationsRepository.findOneBy({ id });
  }

  async findOneWithMessages(id: string): Promise<Conversation> {
    return await this.conversationsRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.messages', 'message')
      .leftJoinAndSelect('message.user', 'user')
      .where('conversation.id = :id', { id })
      .getOne();
  }

  findAllByUserId(id: string): Promise<Conversation[] | null> {
    return this.conversationsRepository.findBy({ user: { id } });
  }

  async findConversationWithMessagesByUserId(
    userId: string,
  ): Promise<Conversation[]> {
    return await this.conversationsRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.messages', 'message')
      .leftJoinAndSelect('message.user', 'user')
      .where('conversation.userId = :userId', { userId })
      .getMany();
  }

  async create(c: Partial<Conversation>): Promise<Conversation> {
    const n = this.conversationsRepository.create(c);
    return this.conversationsRepository.save(n);
  }

  async delete(id: string): Promise<void> {
    await this.conversationsRepository.delete(id);
  }

  async addMessage(
    conversationId: string,
    message: Partial<Message>,
  ): Promise<Message> {
    const conversation = await this.conversationsRepository.findOneByOrFail({
      id: conversationId,
    });
    const m = this.messagesRepository.create(message);
    m.conversation = conversation;
    return this.messagesRepository.save(m);
  }

  async addMessageWithUserId(
    conversationId: string,
    userId: string | null,
    message: Partial<Message>,
  ): Promise<Message> {
    const user = userId
      ? await this.usersRepository.findOneBy({ id: userId })
      : null;
    let conversation = await this.conversationsRepository.findOneBy({
      id: conversationId,
    });
    if (!conversation) {
      conversation = await this.create({ id: conversationId, user });
    }
    const m = this.messagesRepository.create({ ...message, user });
    m.conversation = conversation;
    return this.messagesRepository.save(m);
  }
}
