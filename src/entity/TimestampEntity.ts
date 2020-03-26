import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import ValidationEntity from 'validation-entity';

export abstract class TimestampEntity extends ValidationEntity {
  @CreateDateColumn({ type: 'datetime' })
  createDate: Date;

  @UpdateDateColumn({ type: 'datetime' })
  modifyDate: Date;
}
