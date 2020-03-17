import { TimestampEntity } from './TimestampEntity';
import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { Content } from './Content';
import { IsNumber, IsNotEmpty } from 'class-validator';

@Entity()
export class FileResource extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Column({ nullable: false })
  fileUrl: string;

  @ManyToOne(
    () => Content,
    content => content.fileResources,
    { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  content!: Content;
}
