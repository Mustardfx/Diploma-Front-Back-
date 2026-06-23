import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
// import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';


@Module({
  imports: [
    UsersModule,
    MailModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService,],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}