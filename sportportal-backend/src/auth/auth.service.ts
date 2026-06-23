import {
  Injectable, ConflictException, UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import {
  LoginDto, RegisterDto, ResetPasswordDto, ChangePasswordDto,
} from './dto/auth.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { MailService } from '../mail/mail.service';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 час

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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

  // ─── Сброс пароля ─────────────────────────────────────────────────
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    // Всегда отвечаем одинаково — не раскрываем, существует ли email.
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.resetTokenHash = this.hashToken(token);
      user.resetTokenExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await this.usersService.save(user);
      await this.mailService.sendResetLink(user.email, token);
    }
    return {
      message: 'Если такой email зарегистрирован, мы отправили ссылку для сброса пароля.',
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByResetTokenHash(this.hashToken(dto.token));
    if (
      !user ||
      !user.resetTokenExpires ||
      user.resetTokenExpires.getTime() < Date.now()
    ) {
      throw new BadRequestException('Ссылка недействительна или срок её действия истёк');
    }

    user.password = await bcrypt.hash(dto.password, 10);
    user.resetTokenHash = null;        // одноразовость
    user.resetTokenExpires = null;
    user.mustChangePassword = false;   // пользователь уже задал постоянный пароль на странице сброса
    await this.usersService.save(user);

    return { message: 'Пароль обновлён. Войдите с новым паролем.' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findOne(userId);
    const match = await bcrypt.compare(dto.currentPassword, user.password);
    if (!match) throw new BadRequestException('Текущий пароль неверен');

    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.mustChangePassword = false;
    await this.usersService.save(user);

    return { message: 'Пароль изменён' };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private buildResponse(user: any) {
    const payload = { id: user.id, role: user.role };
    // Убираем чувствительные поля из ответа.
    const { password, resetTokenHash, resetTokenExpires, ...safeUser } = user;
    return {
      access_token: this.jwtService.sign(payload),
      user: safeUser,
    };
  }
}
