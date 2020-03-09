import { TimestampEntity } from './TimestampEntity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { ImageResource } from './ImageResource';

@Entity()
export class Content extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @OneToMany(
    () => ImageResource,
    imageResource => imageResource.content,
  )
  imageResources: [ImageResource];
}
