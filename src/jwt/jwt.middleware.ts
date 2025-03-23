import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        email:string,
        name:string
      };
    }
  }
}
@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies['access_token'];
    if (!token) {
      throw new UnauthorizedException("Invalid or missing token");
    }
    console.log("Token exist")

    try {
      const decoded = await this.jwtService.verifyAsync(token);
      console.log("Token verified")

      req.user = decoded;
      console.log(req.user)
      next();
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}