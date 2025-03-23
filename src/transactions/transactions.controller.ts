import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Req, 
  Res 
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Request, Response } from 'express';
import { NewTransactionDto } from './dto/newtransaction.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Transactions') // Group name for Swagger documentation
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('/')
  @ApiOperation({ summary: 'Retrieve all transactions paginated' })
  @ApiResponse({ status: 200, description: 'Paginated list of transactions returned successfully.' })
  async getAll(@Res() res: Response) {
    const transactions = await this.transactionsService.processTransactions();
    const result = await this.transactionsService.paginateTransactions(transactions);
    return res.status(200).json(result);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Retrieve a transaction by its ID' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully.' })
  async getOne(@Param('id') id: number, @Req() req: Request, @Res() res: Response) {
    const transaction = await this.transactionsService.getTransaction(id, req);
    return res.status(200).json(transaction);
  }

  @Post('/')
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 200, description: 'The transaction has been created successfully.' })
  @ApiBody({
      type: NewTransactionDto,
      description: 'Transaction Creation form',
      examples: {
        example1: {
          summary: 'New transaction example',
          value: {
            amount: 100,
            type: 'expense',
            category: 'eats',
            description: "Cheese and milk "
          }
        }
      }
    })
  async createTransaction(
    @Body() body: NewTransactionDto, 
    @Req() req: Request, 
    @Res() res: Response
  ) {
    const result = await this.transactionsService.createTransaction(body, req);
    return res.status(200).json(result);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update an existing transaction that belongs to user' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully.' })
  @ApiBody({
    type: NewTransactionDto,
    description: 'Transaction updation form',
    examples: {
      example1: {
        summary: 'Update transaction example',
        value: {
          amount: 100,
          type: 'income',
          category: 'eats',
          description: "Cheese and milk was bad... "
        }
      }
    }
  })
  async updateTransaction(
    @Param('id') id: number, 
    @Body() body: any, 
    @Req() req: Request, 
    @Res() res: Response
  ) {
    const updatedTransaction = await this.transactionsService.updateTransaction(id, body, req);
    return res.status(200).json(updatedTransaction);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully.' })
  async deleteTransaction(
    @Param('id') id: number, 
    @Req() req: Request, 
    @Res() res: Response
  ) {
    const result = await this.transactionsService.deleteTransaction(id, req);
    return res.status(200).json(result);
  }
}