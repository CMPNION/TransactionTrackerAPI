import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SchedulerService } from 'src/cron/scedule.service';
import { BalanceProcessor } from './processors/balance.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'balance',
    }),
  ],
  providers: [BalanceProcessor, SchedulerService],
  exports: [BullModule],
})
export class QueueModule {}
