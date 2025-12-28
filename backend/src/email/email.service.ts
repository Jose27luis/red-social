import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const host = this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (!user || !pass) {
      this.logger.warn('SMTP not configured. Email sending disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('SMTP connection failed:', error.message);
      } else {
        this.logger.log('SMTP server is ready to send emails');
      }
    });
  }

  async sendVerificationEmail(to: string, firstName: string, verificationToken: string): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(`Email not sent to ${to} - SMTP not configured`);
      return false;
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const link = `${frontendUrl}/verify-email?token=${verificationToken}`;
    const html = this.getTemplate(firstName, link);

    try {
      const smtpUser = this.configService.get<string>('SMTP_USER');
      await this.transporter.sendMail({
        from: `"Red Académica UNAMAD" <${smtpUser}>`,
        to,
        subject: 'Verifica tu cuenta - Red Académica UNAMAD',
        html,
      });
      this.logger.log(`Verification email sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error.message);
      return false;
    }
  }

  // eslint-disable-next-line max-len
  private getTemplate(firstName: string, link: string): string {
    const styles = {
      body: 'margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f5;',
      container: 'width:600px;max-width:100%;background:#fff;border-radius:12px;',
      header: 'padding:40px;text-align:center;background:#2563eb;border-radius:12px 12px 0 0;',
      content: 'padding:40px;',
      button:
        'display:inline-block;padding:16px 40px;background:#2563eb;color:#fff;' +
        'text-decoration:none;font-size:16px;font-weight:600;border-radius:8px;',
      footer: 'padding:20px;background:#f9fafb;border-radius:0 0 12px 12px;text-align:center;',
    };

    return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Verificación</title></head>
<body style="${styles.body}">
  <table role="presentation" style="width:100%;">
    <tr><td align="center" style="padding:40px 0;">
      <table role="presentation" style="${styles.container}">
        <tr><td style="${styles.header}">
          <h1 style="margin:0;color:#fff;font-size:24px;">Red Académica UNAMAD</h1>
          <p style="margin:10px 0 0;color:#bfdbfe;font-size:14px;">UNAMAD</p>
        </td></tr>
        <tr><td style="${styles.content}">
          <h2 style="margin:0 0 20px;color:#1f2937;font-size:20px;">¡Hola ${firstName}!</h2>
          <p style="margin:0 0 20px;color:#4b5563;font-size:16px;line-height:1.6;">
            Gracias por registrarte. Verifica tu cuenta haciendo clic en el botón.
          </p>
          <table style="width:100%;"><tr><td align="center" style="padding:30px 0;">
            <a href="${link}" style="${styles.button}">Verificar mi cuenta</a>
          </td></tr></table>
          <p style="margin:20px 0;color:#6b7280;font-size:14px;">
            O copia este enlace: <a href="${link}" style="color:#2563eb;">${link}</a>
          </p>
          <p style="margin:20px 0 0;padding-top:20px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">
            Este enlace expirará en 24 horas.
          </p>
        </td></tr>
        <tr><td style="${styles.footer}">
          <p style="margin:0;color:#6b7280;font-size:12px;">© 2025 Red Académica UNAMAD</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }
}
