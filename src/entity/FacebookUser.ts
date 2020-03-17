import { Column, ChildEntity } from 'typeorm';
import { User } from './User';
import { IsNotEmpty } from 'class-validator';

@ChildEntity()
export class FacebookUser extends User {
  @IsNotEmpty()
  @Column({ unique: true })
  facebookUserId: string;
}
