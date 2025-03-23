import { Module } from '@nestjs/common';
import { WsGateway } from './ws.gateway';
import { WsAuthGuard } from './ws.auth.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET })],
  providers: [WsGateway, WsAuthGuard],
  exports: [WsGateway],
})
export class WsModule {}
