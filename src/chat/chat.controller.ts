import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Conversation } from './conversation.entity';
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
    return await this.chatService.findConversationWithMessagesByUserId(id);
  }
}
