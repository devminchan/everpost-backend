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

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column()
  title: string;

  @OneToMany(
    () => FileResource,
    fileResource => fileResource.content,
  )
  fileResources: FileResource[];
}
