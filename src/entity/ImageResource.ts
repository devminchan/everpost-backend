import { TimestampEntity } from './TimestampEntity';
import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { Content } from './Content';

@Entity()
export class ImageResource extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  imageUrl: string;

  @ManyToOne(() => Content, { nullable: false })
  content: Content;
}
