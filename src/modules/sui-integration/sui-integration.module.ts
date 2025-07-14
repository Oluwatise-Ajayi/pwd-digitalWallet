import { Module } from '@nestjs/common';
import { SuiIntegrationService } from './sui-integration.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [SuiIntegrationService],
  exports: [SuiIntegrationService],
})
export class SuiIntegrationModule {}
