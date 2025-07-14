import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWalletAddressDto {
  @ApiProperty({
    description: 'Optional nickname for the new wallet address',
    example: 'My Main SUI Wallet',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickname?: string;
}
