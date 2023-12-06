import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Public } from '../public/public.decorator';

interface LoginDTO {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post()
  async login(@Body() loginDTO: LoginDTO): Promise<{ access_token: string }> {
    const { email, password } = loginDTO;
    const valid = await this.authService.validateUser(email, password);
    if (!valid) {
      throw new UnauthorizedException();
    }
    return await this.authService.generateAccessToken(email);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
