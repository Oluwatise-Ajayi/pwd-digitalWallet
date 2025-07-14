import { Module } from '@nestjs/common';
import { Transaction } from './entities/transaction.entity'; // Import Transaction entity
import { User } from '../auth/entities/user.entity';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User])],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService, TypeOrmModule],
})
export class WalletModule {}
