import { TimestampEntity } from './TimestampEntity';
import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { Content } from './Content';

@Entity()
export class FileResource extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  fileUrl: string;

  @ManyToOne(
    () => Content,
    content => content.fileResources,
    { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  content!: Content;
}
