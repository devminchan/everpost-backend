import { PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { TimestampEntity } from './TimestampEntity';

export abstract class AccountAccess extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(
    () => User,
    user => user.passwordAccountAccess,
    { nullable: false, onDelete: 'CASCADE' },
  )
  @JoinColumn()
  user: User;
}
