import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from './entities/transaction.entity';
import { WalletAddress } from './entities/wallet-address.entity';
import { SuiIntegrationService } from '../sui-integration/sui-integration.service';
import { EncryptionUtil } from '../../shared/utils/encryption.util';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { isValidSuiAddress } from '@mysten/sui.js/utils';
import { Keypair } from '@mysten/sui.js/cryptography';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(WalletAddress)
    private walletAddressRepository: Repository<WalletAddress>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private suiIntegrationService: SuiIntegrationService,
    private encryptionUtil: EncryptionUtil,
  ) {}

  public async createTransaction(
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
      user,
      type,
      amount,
      currency,
      status,
      ...details,
    });
    return this.transactionRepository.save(newTransaction);
  }

  public async generateSuiAddress(
    userId: string,
    nickname?: string,
  ): Promise<WalletAddress> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    const keypair = new Ed25519Keypair();
    const suiAddress = keypair.getPublicKey().toSuiAddress();
    const fullSecretKeyBase64 = Buffer.from(keypair.getSecretKey()).toString(
      'base64',
    );
    const encryptedPrivateKey =
      this.encryptionUtil.encryptText(fullSecretKeyBase64);
    const existingAddress = await this.walletAddressRepository.findOne({
      where: { address: suiAddress },
    });
    if (existingAddress) {
      throw new ConflictException('Generated Sui address already exists.');
    }
    const newWalletAddress = this.walletAddressRepository.create({
      userId,
      user,
      address: suiAddress,
      encrypted_private_key: encryptedPrivateKey,
      nickname,
    });
    return this.walletAddressRepository.save(newWalletAddress);
  }

  public async getDecryptedKeypair(
    walletAddressId: string,
    userId: string,
  ): Promise<Keypair> {
    const walletAddress = await this.walletAddressRepository.findOne({
      where: { id: walletAddressId, userId },
      select: ['encrypted_private_key'],
    });
    if (!walletAddress) {
      throw new NotFoundException(
        'Wallet address not found or does not belong to user.',
      );
    }
    try {
      const decryptedSecretKeyBase64 = this.encryptionUtil.decryptText(
        walletAddress.encrypted_private_key,
      );
      const keypair = Ed25519Keypair.fromSecretKey(
        Buffer.from(decryptedSecretKeyBase64, 'base64'),
      );
      return keypair;
    } catch (error: unknown) {
      let errorMsg = '';
      if (
        error &&
        typeof error === 'object' &&
        error !== null &&
        'message' in error
      ) {
        errorMsg = String((error as { message?: string }).message);
      } else {
        errorMsg = String(error);
      }
      this.logger.error(
        `Error decrypting keypair for address ${walletAddressId}: ${errorMsg}`,
      );
      throw new InternalServerErrorException('Failed to decrypt wallet key.');
    }
  }

  public async getUserSuiAddresses(
    userId: string,
  ): Promise<(WalletAddress & { balanceSui?: string })[]> {
    const addresses = await this.walletAddressRepository.find({
      where: { userId, is_active: true },
    });
    const addressesWithBalances = await Promise.all(
      addresses.map(async (address) => {
        try {
          const balance = await this.suiIntegrationService.getSuiBalance(
            address.address,
          );
          return { ...address, balanceSui: balance };
        } catch (error: unknown) {
          let errorMsg = '';
          if (
            error &&
            typeof error === 'object' &&
            error !== null &&
            'message' in error
          ) {
            errorMsg = String((error as { message?: string }).message);
          } else {
            errorMsg = String(error);
          }
          this.logger.warn(
            `Could not fetch balance for ${address.address}: ${errorMsg}`,
          );
          return { ...address, balanceSui: '0' };
        }
      }),
    );
    return addressesWithBalances;
  }

  public async transferSui(
    fromAddressId: string,
    recipientAddress: string,
    amountMIST: number,
    userId: string,
  ): Promise<{ transactionLog: Transaction; suiTransactionDigest: string }> {
    const senderKeypair = await this.getDecryptedKeypair(fromAddressId, userId);
    const senderAddress = senderKeypair.getPublicKey().toSuiAddress();
    if (!isValidSuiAddress(recipientAddress)) {
      throw new Error('Invalid recipient Sui address.');
    }
    if (senderAddress === recipientAddress) {
      throw new ConflictException('Cannot transfer SUI to the same address.');
    }
    const transactionLog = await this.createTransaction(
      userId,
      TransactionType.SUI_NATIVE_TRANSFER,
      amountMIST.toString(),
      'MIST',
      TransactionStatus.PENDING,
      {
        from_address: senderAddress,
        to_address: recipientAddress,
        description: `SUI transfer to ${recipientAddress}`,
      },
    );
    let suiTransactionDigest: string;
    try {
      const transferResult = await this.suiIntegrationService.transferSuiNative(
        senderKeypair,
        recipientAddress,
        amountMIST,
      );
      if (
        transferResult &&
        typeof transferResult === 'object' &&
        transferResult !== null &&
        'digest' in transferResult &&
        typeof (transferResult as Record<string, unknown>).digest === 'string'
      ) {
        suiTransactionDigest = (transferResult as Record<string, string>)
          .digest;
      } else {
        throw new InternalServerErrorException(
          'Invalid transfer result from SuiIntegrationService',
        );
      }
      transactionLog.sui_transaction_digest = suiTransactionDigest;
      transactionLog.sui_details = transferResult;
      transactionLog.status = TransactionStatus.COMPLETED;
      await this.transactionRepository.save(transactionLog);
      this.logger.log(
        `SUI transfer initiated. Digest: ${suiTransactionDigest}`,
      );
      return { transactionLog, suiTransactionDigest };
    } catch (error: unknown) {
      let errorMsg = '';
      let errorStack = '';
      if (
        error &&
        typeof error === 'object' &&
        error !== null &&
        'message' in error
      ) {
        errorMsg = String((error as { message?: string }).message);
        errorStack =
          'stack' in error ? String((error as { stack?: string }).stack) : '';
      } else {
        errorMsg = String(error);
      }
      this.logger.error(`SUI transfer failed: ${errorMsg}`, errorStack);
      transactionLog.status = TransactionStatus.FAILED;
      transactionLog.metadata = { error: errorMsg };
      await this.transactionRepository.save(transactionLog);
      throw new InternalServerErrorException(
        'SUI transfer failed. Please try again.',
      );
    }
  }

  public async getUserWalletDetails(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    // In a real scenario, this would return cached balances, addresses, etc.
    return {
      userId: user.id,
      email: user.email,
      message: 'Wallet details placeholder',
    };
  }
}
