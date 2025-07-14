import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Needed for EncryptionUtil
import { EncryptionUtil } from '../../shared/utils/encryption.util';

@Global() // Make shared module providers available globally
@Module({
  imports: [ConfigModule], // Import ConfigModule for EncryptionUtil
  providers: [EncryptionUtil],
  exports: [EncryptionUtil],
})
export class SharedModule {}
