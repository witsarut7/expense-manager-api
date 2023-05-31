import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class TransactionUpdate {
  @ApiProperty({ required: false })
  @IsNumber()
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  note: string;

  @ApiProperty({ required: false })
  @IsNumber()
  categoryId: number;
}
