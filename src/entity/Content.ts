import { TimestampEntity } from './TimestampEntity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Column,
} from 'typeorm';
import { User } from './User';
import { FileResource } from './FileResource';
import { IsNumber, Length } from 'class-validator';

@Entity()
export class Content extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // eager option 설정 가능
  @ManyToOne(
    () => User,
    user => user.content,
    { nullable: false, onDelete: 'CASCADE' },
  )
  user!: User;

  @Length(1)
  @Column()
  title: string;

  @OneToMany(
    () => FileResource,
    fileResource => fileResource.content,
    { lazy: true },
  )
  fileResources: FileResource[] | Promise<FileResource[]>; // promise는 lazy loading을 위함
}
