import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/register.dto';
import { LoginUserDto } from './dtos/login.dto';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginResponseDto } from './dtos/login-response.dto';
import { Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request as ReqDecorator } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { UserRole } from './entities/user.entity'; // Import UserRole
import { Roles } from './decorators/roles.decorator'; // Import Roles decorator
import { RolesGuard } from './guards/roles.guard';
import { UnauthorizedException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @SkipThrottle({ default: true })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User with email already exists.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed.' })
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle({ default: true })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed.' })
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 200, description: 'User profile data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@ReqDecorator() req: ExpressRequest) {
    return req.user;
  }
  @Get('admin-dashboard')
  @UseGuards(AuthGuard('jwt'), RolesGuard) // First AuthGuard, then RolesGuard
  @Roles(UserRole.ADMIN) // Only ADMINs can access
  @ApiResponse({ status: 200, description: 'Admin dashboard data.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient roles.' })
  getAdminDashboard(@ReqDecorator() req: ExpressRequest) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const user = req.user as User;
    return { message: `Welcome, Admin ${user.email}!`, user };
  }

  @Get('user-dashboard')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN) // Both USER and ADMIN can access
  @ApiResponse({ status: 200, description: 'User dashboard data.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient roles.' })
  getUserDashboard(@ReqDecorator() req: ExpressRequest) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const user = req.user as User;
    return {
      message: `Welcome, ${user.role} ${user.email}!`,
      user,
    };
  }
}
