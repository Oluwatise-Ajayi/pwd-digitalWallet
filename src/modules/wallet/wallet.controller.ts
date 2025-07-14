import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { UserRole } from '../auth/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateWalletAddressDto } from './dtos/create-wallet-address.dto';
import { WalletAddressResponseDto } from './dtos/wallet-address-response.dto';
import { SuiTransferDto } from './dtos/sui-transfer.dto';

// Helper for SUI to MIST conversion (1 SUI = 10^9 MIST)
function suiToMist(amountSui: string | number): string {
  // Use BigInt for safe conversion
  const [whole, fraction = ''] = amountSui.toString().split('.');
  const paddedFraction = (fraction + '000000000').slice(0, 9); // pad/truncate to 9 decimals
  return (BigInt(whole) * 1000000000n + BigInt(paddedFraction)).toString();
}

interface AuthRequest extends Request {
  user: { id: string };
}

@ApiTags('Wallet')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('my-wallet-summary')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiResponse({
    status: 200,
    description: 'User wallet addresses with balances.',
    type: [WalletAddressResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient roles.' })
  async getMyWalletSummary(@Request() req: AuthRequest) {
    const userId = req.user.id;
    return this.walletService.getUserSuiAddresses(userId);
  }

  @Post('generate-address')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.USER)
  @ApiBody({ type: CreateWalletAddressDto, required: false })
  @ApiResponse({
    status: 201,
    description: 'New Sui address generated and assigned to user.',
    type: WalletAddressResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient roles.' })
  async generateAddress(
    @Request() req: AuthRequest,
    @Body() createWalletAddressDto: CreateWalletAddressDto,
  ) {
    const userId = req.user.id;
    const newAddress = await this.walletService.generateSuiAddress(
      userId,
      createWalletAddressDto.nickname,
    );
    return {
      id: newAddress.id,
      address: newAddress.address,
      nickname: newAddress.nickname,
      isActive: newAddress.is_active,
      balanceSui: '0',
      createdAt: newAddress.created_at,
    };
  }

  @Post('transfer-sui')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER)
  @ApiBody({ type: SuiTransferDto })
  @ApiResponse({
    status: 200,
    description: 'SUI transfer initiated successfully.',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'SUI transfer initiated successfully.',
        },
        suiTransactionDigest: { type: 'string', example: '0x...' },
        transactionLogId: { type: 'string', example: 'a1b2c3d4-...' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient roles.' })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Wallet address not found or not owned by user.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - SUI transfer failed.',
  })
  async transferSui(
    @Request() req: AuthRequest,
    @Body() suiTransferDto: SuiTransferDto,
  ) {
    const userId = req.user.id;
    // Convert SUI amount to MIST (1 SUI = 10^9 MIST) for blockchain ops
    const amountMIST = suiToMist(suiTransferDto.amountSui);
    const { transactionLog, suiTransactionDigest } =
      await this.walletService.transferSui(
        suiTransferDto.fromWalletAddressId,
        suiTransferDto.recipientAddress,
        Number(amountMIST),
        userId,
      );
    return {
      message: 'SUI transfer initiated successfully.',
      suiTransactionDigest,
      transactionLogId: transactionLog.id,
    };
  }
}
