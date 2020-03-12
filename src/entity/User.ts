import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  TableInheritance,
  OneToMany,
} from 'typeorm';
import { TimestampEntity } from './TimestampEntity';
import { Content } from './Content';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  profileImage: string;

  @OneToMany(
    () => Content,
    content => content.user,
  )
  content: Content[];
}
