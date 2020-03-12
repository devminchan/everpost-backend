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

  @Column()
  title: string;

  @OneToMany(
    () => FileResource,
    fileResource => fileResource.content,
  )
  fileResources: FileResource[];
}
