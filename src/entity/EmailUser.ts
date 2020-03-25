import { Column, ChildEntity } from 'typeorm';
import { User } from './User';
import { IsNotEmpty } from 'class-validator';

@ChildEntity()
export class EmailUser extends User {
  @IsNotEmpty()
  @Column({ length: 512 })
  password: string;
}
