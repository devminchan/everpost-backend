import { TimestampEntity } from './TimestampEntity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Column,
} from 'typeorm';
import { User } from './User';
import { ImageResource } from './ImageResource';

@Entity()
export class Content extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  title: string;

  @OneToMany(
    () => ImageResource,
    imageResource => imageResource.content,
  )
  imageResources: [ImageResource];
}
