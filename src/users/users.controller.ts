import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Public } from '../public/public.decorator';
import { SameUserGuard } from '../auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //get all users
  @Public()
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  //get user by id
  @Public()
  @UseGuards(SameUserGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User does not exist!');
    } else {
      return user;
    }
  }

  //create user
  @Public()
  @Post()
  async create(@Body() user: User): Promise<User> {
    return this.usersService.create(user);
  }

  //update user
  @Public()
  @UseGuards(SameUserGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() user: User): Promise<any> {
    return this.usersService.update(id, user);
  }

  //delete user
  @Public()
  @UseGuards(SameUserGuard)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    //handle error if user does not exist
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User does not exist!');
    }
    return this.usersService.delete(id);
  }
}
