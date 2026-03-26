import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      password: hash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      patronymic: dto.patronymic,
      phone: dto.phone,
      role: UserRole.ATHLETE,
    });

    return this.buildResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Неверный email или пароль');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Неверный email или пароль');

    return this.buildResponse(user);
  }

  private buildResponse(user: any) {
    const payload = { sub: user.id, role: user.role };
    const { password, ...safeUser } = user;
    return {
      access_token: this.jwtService.sign(payload),
      user: safeUser,
    };
  }
}
