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
import { User } from '../../auth/entities/user.entity'; // Adjust path

@Entity('wallet_addresses')
@Index(['userId', 'address'], { unique: true }) // Ensure a user doesn't have duplicate addresses
export class WalletAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string; // Foreign key to the user who owns this address

  @ManyToOne(() => User, (user) => user.walletAddresses)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ unique: true, length: 66 }) // Sui addresses are 66 characters
  address: string; // The public Sui address (e.g., 0x...)

  @Column({ select: false, length: 500 }) // Encrypted private key, don't select by default
  encrypted_private_key: string; // Storing the encrypted keypair (base64 or hex of serialized keypair)

  @Column({ default: true })
  is_active: boolean; // Flag to enable/disable addresses

  @Column({ nullable: true })
  nickname: string; // User-defined name for the address

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
