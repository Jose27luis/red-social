import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { AccessLogsService } from '../access-logs/access-logs.service';
import { RegisterDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserRole } from '@prisma/client';

interface ValidatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePicture: string | null;
}

interface JwtPayload {
  email: string;
  sub: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly accessLogsService: AccessLogsService,
  ) {}

  /**
   * Valida las credenciales del usuario
   */
  async validateUser(email: string, password: string): Promise<ValidatedUser> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * Registra un nuevo usuario
   */
  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, password, firstName, lastName, role, department, career } = registerDto;

    // Validar email institucional
    const emailDomain = this.configService.get<string>('UNIVERSIDAD_EMAIL_DOMAIN', '@unamad.edu.pe');
    if (!email.endsWith(emailDomain)) {
      throw new BadRequestException(`Email must be from institutional domain (${emailDomain})`);
    }

    // Verificar si el usuario ya existe
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hashear contraseña
    const bcryptRounds = Number.parseInt(this.configService.get<string>('BCRYPT_ROUNDS', '12'), 10);
    const hashedPassword = await bcrypt.hash(password, bcryptRounds);

    // Generar token de verificación
    const verificationToken = this.generateRandomToken();

    // Crear usuario con isVerified = false
    await this.usersService.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      department,
      career,
      verificationToken,
      isVerified: false,
    });

    // Enviar correo de verificación
    const emailSent = await this.emailService.sendVerificationEmail(email, firstName, verificationToken);

    if (emailSent) {
      this.logger.log(`Correo de verificación enviado a ${email}`);
    } else {
      this.logger.warn(`No se pudo enviar el correo de verificación a ${email}`);
    }

    return {
      message: 'Registro exitoso. Por favor revisa tu correo para verificar tu cuenta.',
    };
  }

  /**
   * Inicia sesión del usuario y retorna tokens
   */
  async login(user: ValidatedUser, ipAddress?: string, userAgent?: string): Promise<LoginResponseDto> {
    const payload: JwtPayload = { email: user.email, sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    // Guardar refresh token en la base de datos
    await this.usersService.updateRefreshToken(user.id, refreshToken);

    // Registrar log de acceso (non-blocking para evitar fallos en login)
    if (ipAddress) {
      this.accessLogsService
        .createAccessLog({
          userId: user.id,
          ipAddress,
          userAgent,
          success: true,
        })
        .catch((error) => {
          this.logger.warn(`Error al crear log de acceso: ${error.message}`);
        });
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    };
  }

  /**
   * Refresca el token de acceso usando el refresh token
   */
  async refreshTokens(userId: string, refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findById(userId);
    if (!user?.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access denied');
    }

    const payload: JwtPayload = { email: user.email, sub: user.id, role: user.role };
    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = await this.generateRefreshToken(payload);

    await this.usersService.updateRefreshToken(user.id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Cierra sesión del usuario eliminando el refresh token
   */
  async logout(userId: string): Promise<{ message: string }> {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logout successful' };
  }

  /**
   * Verifica el email con el token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.usersService.verifyUser(user.id);

    return { message: 'Email verified successfully. You can now login.' };
  }

  /**
   * Genera el refresh token
   */
  private async generateRefreshToken(payload: JwtPayload): Promise<string> {
    // 7 dias en segundos = 604800
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<number>('JWT_REFRESH_EXPIRES_IN_SECONDS', 604800),
    });

    return bcrypt.hash(refreshToken, 10);
  }

  /**
   * Genera un token aleatorio para verificación de email
   */
  private generateRandomToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Reenvía el correo de verificación
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('No existe una cuenta con este correo');
    }

    if (user.isVerified) {
      throw new BadRequestException('Esta cuenta ya está verificada');
    }

    // Generar nuevo token de verificación
    const newToken = this.generateRandomToken();
    await this.usersService.updateVerificationToken(user.id, newToken);

    // Enviar correo de verificación
    const emailSent = await this.emailService.sendVerificationEmail(email, user.firstName, newToken);

    if (!emailSent) {
      throw new BadRequestException('No se pudo enviar el correo de verificación');
    }

    return {
      message: 'Se ha enviado un nuevo correo de verificación',
    };
  }
}
