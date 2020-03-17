import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  TableInheritance,
  OneToMany,
} from 'typeorm';
import { TimestampEntity } from './TimestampEntity';
import { Content } from './Content';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

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
    () => Content,
    content => content.user,
  )
  content: Content[];
}
