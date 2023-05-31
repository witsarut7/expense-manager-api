import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { Brackets, FindOneOptions, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserCreate } from './dto/user-create.dto';
import { UserFilter } from './dto/user-filter.dto';
import { UserUpdate } from './dto/user-update.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async compareHashPassword(
    password: string,
    hashPassword: string,
  ): Promise<Boolean> {
    return await bcrypt.compare(password, hashPassword);
  }

  async getHashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async created(body: UserCreate): Promise<User> {
    try {
      const { password, ...userDto } = body;

      if (body.username) {
        const findDuplicateUsername = await this.userRepository.findOne({
          where: { username: body.username },
        });

        if (findDuplicateUsername) {
          throw new BadRequestException('duplicate username in the system.');
        }
      }

      const hashPassword = await this.getHashPassword(password);

      const user = await this.userRepository
        .create({
          ...userDto,
          password: hashPassword,
        })
        .save();

      return user;
    } catch (error) {
      throw error;
    }
  }

  async findAllAndCounted(filter: UserFilter): Promise<[User[], number]> {
    try {
      const { pagination, getOffset, limit, name, phoneNumber, email } = filter;

      const queryBuilder = this.userRepository.createQueryBuilder('user');

      if (phoneNumber) {
        queryBuilder.andWhere('user.phoneNumber ilike :phoneNumber', {
          phoneNumber: `%${phoneNumber}%`,
        });
      }

      if (name) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.orWhere(
              "concat(user.firstName,' ', user.lastName) ilike :name",
              {
                name: `%${name}%`,
              },
            )
              .orWhere('user.firstName ilike :name', {
                name: `%${name}%`,
              })
              .orWhere('user.lastName ilike :name', {
                name: `%${name}%`,
              });
          }),
        );
      }

      if (email) {
        queryBuilder.andWhere('user.email ilike :email', {
          email: `%${email}%`,
        });
      }

      if (pagination) {
        queryBuilder.skip(getOffset(filter)).take(limit);
      }

      queryBuilder.orderBy('user.updatedAt', 'DESC');
      return await queryBuilder.getManyAndCount();
    } catch (error) {
      throw error;
    }
  }

  async findOne(options: FindOneOptions<User>): Promise<User> {
    return await this.userRepository.findOne(options);
  }

  async updated(id: number, body: UserUpdate) {
    try {
      const user = await this.findOne({ where: { id: id } });

      if (!user) {
        throw new BadRequestException('data not found.');
      }

      const _user = await this.userRepository
        .merge(user, {
          ...body,
        })
        .save();
      return _user;
    } catch (error) {
      throw error;
    }
  }
}
