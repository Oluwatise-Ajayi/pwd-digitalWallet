// // src/config/database.config.ts
// import { DataSource, DataSourceOptions } from 'typeorm';
// import { ConfigService } from '@nestjs/config';
// import * as dotenv from 'dotenv'; // Keep this only for CLI's AppDataSource

// // This is the configuration function for NestJS's TypeOrmModule.forRootAsync
// // It receives ConfigService to properly load environment variables within the NestJS context
// export const getTypeOrmModuleOptions = (
//   configService: ConfigService,
// ): DataSourceOptions => ({
//   type: 'postgres', // Explicitly define type as 'postgres' literal
//   host: configService.get<string>('DATABASE_HOST'),
//   port: configService.get<number>('DATABASE_PORT'),
//   username: configService.get<string>('DATABASE_USERNAME'),
//   password: configService.get<string>('DATABASE_PASSWORD'),
//   database: configService.get<string>('DATABASE_NAME'),
//   entities: [__dirname + '/../**/*.entity{.ts,.js}'],
//   synchronize: false, // ALWAYS false in production!
//   logging: false, // Set to true for detailed SQL logs in development
//   migrationsTableName: 'migrations_history',
//   migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
// });

// // This is the DataSource instance for the TypeORM CLI
// // It needs to load .env variables itself because it runs outside the NestJS ConfigModule context
// // We only call dotenv.config() here, not in getTypeOrmModuleOptions
// dotenv.config(); // Load .env file for TypeORM CLI

// export const AppDataSource = new DataSource({
//   type: 'postgres', // Explicitly define type as 'postgres' literal
//   host: process.env.DATABASE_HOST,
//   port: parseInt(process.env.DATABASE_PORT as string, 10), // Ensure parsing from process.env
//   username: process.env.DATABASE_USERNAME,
//   password: process.env.DATABASE_PASSWORD,
//   database: process.env.DATABASE_NAME,
//   entities: [__dirname + '/../**/*.entity{.ts,.js}'],
//   migrationsTableName: 'migrations_history',
//   migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
// });
