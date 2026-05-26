import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Check, OneToMany } from 'typeorm';

@Entity('users')
@Check('length(name) >= 20')
@Check("role IN ('admin', 'user', 'store_owner')")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 60 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password?: string; // Optional field so we can exclude it when sending to client

  @Column({ length: 400 })
  address: string;

  @Column({ default: 'user', length: 20 })
  role: 'admin' | 'user' | 'store_owner';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
