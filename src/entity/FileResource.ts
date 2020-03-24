import { TimestampEntity } from './TimestampEntity';
import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { Post } from './Post';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class FileResource extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Column({ nullable: false })
  fileUrl: string;

  @ManyToOne(
    () => Post,
    content => content.fileResources,
    { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  post!: Post;
}
