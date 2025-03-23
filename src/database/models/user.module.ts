import { Column, Model, Table, PrimaryKey, DataType, Default } from 'sequelize-typescript';

@Table
export class User extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  password: string;

  @Default(0)
  @Column({ type: DataType.INTEGER, autoIncrement: false })
  balance: number

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;
}