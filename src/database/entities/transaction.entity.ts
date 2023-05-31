import { Exclude, Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TableName } from '../table-name.enum';
import { CommonEntity } from '../common-entity';
import { TransactionGroups } from '../enum/transaction-groups.enum';
import { Category } from './category.entity';
import { User } from './user.entity';

@Entity(TableName.TRANSACTION)
export class Transaction extends CommonEntity {
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0.0,
    nullable: true,
  })
  @Expose({
    groups: [
      TransactionGroups.TRANSACTION_LIST,
      TransactionGroups.TRANSACTION_VIEW,
    ],
  })
  amount: number;

  @Column({ type: 'text', nullable: true })
  @Expose({
    groups: [
      TransactionGroups.TRANSACTION_LIST,
      TransactionGroups.TRANSACTION_VIEW,
    ],
  })
  note: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Exclude()
  @Column({ name: 'category_id', nullable: true })
  categoryId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  createdBy: User;

  @Exclude()
  @Column({ name: 'user_id', nullable: true })
  createdById: number;
}
