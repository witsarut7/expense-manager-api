import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  ParseIntPipe,
  BadRequestException,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryCreate } from './dto/category-create.dto';
import { instanceToPlain } from 'class-transformer';
import { CommonGroups } from 'src/database/enum/common-groups.enum';
import { CategoryGroups } from 'src/database/enum/category-groups.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CategoryFilter } from './dto/category-filter.dto';
import { CategoryUpdate } from './dto/category-update.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('category')
@Controller('category')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async created(@Body() body: CategoryCreate) {
    try {
      const category = await this.categoryService.created(body);
      const data = instanceToPlain(category, {
        groups: [CommonGroups.COMMON_VIEW, CategoryGroups.CATEGORY_LIST],
      });

      return { data: data };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  async findAll(@Query() filter: CategoryFilter) {
    try {
      const { limit, page, getPageCount } = filter;
      const [categorys, count] = await this.categoryService.findAllAndCounted(
        filter,
      );

      const data = instanceToPlain(categorys, {
        groups: [CommonGroups.COMMON_VIEW, CategoryGroups.CATEGORY_LIST],
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

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const category = await this.categoryService.findOne({
        where: { id: id },
      });

      if (!category) {
        throw new BadRequestException('data not found.');
      }

      const data = instanceToPlain(category, {
        groups: [CommonGroups.COMMON_VIEW, CategoryGroups.CATEGORY_VIEW],
      });
      return { data: data };
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CategoryUpdate,
  ) {
    try {
      const category = await this.categoryService.updated(id, body);
      const data = instanceToPlain(category, {
        groups: [CommonGroups.COMMON_VIEW, CategoryGroups.CATEGORY_LIST],
      });
      return {
        data: data,
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const category = await this.categoryService.findOne({
        where: { id: id },
      });

      if (!category) {
        throw new BadRequestException('data not found.');
      }

      await category.softRemove();
      return {
        data: {},
        message: 'สำเร็จ',
      };
    } catch (error) {
      throw error;
    }
  }
}
