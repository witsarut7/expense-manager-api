import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionCreate } from './dto/transaction-create.dto';
import { TransactionUpdate } from './dto/transaction-update.dto';
import { IJwtUserDecorator, JwtDecorator } from 'src/shared/jwt.decorator';
import { instanceToPlain } from 'class-transformer';
import { CommonGroups } from 'src/database/enum/common-groups.enum';
import { TransactionGroups } from 'src/database/enum/transaction-groups.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransactionFilter } from './dto/transaction-filter.dto';
import { CategoryGroups } from 'src/database/enum/category-groups.enum';
import { UserGroups } from 'src/database/enum/user-groups.enum';
import { MultiSelect } from 'src/shared/multi-select.dto';

@ApiTags('transaction')
@Controller('transaction')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async created(
    @Body() body: TransactionCreate,
    @JwtDecorator() user: IJwtUserDecorator,
  ) {
    try {
      const transaction = await this.transactionService.created(body, user);
      const data = instanceToPlain(transaction, {
        groups: [CommonGroups.COMMON_VIEW, TransactionGroups.TRANSACTION_LIST],
      });

      return { data: data };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  async findAll(@Query() filter: TransactionFilter) {
    try {
      const { limit, page, getPageCount } = filter;
      const [transactions, count] =
        await this.transactionService.findAllAndCounted(filter);

      const data = instanceToPlain(transactions, {
        groups: [
          CommonGroups.COMMON_VIEW,
          TransactionGroups.TRANSACTION_LIST,
          CategoryGroups.CATEGORY_LIST,
          UserGroups.USER_LIST,
        ],
      });

      return {
        data: data,
        count: count,
        page: page,
        limit: limit,
        pageCount: getPageCount(limit, count),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('total-expense-amount')
  async getSummarizedExpensesByDateAndCategory(
    @Query() filter: TransactionFilter,
  ) {
    try {
      const totalExpenseAmount =
        await this.transactionService.getSummarizedExpensesByDateAndCategory(
          filter,
        );

      return {
        totalExpenseAmount: totalExpenseAmount,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const transaction = await this.transactionService.findOne({
        where: { id: id },
        relations: ['category', 'createdBy'],
      });

      if (!transaction) {
        throw new BadRequestException('data not found.');
      }

      const data = instanceToPlain(transaction, {
        groups: [
          CommonGroups.COMMON_VIEW,
          TransactionGroups.TRANSACTION_VIEW,
          CategoryGroups.CATEGORY_VIEW,
          UserGroups.USER_VIEW,
        ],
      });
      return { data: data };
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: TransactionUpdate,
  ) {
    try {
      const transaction = await this.transactionService.updated(id, body);
      const data = instanceToPlain(transaction, {
        groups: [CommonGroups.COMMON_VIEW, TransactionGroups.TRANSACTION_LIST],
      });
      return {
        data: data,
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete('bulk')
  async bulkRemove(@Body() body: MultiSelect) {
    try {
      await this.transactionService.bulkRemove(body.ids);
      return {
        data: {},
        message: 'สำเร็จ',
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const transaction = await this.transactionService.findOne({
        where: { id: id },
      });

      if (!transaction) {
        throw new BadRequestException('data not found.');
      }

      await transaction.softRemove();
      return {
        data: {},
        message: 'สำเร็จ',
      };
    } catch (error) {
      throw error;
    }
  }
}
