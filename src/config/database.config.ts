// src/config/database.config.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../modules/auth/entities/user.entity';
import { Transaction } from '../modules/wallet/entities/transaction.entity';
import { WalletAddress } from '../modules/wallet/entities/wallet-address.entity';
import * as dotenv from 'dotenv';

// Configuration for NestJS TypeOrmModule
export const getTypeOrmModuleOptions = (
  configService: ConfigService,
): DataSourceOptions => ({
  type: 'postgres',
  host: configService.get<string>('DATABASE_HOST'),
  port: configService.get<number>('DATABASE_PORT'),
  username: configService.get<string>('DATABASE_USERNAME'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  database: configService.get<string>('DATABASE_NAME'),
  entities: [User, Transaction, WalletAddress],
  synchronize: false, // Disable auto-synchronization since tables are created manually
  logging: configService.get<string>('NODE_ENV') === 'development',
  migrationsTableName: 'migrations_history',
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
});

// DataSource for TypeORM CLI - it needs a direct DataSource export
dotenv.config(); // Load .env file for TypeORM CLI

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User, Transaction, WalletAddress],
  migrationsTableName: 'migrations_history',
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
});
