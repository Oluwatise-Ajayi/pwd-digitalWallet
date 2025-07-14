import {
  Controller,
  Get,
  UseGuards,
  Request as ReqDecorator,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { UserRole, User } from '../auth/entities/user.entity'; // For roles if needed
import { RolesGuard } from '../auth/guards/roles.guard'; // For roles if needed
import { Roles } from '../auth/decorators/roles.decorator'; // For roles if needed

export interface WalletResponse {
  balance: string;
  currency: string;
  userId: string;
  email: string;
  message: string;
}
@ApiTags('Wallet')
@ApiBearerAuth('access-token') // Protect all endpoints in this controller
@UseGuards(AuthGuard('jwt'), RolesGuard) // All wallet endpoints require auth and role check
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('my-wallet')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN) // Example: only users and admins can see their wallet
  @ApiResponse({ status: 200, description: 'User wallet details.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient roles.' })
  async getMyWallet(
    @ReqDecorator() req: ExpressRequest,
  ): Promise<WalletResponse> {
    const user = req.user as User | undefined;
    if (!user || !user.id) {
      throw new Error('Authenticated user not found');
    }
    return this.walletService.getUserWalletDetails(user.id);
  }

  // You will add more endpoints here, e.g.:
  // - POST /wallet/deposit (for fiat deposit initiation)
  // - POST /wallet/transfer-sui (for sending SUI on-chain)
  // - GET /wallet/transactions (for transaction history)
}
