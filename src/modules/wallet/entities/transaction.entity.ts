import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  SUI_NATIVE_TRANSFER = 'sui_native_transfer',
  CUSTOM_MOVE_CALL = 'custom_move_call',
  FEE = 'fee',
  REWARD = 'reward',
  REFUND = 'refund',
  EXCHANGE = 'exchange',
}

export enum TransactionStatus {
  PENDING = 'pending', // Transaction initiated, waiting for processing/on-chain confirmation
  PROCESSING = 'processing', // E.g., sent to Sui, waiting for finality
  COMPLETED = 'completed', // Successfully completed (on-chain or off-chain)
  FAILED = 'failed', // Failed (e.g., insufficient balance, RPC error, on-chain revert)
  CANCELLED = 'cancelled', // User cancelled or system cancelled before processing
}

@Entity('transactions')
@Index(['userId', 'status']) // Add indexes for common queries
@Index(['sui_transaction_digest']) // Index for quickly finding a transaction by its Sui digest
@Index(['userId', 'type']) // Index for filtering by user and transaction type
@Index(['userId', 'created_at']) // Index for user transaction history queries
@Index(['status', 'created_at']) // Index for status-based queries with time filtering
@Index(['reference_id']) // Index for external reference lookups
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string; // Foreign key to the user who initiated/is involved in the transaction

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 20, scale: 9 }) // Sufficient precision for crypto and fiat
  amount: string; // Use string for precise decimal handling (e.g., '1.23456789')

  @Column({ nullable: true })
  currency: string; // e.g., 'SUI', 'NGN', 'USDT'

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ nullable: true })
  from_address: string; // E.g., user's Sui address, or internal wallet ID

  @Column({ nullable: true })
  to_address: string; // E.g., recipient's Sui address, or internal wallet ID

  @Column({ nullable: true, length: 66, unique: true }) // Sui Transaction Digest is 66 chars
  sui_transaction_digest: string; // If it's an on-chain transaction

  @Column({ nullable: true, type: 'jsonb' }) // Store any relevant Sui details like object IDs, event types
  sui_details: Record<string, any>;

  @Column({ nullable: true, length: 500 })
  description: string; // Human-readable description (e.g., "Transfer to John Doe")

  @Column({ nullable: true, type: 'jsonb' })
  metadata: Record<string, any>; // Any other relevant metadata (e.g., payment gateway fees)

  @Column({ nullable: true })
  fee_amount: string; // Transaction fee amount

  @Column({ nullable: true })
  fee_currency: string; // Transaction fee currency

  @Column({ nullable: true })
  exchange_rate: string; // Exchange rate if this is an exchange transaction

  @Column({ nullable: true })
  reference_id: string; // External reference ID (e.g., payment gateway transaction ID)

  @Column({ nullable: true })
  failure_reason: string; // Reason for failure if status is FAILED

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Utility methods
  isCompleted(): boolean {
    return this.status === TransactionStatus.COMPLETED;
  }

  isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  isProcessing(): boolean {
    return this.status === TransactionStatus.PROCESSING;
  }

  isFailed(): boolean {
    return this.status === TransactionStatus.FAILED;
  }

  isCancelled(): boolean {
    return this.status === TransactionStatus.CANCELLED;
  }

  isOnChain(): boolean {
    return !!this.sui_transaction_digest;
  }

  getTotalAmount(): string {
    const amount = parseFloat(this.amount);
    const feeAmount = this.fee_amount ? parseFloat(this.fee_amount) : 0;
    return (amount + feeAmount).toString();
  }

  isIncoming(): boolean {
    return [
      TransactionType.DEPOSIT,
      TransactionType.TRANSFER_IN,
      TransactionType.REWARD,
      TransactionType.REFUND,
    ].includes(this.type);
  }

  isOutgoing(): boolean {
    return [
      TransactionType.WITHDRAWAL,
      TransactionType.TRANSFER_OUT,
      TransactionType.FEE,
    ].includes(this.type);
  }
}
