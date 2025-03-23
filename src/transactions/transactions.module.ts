import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { WsGateway } from 'src/ws/ws.gateway';
import { BullModule } from '@nestjs/bull';


@Module({
  imports: [BullModule.registerQueue({
    name: 'balance',
  })],
  controllers: [TransactionsController],
  providers: [TransactionsService, WsGateway],
})
export class TransactionsModule {}
