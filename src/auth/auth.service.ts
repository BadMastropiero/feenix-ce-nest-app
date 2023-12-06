import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JWTPayload } from './jwt.payload';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<boolean> {
    const user = await this.usersService.findOneByEmail(email);
    return await user.validatePassword(pass);
  }

  async generateAccessToken(name: string) {
    const user = await this.usersService.findOneByEmail(name);
    const payload: JWTPayload = { userId: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
