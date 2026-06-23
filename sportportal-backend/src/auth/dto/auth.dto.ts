import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Пароль минимум 6 символов' })
  password: string;
}

export class RegisterDto {
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Пароль минимум 6 символов' })
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  patronymic?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6, { message: 'Пароль минимум 6 символов' })
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'Пароль минимум 6 символов' })
  newPassword: string;
}
