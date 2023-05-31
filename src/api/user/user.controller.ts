import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { instanceToPlain } from 'class-transformer';
import { CommonGroups } from 'src/database/enum/common-groups.enum';
import { UserGroups } from 'src/database/enum/user-groups.enum';
import { UserFilter } from './dto/user-filter.dto';
import { UserUpdate } from './dto/user-update.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('user')
@Controller('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(@Query() filter: UserFilter) {
    try {
      const { limit, page, getPageCount } = filter;
      const [users, count] = await this.userService.findAllAndCounted(filter);

      const data = instanceToPlain(users, {
        groups: [CommonGroups.COMMON_VIEW, UserGroups.USER_LIST],
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
      const user = await this.userService.findOne({
        where: { id: id },
      });

      if (!user) {
        throw new BadRequestException('data not found.');
      }

      const data = instanceToPlain(user, {
        groups: [CommonGroups.COMMON_VIEW, UserGroups.USER_VIEW],
      });
      return { data: data };
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UserUpdate,
  ) {
    try {
      const user = await this.userService.updated(id, body);
      const data = instanceToPlain(user, {
        groups: [CommonGroups.COMMON_VIEW, UserGroups.USER_LIST],
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
      const user = await this.userService.findOne({
        where: { id: id },
      });

      if (!user) {
        throw new BadRequestException('data not found.');
      }

      await user.softRemove();
      return {
        data: {},
        message: 'สำเร็จ',
      };
    } catch (error) {
      throw error;
    }
  }
}
