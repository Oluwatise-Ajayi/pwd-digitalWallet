import {
  IsString,
  IsNumber,
  IsPositive,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SuiTransferDto {
  @ApiProperty({
    description: "The ID of the user's source wallet address.",
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsString()
  @MaxLength(36) // UUID length
  fromWalletAddressId: string;

  @ApiProperty({
    description: "The recipient's Sui address.",
    example:
      '0x09f4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4',
  })
  @IsString()
  @MaxLength(66) // Sui address length
  recipientAddress: string;

  @ApiProperty({
    description:
      'The amount of SUI to transfer (as a number, will be converted to MIST).',
    example: 0.1,
    type: 'number',
  })
  @IsNumber()
  @IsPositive()
  @Min(0.000000001, {
    message: 'Transfer amount must be at least 0.000000001 SUI.',
  }) // Minimum transfer amount
  amountSui: number; // Amount in SUI, not MIST
}
