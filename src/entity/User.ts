import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  TableInheritance,
  OneToMany,
} from 'typeorm';
import { TimestampEntity } from './TimestampEntity';
import { Post } from './Post';
import { IsEmail, IsNotEmpty } from 'class-validator';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
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
}
