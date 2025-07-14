import { ApiProperty } from '@nestjs/swagger';

export class WalletAddressResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  id: string;

  @ApiProperty({
    example:
      '0x09f4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4',
  })
  address: string;

  @ApiProperty({ example: 'My Gaming Wallet' })
  nickname: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '1.23456789', description: 'Current balance of SUI' })
  balanceSui: string;

  @ApiProperty({ example: '2025-07-14T08:00:00.000Z' })
  createdAt: Date;
}
