import { BadRequestException, Injectable } from '@nestjs/common';
import { TransactionCreate } from './dto/transaction-create.dto';
import { TransactionUpdate } from './dto/transaction-update.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/database/entities/transaction.entity';
import { FindOneOptions, In, Repository } from 'typeorm';
import { IJwtUserDecorator } from 'src/shared/jwt.decorator';
import { TransactionFilter } from './dto/transaction-filter.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async created(
    body: TransactionCreate,
    user: IJwtUserDecorator,
  ): Promise<Transaction> {
    try {
      const { categoryId, ...transactionDto } = body;
      const transaction = await this.transactionRepository
        .create({
          ...transactionDto,
          categoryId: categoryId,
          createdById: user?.data?.id,
        })
        .save();

      return transaction;
    } catch (error) {
      throw error;
    }
  }

  async findAllAndCounted(
    filter: TransactionFilter,
  ): Promise<[Transaction[], number]> {
    try {
      const { pagination, getOffset, limit, startDate, endDate, categoryId } =
        filter;

      const queryBuilder = this.transactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.category', 'category')
        .leftJoinAndSelect('transaction.createdBy', 'createdBy');

      if (categoryId) {
        queryBuilder.andWhere('category.id = :id', {
          id: categoryId,
        });
      }

      if (startDate && endDate) {
        queryBuilder.andWhere(
          'transaction.createdAt BETWEEN :startDate AND :endDate',
          { startDate, endDate },
        );
      }

      if (pagination) {
        queryBuilder.skip(getOffset(filter)).take(limit);
      }

      queryBuilder.orderBy('transaction.updatedAt', 'DESC');
      return await queryBuilder.getManyAndCount();
    } catch (error) {
      throw error;
    }
  }

  async getSummarizedExpensesByDateAndCategory(
    filter: TransactionFilter,
  ): Promise<number> {
    const { startDate, endDate, categoryId } = filter;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category');

    if (categoryId) {
      queryBuilder.andWhere('category.id = :id', {
        id: categoryId,
      });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'transaction.createdAt BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
    }

    const expenses = await queryBuilder.getMany();

    const totalExpenseAmount = expenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0,
    );

    return totalExpenseAmount;
  }

  async findOne(options: FindOneOptions<Transaction>): Promise<Transaction> {
    return await this.transactionRepository.findOne(options);
  }

  async updated(id: number, body: TransactionUpdate) {
    try {
      const transaction = await this.findOne({ where: { id: id } });
      const { categoryId, ...transactionDto } = body;

      if (!transaction) {
        throw new BadRequestException('data not found.');
      }

      const _transaction = await this.transactionRepository
        .merge(transaction, {
          ...transactionDto,
          categoryId: categoryId,
        })
        .save();
      return _transaction;
    } catch (error) {
      throw error;
    }
  }

  async bulkRemove(ids: number[]): Promise<void> {
    try {
      const findRemoves = await this.transactionRepository.find({
        where: { id: In(ids) },
      });

      await this.transactionRepository.softRemove(findRemoves);
      return;
    } catch (error) {
      throw error;
    }
  }
}
