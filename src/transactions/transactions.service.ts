import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Injectable, Inject, ForbiddenException, NotFoundException, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { Transaction } from 'src/database/models/transaction.module';
import { NewTransactionDto } from './dto/newtransaction.dto';
import { User } from 'src/database/models/user.module';
import { WsGateway } from 'src/ws/ws.gateway';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class TransactionsService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache,
              private readonly wsGateway: WsGateway,
              @InjectQueue('balance') private readonly balanceQueue: Queue) {}

  async processTransactions(): Promise<any> {
    const cachedTransactions = await this.cacheManager.get("transactions");
    console.log(cachedTransactions);
    if (!cachedTransactions) {
      const data = await Transaction.findAll();
      await this.cacheManager.set("transactions", JSON.stringify(data), 30);
      return data;
    }
    return JSON.parse(cachedTransactions as string);
  }

  async createTransaction(@Body() body: NewTransactionDto, @Req() req: Request) {
    if (!req.user || !req.user.email) {
      throw new ForbiddenException("User is not authenticated");
    }
    const userEmail = req.user.email;
    console.log("Creating transaction for user:", userEmail);

    const newTransaction = await Transaction.create({
      amount: body.amount,
      type: body.type,
      category: body.category,
      description: body.description,
      userEmail: userEmail,
    });

    await this.balanceQueue.add('updateBalance', {
      userEmail,
      amount: body.amount,
      type: body.type,
    });

    return newTransaction;
  }

  async updateTransaction(id: number, body: Partial<NewTransactionDto>, req: Request) {
    if (!req.user || !req.user.email) {
      throw new ForbiddenException("User is not authenticated");
    }
    const userEmail = req.user.email;
    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }
    if (transaction.userEmail !== userEmail) {
      throw new ForbiddenException("Not allowed to update this transaction");
    }

    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const oldAmount = transaction.amount;
    const newAmount = body.amount !== undefined ? body.amount : oldAmount;

    if (transaction.type.toLowerCase() === 'income') {
      // Increment balance by the difference
      user.balance = (user.balance || 0) + (newAmount - oldAmount);
    } else if (transaction.type.toLowerCase() === 'expense') {
      user.balance = (user.balance || 0) - (newAmount - oldAmount);
    }
    await user.save();

    await transaction.update(body);
    await this.cacheManager.del("transactions");
    this.wsGateway.sendNotification(req.user.email, "Transaction updated: ", body)
    return transaction;
  }

  async deleteTransaction(id: number, req: Request) {
    if (!req.user || !req.user.email) {
      throw new ForbiddenException("User is not authenticated");
    }
    const userEmail = req.user.email;
    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }
    if (transaction.userEmail !== userEmail) {
      throw new ForbiddenException("Not allowed to delete this transaction");
    }

    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (transaction.type.toLowerCase() === 'income') {
      user.balance = (user.balance || 0) - transaction.amount;
    } else if (transaction.type.toLowerCase() === 'expense') {
      user.balance = (user.balance || 0) + transaction.amount;
    }
    await user.save();
    this.wsGateway.sendNotification(req.user.email, "Transaction deleted: ", transaction)
    await transaction.destroy();
    await this.cacheManager.del("transactions");
    return { message: "Transaction deleted successfully" };
  }

  async getTransaction(id: number, req: Request) {
    if (!req.user || !req.user.email) {
      throw new ForbiddenException("User is not authenticated");
    }
    const userEmail = req.user.email;
    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }
    if (transaction.userEmail !== userEmail) {
      throw new ForbiddenException("Not allowed to access this transaction");
    }
    return transaction;
  }


  async paginateTransactions(transactions: any[]): Promise<any> {
    const pageSize = 5;
    const pages: { [key: string]: any[] } = {};

    transactions.forEach((transaction, index) => {
      const pageNumber = Math.floor(index / pageSize) + 1;
      const key = `page${pageNumber}`;
      if (!pages[key]) {
        pages[key] = [];
      }
      pages[key].push(transaction);
    });

    return pages;
  }
}
