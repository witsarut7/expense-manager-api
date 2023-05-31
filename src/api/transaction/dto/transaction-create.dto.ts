import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';

export class TransactionCreate {
  @ApiProperty({ required: true })
  @IsNumber()
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  note: string;

  @ApiProperty({ required: true })
  @IsNumber()
  categoryId: number;
}
