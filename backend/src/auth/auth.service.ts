import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string): Promise<any> {
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
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, password, firstName, lastName, role, department, career } = registerDto;

    // Validate institutional email
    const emailDomain = this.configService.get<string>('UNIVERSIDAD_EMAIL_DOMAIN', '@unamad.edu.pe');
    if (!email.endsWith(emailDomain)) {
      throw new BadRequestException(`Email must be from institutional domain (${emailDomain})`);
    }

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const bcryptRounds = Number.parseInt(this.configService.get<string>('BCRYPT_ROUNDS', '12'), 10);
    const hashedPassword = await bcrypt.hash(password, bcryptRounds);

    // Generate verification token
    const verificationToken = this.generateRandomToken();

    // Create user with isVerified = false
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

    // Send verification email
    const emailSent = await this.emailService.sendVerificationEmail(email, firstName, verificationToken);

    if (emailSent) {
      this.logger.log(`Verification email sent to ${email}`);
    } else {
      this.logger.warn(`Could not send verification email to ${email}. Token: ${verificationToken}`);
    }

    return {
      message: 'Registro exitoso. Por favor revisa tu correo para verificar tu cuenta.',
    };
  }

  /**
   * Login user and return tokens
   */
  async login(user: any): Promise<LoginResponseDto> {
    const payload = { email: user.email, sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    // Store refresh token in database
    await this.usersService.updateRefreshToken(user.id, refreshToken);

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
   * Refresh access token using refresh token
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

    const payload = { email: user.email, sub: user.id, role: user.role };
    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = await this.generateRefreshToken(payload);

    await this.usersService.updateRefreshToken(user.id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout user by removing refresh token
   */
  async logout(userId: string): Promise<{ message: string }> {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logout successful' };
  }

  /**
   * Verify email with token
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
   * Generate refresh token
   */
  private async generateRefreshToken(payload: any): Promise<string> {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return bcrypt.hash(refreshToken, 10);
  }

  /**
   * Generate random token for email verification
   */
  private generateRandomToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('No existe una cuenta con este correo');
    }

    if (user.isVerified) {
      throw new BadRequestException('Esta cuenta ya está verificada');
    }

    // Generate new verification token
    const newToken = this.generateRandomToken();
    await this.usersService.updateVerificationToken(user.id, newToken);

    // Send verification email
    const emailSent = await this.emailService.sendVerificationEmail(email, user.firstName, newToken);

    if (!emailSent) {
      throw new BadRequestException('No se pudo enviar el correo de verificación');
    }

    return {
      message: 'Se ha enviado un nuevo correo de verificación',
    };
  }
}
