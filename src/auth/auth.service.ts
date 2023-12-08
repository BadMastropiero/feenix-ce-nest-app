import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JWTPayload, JWTRefreshPayload } from './jwt.payload';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './refreshtoken.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<boolean> {
    const user = await this.usersService.findOneByEmail(email);

    // This is a trick to delete expired refresh tokens in DB
    this.clearRefreshTokensInDB();
    return await user.validatePassword(pass);
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  async validateRefreshToken(token: string): Promise<boolean> {
    const tokenStored = await this.refreshTokenRepository.findOneBy({ token });
    if (!tokenStored) {
      return false;
    }
    return tokenStored.expires_at >= new Date();
  }

  async generateAccessToken(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return this.jwtService.sign(payload);
  }

  async generateRefreshToken(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    const payload: JWTRefreshPayload = {
      userId: user.id,
      email: user.email,
    };

    const rt = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '1y',
    });

    const nt = this.refreshTokenRepository.create({
      user: user,
      token: rt,
      expires_at: new Date(
        Date.now() +
          1000 * parseInt(process.env.JWT_REFRESH_EXPIRATION_SECONDS),
      ),
    });
    await this.refreshTokenRepository.save(nt);

    return rt;
  }

  async generateAccessTokenFromRefreshToken(refresh_token: string) {
    const payload = this.jwtService.verify(refresh_token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    return this.generateAccessToken(payload.email);
  }

  // Delete refresh tokens in DB that have expired
  async clearRefreshTokensInDB() {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expires_at < :date', { date: new Date() })
      .execute();
  }
}
