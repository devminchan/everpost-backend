import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  TableInheritance,
} from 'typeorm';
import { TimestampEntity } from './TimestampEntity';

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
}
