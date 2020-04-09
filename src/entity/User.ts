import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { TimestampEntity } from './TimestampEntity';
import { Post } from './Post';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { PasswordAccountAccess } from './PasswordAccountAccess';

@Entity()
export class User extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Column({ nullable: false })
  username: string;

  @IsEmail()
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  profileImage: string;

  @OneToMany(
    () => Post,
    content => content.user,
  )
  posts: Post[];

  @OneToOne(
    () => PasswordAccountAccess,
    paa => paa.user,
  )
  passwordAccountAccess: PasswordAccountAccess;
}
