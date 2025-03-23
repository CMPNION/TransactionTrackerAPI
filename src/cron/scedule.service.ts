import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  @Cron('0 12 * * *', {
    timeZone: 'Europe/Moscow',
  })
  handleDailyReminder() {
    this.logger.log('Андрей, проверь финансы...');
  }
}
