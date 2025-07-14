import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { getTypeOrmModuleOptions } from './config/database.config';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerModule } from '@nestjs/throttler'; // Import Throttler
import { WalletModule } from './modules/wallet/wallet.module';
import { WalletController } from './modules/wallet/wallet.controller';
import { WalletService } from './modules/wallet/wallet.service';
import { SuiIntegrationModule } from './modules/sui-integration/sui-integration.module';
import { SharedModule } from './modules/shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmModuleOptions,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
        // Add other Pino options for structured logging
        autoLogging: {
          ignore: (req) => req.url === '/health', // Example: ignore health checks
        },
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('THROTTLE_TTL') ?? 60,
            limit: configService.get<number>('THROTTLE_LIMIT') ?? 10,
          },
        ],
      }),
    }),
    AuthModule,
    WalletModule,
    SuiIntegrationModule,
    SharedModule,
  ],
  controllers: [AppController, WalletController],
  providers: [AppService, WalletService],
})
export class AppModule {}
