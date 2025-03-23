import { MiddlewareConsumer, Module, NestModule, RequestMethod, Get } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { RedisOptions } from './configs/app-options.constants';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './database/models/user.module';
import { Tokens } from './database/models/token.module';
import { Transaction } from './database/models/transaction.module';
import { TransactionsController } from './transactions/transactions.controller';
import { WsModule } from './ws/ws.module';
import { ScheduleModule } from '@nestjs/schedule';
import { QueueModule } from './queue/queue.module';





@Module({
  imports: [DatabaseModule, AuthModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET
  }),
    TransactionsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync(RedisOptions),
    SequelizeModule.forFeature([User, Tokens, Transaction]),
    WsModule,
    ScheduleModule.forRoot(),
    QueueModule,
],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes(TransactionsController);
  }
}