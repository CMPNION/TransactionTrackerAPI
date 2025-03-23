import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { User } from './user.module';

@Table
export class Transaction extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @Column({ type: DataType.FLOAT})
  amount: number;

  @Column({ type: DataType.STRING})
  type: string;

  @Column({ type: DataType.STRING})
  category: string;

  @Column({ type: DataType.STRING})
  description: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING})
  userEmail: string;
}