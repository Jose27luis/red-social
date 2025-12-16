import { Controller, Post, Body, UseGuards, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ==========================================
  // REGISTER - Rate limit: 3 requests/segundo
  // Previene spam de registros
  // ==========================================
  @Post('register')
  @Throttle({ short: { ttl: 1000, limit: 3 } }) // 3 intentos por segundo
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // ==========================================
  // LOGIN - Rate limit: 5 requests/minuto
  // Previene ataques de brute force
  // ==========================================
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { ttl: 60000, limit: 5 } }) // 5 intentos por minuto
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too many login attempts. Try again later.' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async login(@Body() loginDto: LoginDto, @CurrentUser() user: any) {
    return this.authService.login(user);
  }

  // ==========================================
  // REFRESH TOKEN - Rate limit: 10 requests/minuto
  // Previene abuso de refresh tokens
  // ==========================================
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ medium: { ttl: 60000, limit: 10 } }) // 10 intentos por minuto
  @UseGuards(JwtRefreshAuthGuard)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto, @CurrentUser() user: any) {
    return this.authService.refreshTokens(user.id, user.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.id);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // ==========================================
  // GET ME - Sin rate limit estricto
  // Usuario autenticado puede consultar sus datos frecuentemente
  // ==========================================
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Current user retrieved' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getCurrentUser(@CurrentUser() user: any) {
    return user;
  }
}
