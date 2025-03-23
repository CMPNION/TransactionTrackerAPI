import { Module } from '@nestjs/common';
import {SequelizeModule} from '@nestjs/sequelize'
import { config } from 'dotenv'

config();

@Module({
    imports: [
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT, 10) || 5432,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            autoLoadModels: true,
            synchronize: true,
        }),
    ],
})
export class DatabaseModule {}
