import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CommonFilter } from 'src/shared/common-filter';

export class TransactionFilter extends CommonFilter {
  @ApiProperty({ required: false, example: '2023-01-01' })
  @IsOptional()
  startDate: Date;

  @ApiProperty({ required: false, example: '2023-01-31' })
  @IsOptional()
  endDate: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  categoryId: number;
}
