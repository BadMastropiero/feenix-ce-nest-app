import {
  Controller,
  Get,
  Param,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { Public } from '../public/public.decorator';
import { SameUserGuard } from '../auth/auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Public()
  @Get()
  async findAll(): Promise<Conversation[]> {
    return this.chatService.findAll();
  }

  @Public()
  @UseGuards(SameUserGuard)
  @Get('conversations/:id')
  async findOne(@Param('id') id: string): Promise<Conversation[]> {
    const conversations =
      await this.chatService.findConversationWithMessagesByUserId(id);
    return conversations;
  }
}
