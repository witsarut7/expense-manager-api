import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/database/entities/category.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CategoryCreate } from './dto/category-create.dto';
import { CategoryFilter } from './dto/category-filter.dto';
import { CategoryUpdate } from './dto/category-update.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async created(body: CategoryCreate): Promise<Category> {
    try {
      const category = await this.categoryRepository.create(body).save();

      return category;
    } catch (error) {
      throw error;
    }
  }

  async findAllAndCounted(
    filter: CategoryFilter,
  ): Promise<[Category[], number]> {
    try {
      const { pagination, getOffset, limit, title } = filter;

      const queryBuilder =
        this.categoryRepository.createQueryBuilder('category');

      if (title) {
        queryBuilder.andWhere('category.title ilike :title', {
          title: `%${title}%`,
        });
      }

      if (pagination) {
        queryBuilder.skip(getOffset(filter)).take(limit);
      }

      queryBuilder.orderBy('category.updatedAt', 'DESC');
      return await queryBuilder.getManyAndCount();
    } catch (error) {
      throw error;
    }
  }

  async findOne(options: FindOneOptions<Category>): Promise<Category> {
    return await this.categoryRepository.findOne(options);
  }

  async updated(id: number, body: CategoryUpdate) {
    try {
      const category = await this.findOne({ where: { id: id } });

      if (!category) {
        throw new BadRequestException('data not found.');
      }

      const _category = await this.categoryRepository
        .merge(category, {
          ...body,
        })
        .save();
      return _category;
    } catch (error) {
      throw error;
    }
  }
}
