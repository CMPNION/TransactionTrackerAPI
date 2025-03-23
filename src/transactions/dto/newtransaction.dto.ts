import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NewTransactionDto {
  @ApiProperty({
    description: 'The amount of the transaction',
    example: 100.5,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Transaction type (e.g., "income" or "expense")',
    example: 'income',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Category of the transaction',
    example: 'salary',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({
    description: 'Additional description of the transaction',
    example: 'Monthly salary deposit',
  })
  @IsString()
  @IsOptional()
  description: string;
}