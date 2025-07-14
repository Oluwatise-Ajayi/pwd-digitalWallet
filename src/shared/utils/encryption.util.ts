import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EncryptionUtil {
  private readonly logger = new Logger(EncryptionUtil.name);
  private readonly algorithm = 'aes-256-cbc';
  private readonly ivLength = 16; // For AES, this is 16 bytes
  private encryptionKey: Buffer;

  constructor(private configService: ConfigService) {
    const secret = this.configService.get<string>('ENCRYPTION_KEY');
    if (!secret || secret.length !== 32) {
      // AES-256 requires 32-byte key
      this.logger.error(
        'ENCRYPTION_KEY must be 32 characters long. Please generate a strong random key.',
      );
      throw new Error('Invalid ENCRYPTION_KEY configuration.');
    }
    this.encryptionKey = Buffer.from(secret, 'utf8');
  }

  /**
   * Encrypts a plaintext string.
   * @param text The plaintext string to encrypt.
   * @returns The encrypted string (hex encoded).
   */
  public encryptText(text: string): string {
    const iv = crypto.randomBytes(this.ivLength); // Generate a fresh IV
    const cipher = crypto.createCipheriv(
      this.algorithm,
      this.encryptionKey,
      iv,
    );
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted; // Store IV with encrypted data
  }

  /**
   * Decrypts an encrypted string.
   * @param encryptedText The encrypted string (hex encoded with IV).
   * @returns The decrypted plaintext string.
   */
  public decryptText(encryptedText: string): string {
    const textParts = encryptedText.split(':');
    if (textParts.length !== 2) {
      throw new Error('Invalid encrypted text format.');
    }
    const iv = Buffer.from(textParts[0], 'hex');
    const encrypted = textParts[1];

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.encryptionKey,
      iv,
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
