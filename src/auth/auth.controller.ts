import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
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
  async login(
    @Body() loginDTO: LoginDTO,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const { email, password } = loginDTO;
    try {
      const valid = await this.authService.validateUser(email, password);
      if (!valid) {
        throw new UnauthorizedException();
      }
      const at = await this.authService.generateAccessToken(email);
      const rt = await this.authService.generateRefreshToken(email);

      return {
        access_token: at,
        refresh_token: rt,
      };
    } catch {
      throw new UnauthorizedException();
    }
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    const { refresh_token } = body;
    try {
      const valid = await this.authService.validateRefreshToken(refresh_token);
      if (!valid) {
        throw new UnauthorizedException();
      }
      const at =
        await this.authService.generateAccessTokenFromRefreshToken(
          refresh_token,
        );

      return {
        access_token: at,
      };
    } catch {
      throw new UnauthorizedException();
    }
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
