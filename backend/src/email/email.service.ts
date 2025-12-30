/* eslint-disable max-len */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeResend();
  }

  private initializeResend(): void {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not configured. Email sending will be disabled.');
      return;
    }

    this.resend = new Resend(apiKey);
    this.logger.log('Resend email service initialized');
  }

  async sendVerificationEmail(to: string, firstName: string, verificationToken: string): Promise<boolean> {
    if (!this.resend) {
      this.logger.warn(`Email not sent to ${to} - Resend not configured`);
      return false;
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3002');
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
    const html = this.getVerificationEmailTemplate(firstName, verificationLink);

    try {
      const { error } = await this.resend.emails.send({
        from: 'Red Académica UNAMAD <onboarding@resend.dev>',
        to: [to],
        subject: 'Verifica tu cuenta - Red Académica UNAMAD',
        html,
      });

      if (error) {
        this.logger.error(`Failed to send verification email to ${to}:`, error.message);
        return false;
      }

      this.logger.log(`Verification email sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}:`, error.message);
      return false;
    }
  }

  private getVerificationEmailTemplate(firstName: string, verificationLink: string): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificación de Cuenta</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Red Académica UNAMAD
              </h1>
              <p style="margin: 10px 0 0; color: #bfdbfe; font-size: 14px;">
                Universidad Nacional Amazónica de Madre de Dios
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">
                ¡Hola ${firstName}!
              </h2>

              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Gracias por registrarte en la Red Académica UNAMAD. Para completar tu registro y acceder a todas las funcionalidades, por favor verifica tu cuenta haciendo clic en el botón de abajo.
              </p>

              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 30px 0;">
                    <a href="${verificationLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
                      Verificar mi cuenta
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
              </p>

              <p style="margin: 0 0 20px; padding: 15px; background-color: #f3f4f6; border-radius: 6px; word-break: break-all;">
                <a href="${verificationLink}" style="color: #2563eb; text-decoration: none; font-size: 13px;">
                  ${verificationLink}
                </a>
              </p>

              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                  Este enlace expirará en 24 horas. Si no solicitaste esta verificación, puedes ignorar este correo.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                © 2025 Red Académica UNAMAD
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Av. Jorge Chávez N° 1160, Puerto Maldonado, Madre de Dios, Perú
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }
}
