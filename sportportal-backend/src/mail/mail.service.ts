import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;
  private readonly appUrl: string;

  constructor() {
    this.from = process.env.SMTP_FROM || 'СпортПортал <no-reply@sportportal.local>';
    this.appUrl = process.env.APP_URL || 'http://localhost:5173';
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }

  async sendResetLink(email: string, token: string): Promise<void> {
    const link = `${this.appUrl}/reset-password?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#0f172a;">Сброс пароля</h2>
        <p>Вы запросили сброс пароля в СпортПортале. Перейдите по ссылке ниже, чтобы задать новый пароль. Ссылка действует <b>1 час</b>.</p>
        <p style="margin:24px 0;">
          <a href="${link}" style="background:#10b981;color:#020617;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold;">Сбросить пароль</a>
        </p>
        <p style="color:#64748b;font-size:13px;">Если кнопка не работает, скопируйте ссылку:<br>${link}</p>
        <p style="color:#64748b;font-size:13px;">Если вы не запрашивали сброс — просто проигнорируйте это письмо.</p>
      </div>`;

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: 'Сброс пароля — СпортПортал',
        html,
      });
      this.logger.log(`Reset link sent to ${email}`);
    } catch (err) {
      // Не роняем запрос: пользователю всё равно отвечаем 200.
      // В dev без настроенного SMTP ссылка останется в логах для проверки.
      this.logger.error(`Failed to send reset email to ${email}: ${(err as Error).message}`);
      this.logger.warn(`[DEV] Reset link for ${email}: ${link}`);
    }
  }
}
