import { Column, BaseEntity } from 'typeorm';

export abstract class TimestampEntity extends BaseEntity {
  @Column({ type: 'timestamp' })
  createDate: Date;

  @Column({ type: 'timestamp' })
  modifyDate: Date;
}
