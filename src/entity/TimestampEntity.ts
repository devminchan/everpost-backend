import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ValidationEntity } from './ValidationEntity';

export abstract class TimestampEntity extends ValidationEntity {
  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  modifyDate: Date;
}
