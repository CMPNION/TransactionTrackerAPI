import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { User } from 'src/database/models/user.module';

@Processor('balance')
@Injectable()
export class BalanceProcessor {
  @Process('updateBalance')
  async handleBalanceUpdate(job: Job<{ userEmail: string; amount: number; type: string }>) {
    const { userEmail, amount, type } = job.data;

    console.log(` Processing balance for ${userEmail}`);

    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      console.error(`user ${userEmail} is not found`);
      return;
    }

    if (type.toLowerCase() === 'income') {
      user.balance = (user.balance || 0) + amount;
    } else if (type.toLowerCase() === 'expense') {
      user.balance = (user.balance || 0) - amount;
    }

    await user.save();
    console.log(`Updated balance:  ${userEmail}: ${user.balance}`);
  }
}
