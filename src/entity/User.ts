import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  TableInheritance,
} from 'typeorm';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ nullable: false })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  profileImage: string;
}
