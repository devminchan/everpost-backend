import { AccountAccess } from './AccountAccess';
import { Column, Entity } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class PasswordAccountAccess extends AccountAccess {
  @IsNotEmpty()
  @Column({ nullable: false, type: 'varchar', length: 512 })
  password: string;
}
