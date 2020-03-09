import { Column, ChildEntity } from 'typeorm';
import { User } from './User';

@ChildEntity()
export class FacebookUser extends User {
  @Column({ unique: true })
  facebookUserId: string;
}
