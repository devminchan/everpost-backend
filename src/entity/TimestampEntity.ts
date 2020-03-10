import { BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class TimestampEntity extends BaseEntity {
  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  modifyDate: Date;
}
