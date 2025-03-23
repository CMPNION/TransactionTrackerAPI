import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/database/models/user.module';
import * as bcrypt from 'bcrypt';
import { Tokens } from 'src/database/models/token.module';
import { LoginDto } from './dto/logn.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(body: RegisterDto): Promise<User> {
    const existingUser = await User.findOne({ where: { email: body.email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const newUser = await User.create({
      email: body.email,
      password: hashedPassword,
      name: body.name,
    });

    return newUser;
  }

  async generateTokens(user: User) {
    const access_payload = {
      email: user.email,
      name: user.name,
    };
    const refresh_payload = {
      email: user.email,
    };

    const tokens = {
      access: await this.jwtService.signAsync(access_payload),
      refresh: await this.jwtService.signAsync(refresh_payload),
    };

    return tokens;
  }

  async tableToken(refresh_token: any, user_agent: any): Promise<Tokens> {
    if (!refresh_token || !user_agent) {
      throw new Error("Invalid token or user-agent");
    }

    const line = await Tokens.create({
      refresh_token: refresh_token,
      user_agent: user_agent,
    });

    return line;
  }

  async login(body: LoginDto, userAgent: string) {
    // Validate user existence by email
    const user = await User.findOne({ where: { email: body.email } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Compare provided password with stored hash
    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user);

    await this.tableToken(tokens.refresh, userAgent);

    return tokens;
  }

  async refreshAccessToken(refreshToken: string, userAgent: string): Promise<{ access: string, refresh: string }> {
    // Find the token record in the DB
    const tokenRecord = await Tokens.findOne({ where: { refresh_token: refreshToken } });
    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token not found');
    }

    if (tokenRecord.user_agent !== userAgent) {
      throw new UnauthorizedException('User agent mismatch');
    }

    // Verify the refresh token to obtain its payload
    let payload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Find the user based on the token payload
    const user = await User.findOne({ where: { email: payload.email } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new tokens for the user
    const tokens = await this.generateTokens(user);

    // Update the DB record with the new refresh token
    tokenRecord.refresh_token = tokens.refresh;
    await tokenRecord.save();

    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenRecord = await Tokens.findOne({ where: { refresh_token: refreshToken } });
    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    await tokenRecord.destroy();
  }
}
