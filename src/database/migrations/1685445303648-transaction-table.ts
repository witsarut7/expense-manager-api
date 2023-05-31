import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';
import { TableName } from '../table-name.enum';
import { defaultTableOptions } from '../default-table-options';

export class transactionTable1685445303648 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: TableName.TRANSACTION,
        columns: [
          ...defaultTableOptions,
          {
            name: 'amount',
            type: 'numeric',
            precision: 10,
            scale: 2,
            default: 0.0,
            isNullable: true,
          },
          {
            name: 'note',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'category_id',
            type: 'int4',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'int4',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys(TableName.TRANSACTION, [
      new TableForeignKey({
        columnNames: ['category_id'],
        referencedTableName: TableName.CATEGORY,
        referencedColumnNames: ['id'],
      }),
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: TableName.USER,
        referencedColumnNames: ['id'],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(TableName.TRANSACTION);
  }
}
