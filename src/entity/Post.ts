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
import { Length } from 'class-validator';

@Entity()
export class Post extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // eager option 설정 가능
  @ManyToOne(
    () => User,
    user => user.posts,
    { eager: true, nullable: false, onDelete: 'CASCADE' },
  )
  user!: User;

  @Length(1, 512)
  @Column()
  title: string;

  @Length(1, 65535)
  @Column()
  content: string;

  @OneToMany(
    () => FileResource,
    fileResource => fileResource.post,
  )
  fileResources: FileResource[];
}
