import { Column, Model, Table, PrimaryKey } from 'sequelize-typescript';

@Table
export class Tokens extends Model {
    @PrimaryKey
    @Column
    refresh_token: string;

    @Column
    user_agent: string
}