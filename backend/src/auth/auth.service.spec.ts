import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { AccessLogsService } from '../access-logs/access-logs.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@unamad.edu.pe',
    password: 'hashedPassword123',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.STUDENT,
    isVerified: true,
    isActive: true,
    profilePicture: null,
    refreshToken: 'hashedRefreshToken',
    verificationToken: null,
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateRefreshToken: jest.fn(),
      findByVerificationToken: jest.fn(),
      verifyUser: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      signAsync: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const mockEmailService = {
      sendVerificationEmail: jest.fn().mockResolvedValue(true),
    };

    const mockAccessLogsService = {
      createAccessLog: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: AccessLogsService, useValue: mockAccessLogsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data without password when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@unamad.edu.pe', 'password123');

      expect(result).toBeDefined();
      expect(result.email).toBe(mockUser.email);
      expect(result.id).toBe(mockUser.id);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.validateUser('notfound@unamad.edu.pe', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser('test@unamad.edu.pe', 'wrongpassword')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is not verified', async () => {
      const unverifiedUser = { ...mockUser, isVerified: false };
      usersService.findByEmail.mockResolvedValue(unverifiedUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.validateUser('test@unamad.edu.pe', 'password123')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is not active', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.findByEmail.mockResolvedValue(inactiveUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.validateUser('test@unamad.edu.pe', 'password123')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@unamad.edu.pe',
      password: 'Password123!',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'STUDENT' as const,
      department: 'Ingeniería',
      career: 'Sistemas',
    };

    beforeEach(() => {
      configService.get.mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'UNIVERSIDAD_EMAIL_DOMAIN') return '@unamad.edu.pe';
        if (key === 'BCRYPT_ROUNDS') return '12';
        return defaultValue;
      });
    });

    it('should register a new user successfully', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser as any);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.register(registerDto);

      expect(result.message).toContain('Registro exitoso');
      expect(usersService.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for non-institutional email', async () => {
      const invalidDto = { ...registerDto, email: 'user@gmail.com' };

      await expect(service.register(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      jwtService.sign.mockReturnValue('accessToken');
      jwtService.signAsync.mockResolvedValue('refreshToken');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');
      usersService.updateRefreshToken.mockResolvedValue(mockUser as any);

      const result = await service.login(mockUser, '127.0.0.1', 'Mozilla/5.0 Test');

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe(mockUser.id);
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens when refresh token is valid', async () => {
      usersService.findById.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('newAccessToken');
      jwtService.signAsync.mockResolvedValue('newRefreshToken');
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedRefreshToken');
      usersService.updateRefreshToken.mockResolvedValue(mockUser as any);

      const result = await service.refreshTokens('user-123', 'validRefreshToken');

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.refreshTokens('invalid-id', 'token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when refresh token does not match', async () => {
      usersService.findById.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refreshTokens('user-123', 'invalidToken')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should clear refresh token and return success message', async () => {
      usersService.updateRefreshToken.mockResolvedValue(mockUser as any);

      const result = await service.logout('user-123');

      expect(result.message).toBe('Logout successful');
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith('user-123', null);
    });
  });

  describe('verifyEmail', () => {
    it('should verify user email successfully', async () => {
      usersService.findByVerificationToken.mockResolvedValue(mockUser as any);
      usersService.verifyUser.mockResolvedValue(mockUser as any);

      const result = await service.verifyEmail('valid-token');

      expect(result.message).toContain('Email verified successfully');
    });

    it('should throw BadRequestException for invalid token', async () => {
      usersService.findByVerificationToken.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(BadRequestException);
    });
  });
});
