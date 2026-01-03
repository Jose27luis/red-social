import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { UserRole } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@unamad.edu.pe',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.STUDENT,
    profilePicture: null,
  };

  const mockRequest = {
    ip: '127.0.0.1',
    headers: {
      'user-agent': 'Mozilla/5.0 Test Browser',
      'x-forwarded-for': undefined,
    },
  } as unknown as Request;

  const mockLoginResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    user: mockUser,
  };

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      refreshTokens: jest.fn(),
      logout: jest.fn(),
      verifyEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(LocalAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtRefreshAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@unamad.edu.pe',
      password: 'Password123!',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'STUDENT' as const,
    };

    it('should register a new user', async () => {
      const expectedResponse = { message: 'Registration successful' };
      authService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@unamad.edu.pe',
      password: 'password123',
    };

    it('should login user and return tokens', async () => {
      authService.login.mockResolvedValue(mockLoginResponse as any);

      const result = await controller.login(loginDto, mockUser, mockRequest);

      expect(result).toEqual(mockLoginResponse);
      expect(authService.login).toHaveBeenCalledWith(mockUser, '127.0.0.1', 'Mozilla/5.0 Test Browser');
    });
  });

  describe('refreshTokens', () => {
    const refreshTokenDto = { refreshToken: 'old-refresh-token' };
    const userWithToken = { ...mockUser, refreshToken: 'old-refresh-token' };

    it('should refresh tokens', async () => {
      const newTokens = { accessToken: 'new-access', refreshToken: 'new-refresh' };
      authService.refreshTokens.mockResolvedValue(newTokens);

      const result = await controller.refreshTokens(refreshTokenDto, userWithToken);

      expect(result).toEqual(newTokens);
      expect(authService.refreshTokens).toHaveBeenCalledWith(userWithToken.id, userWithToken.refreshToken);
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const expectedResponse = { message: 'Logout successful' };
      authService.logout.mockResolvedValue(expectedResponse);

      const result = await controller.logout(mockUser);

      expect(result).toEqual(expectedResponse);
      expect(authService.logout).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with token', async () => {
      const expectedResponse = { message: 'Email verified successfully' };
      authService.verifyEmail.mockResolvedValue(expectedResponse);

      const result = await controller.verifyEmail('valid-token');

      expect(result).toEqual(expectedResponse);
      expect(authService.verifyEmail).toHaveBeenCalledWith('valid-token');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const result = await controller.getCurrentUser(mockUser);

      expect(result).toEqual(mockUser);
    });
  });
});
