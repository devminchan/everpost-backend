import { ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { TimestampEntity } from './TimestampEntity';

export abstract class AccountAccess extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => User,
    user => user.accountAccessList,
    { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  user: User;
}
