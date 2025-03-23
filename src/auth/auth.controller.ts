import { Controller, Post, Req, Res, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/logn.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentication') // Swagger tag/group for authentication endpoints
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request, invalid input.' })
  @ApiBody({
    type: RegisterDto,
    description: 'Registration details',
    examples: {
      example1: {
        summary: 'Register Example',
        value: {
          email: 'user@example.com',
          password: 'password123',
          name: 'John Doe'
        }
      }
    }
  })
  async register(
    @Body() body: RegisterDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const newUser = await this.authService.register(body);
      const tokens = await this.authService.generateTokens(newUser);
      await this.authService.tableToken(tokens.refresh, req.get('user-agent'));

      res.cookie('access_token', tokens.access, {
        httpOnly: true,
        maxAge: 3600 * 1000,
      });
      res.cookie('refresh_token', tokens.refresh, {
        httpOnly: true,
        maxAge: 24 * 3600 * 1000,
      });

      return res
        .status(201)
        .json({ message: 'User registered successfully' });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in an existing user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully, tokens generated.' })
  @ApiResponse({ status: 401, description: 'Unauthorized, invalid credentials.' })
  @ApiBody({
    type: LoginDto,
    description: 'Login credentials',
    examples: {
      example1: {
        summary: 'Login Example',
        value: {
          email: 'user@example.com',
          password: 'password123'
        }
      }
    }
  })
  async signIn(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const tokens = await this.authService.login(body, req.get('user-agent'));

      res.cookie('access_token', tokens.access, {
        httpOnly: true,
        maxAge: 3600 * 1000,
      });
      res.cookie('refresh_token', tokens.refresh, {
        httpOnly: true,
        maxAge: 24 * 3600 * 1000,
      });

      return res.status(200).json(tokens);
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Access token refreshed successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request, missing user agent.' })
  @ApiResponse({ status: 401, description: 'Unauthorized, invalid or missing refresh token.' })
  async refresh(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const refreshToken = req.cookies['refresh_token'];
      const userAgent = req.get('user-agent');

      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token missing' });
      }
      if (!userAgent) {
        return res.status(400).json({ message: 'User agent missing' });
      }

      const newToken = await this.authService.refreshAccessToken(
        refreshToken,
        userAgent,
      );
      res.cookie('access_token', newToken.access, {
        httpOnly: true,
        maxAge: 3600 * 1000,
      });

      return res.status(200).json(newToken.access);
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  }

  @Post('/logout')
  @ApiOperation({ summary: 'Log out the user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request, missing refresh token.' })
  async logout(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const refreshToken = req.cookies['refresh_token'];
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token missing' });
      }

      await this.authService.logout(refreshToken);
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}
