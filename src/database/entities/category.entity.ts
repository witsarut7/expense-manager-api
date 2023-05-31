import { Expose } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { TableName } from '../table-name.enum';
import { CommonEntity } from '../common-entity';
import { CategoryGroups } from '../enum/category-groups.enum';

@Entity(TableName.CATEGORY)
export class Category extends CommonEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose({
    groups: [CategoryGroups.CATEGORY_LIST, CategoryGroups.CATEGORY_VIEW],
  })
  title: string;

  @Column({ type: 'text', nullable: true })
  @Expose({
    groups: [CategoryGroups.CATEGORY_LIST, CategoryGroups.CATEGORY_VIEW],
  })
  description: string;
}
