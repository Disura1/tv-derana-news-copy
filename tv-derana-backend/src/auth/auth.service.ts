import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async verifyCaptcha(token: string): Promise<boolean> {
    const secretKey = this.configService.get<string>('RECAPTCHA_SECRET_KEY');

    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      { method: 'POST' },
    );

    const data = await response.json();
    return data.success === true;
  }

  async register(dto: RegisterDto) {
    const isCaptchaValid = await this.verifyCaptcha(dto.captchaToken);
    if (!isCaptchaValid) {
      throw new BadRequestException('Captcha verification failed');
    }

    const existingUser = await this.usersService.findByUsernameOrEmail(
      dto.username,
    );
    const existingEmail = await this.usersService.findByUsernameOrEmail(
      dto.email,
    );

    if (existingUser || existingEmail) {
      throw new ConflictException('Username or email is already taken');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
    });

    return this.generateToken(user.id, user.username, user.role);
  }

  async login(dto: LoginDto) {
    const isCaptchaValid = await this.verifyCaptcha(dto.captchaToken);
    if (!isCaptchaValid) {
      throw new BadRequestException('Captcha verification failed');
    }

    const user = await this.usersService.findByUsernameOrEmail(
      dto.identifier,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user.id, user.username, user.role);
  }

  private generateToken(userId: string, username: string, role: string) {
    const payload = { sub: userId, username, role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: userId, username, role },
    };
  }
}