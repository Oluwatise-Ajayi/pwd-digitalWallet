import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity'; // Assuming User entity
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from './entities/transaction.entity';
import { WalletResponse } from './wallet.controller';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Method to log a transaction (off-chain)
  async createTransaction(
    userId: string,
    type: TransactionType,
    amount: string,
    currency: string,
    status: TransactionStatus = TransactionStatus.PENDING,
    details?: {
      from_address?: string;
      to_address?: string;
      sui_transaction_digest?: string;
      sui_details?: object;
      description?: string;
      metadata?: object;
    },
  ): Promise<Transaction> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const newTransaction = this.transactionRepository.create({
      userId,
      user, // Link the user object for TypeORM relation
      type,
      amount,
      currency,
      status,
      ...details,
    });

    return this.transactionRepository.save(newTransaction);
  }

  // Placeholder for getting user's wallet details (expand later)
  async getUserWalletDetails(userId: string): Promise<WalletResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    // In a real scenario, this would return cached balances, addresses, etc.
    return {
      userId: user.id,
      email: user.email,
      message: 'Wallet details placeholder',
      balance: 'user balance',
      currency: 'user currency',
    };
  }

  // You'll add more complex logic here later, e.g.:
  // - getSuiAddressForUser (generate/manage keypairs - more on this later)
  // - getWalletBalance (caching SUI balance)
  // - initiateTransfer (creates transaction log, then calls SuiIntegrationService)
}
