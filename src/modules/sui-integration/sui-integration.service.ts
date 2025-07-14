import {
  Injectable,
  Logger,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { Keypair } from '@mysten/sui.js/cryptography';
import { TransactionBlock } from '@mysten/sui.js/transactions';

@Injectable()
export class SuiIntegrationService implements OnModuleInit {
  private readonly logger = new Logger(SuiIntegrationService.name);
  private suiClient: SuiClient;
  private suiFaucetUrl: string;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const suiNetwork = this.configService.get<string>('SUI_NETWORK');
    const suiFullnodeUrl = this.configService.get<string>('SUI_FULLNODE_URL');
    const suiFaucetUrl = this.configService.get<string>('SUI_FAUCET_URL');
    if (!suiNetwork && !suiFullnodeUrl) {
      this.logger.error(
        'SUI_NETWORK or SUI_FULLNODE_URL environment variables are not set!',
      );
      throw new InternalServerErrorException(
        'SUI_NETWORK or SUI_FULLNODE_URL must be set',
      );
    }
    if (!suiFaucetUrl) {
      this.logger.error('SUI_FAUCET_URL environment variable is not set!');
      throw new InternalServerErrorException('SUI_FAUCET_URL must be set');
    }
    this.suiFaucetUrl = suiFaucetUrl;
    try {
      let nodeUrl: string;
      if (
        suiNetwork === 'mainnet' ||
        suiNetwork === 'testnet' ||
        suiNetwork === 'devnet' ||
        suiNetwork === 'localnet'
      ) {
        nodeUrl = getFullnodeUrl(suiNetwork);
      } else if (suiFullnodeUrl) {
        nodeUrl = suiFullnodeUrl;
      } else {
        throw new InternalServerErrorException(
          'No valid SUI network or fullnode URL provided',
        );
      }
      this.suiClient = new SuiClient({ url: nodeUrl });
      this.logger.log(
        `Sui Client initialized for network: ${suiNetwork || suiFullnodeUrl}`,
      );
      const health = await this.suiClient.getLatestSuiSystemState();
      this.logger.log(
        `Sui Node Health Check: Epoch ${health.epoch}, Protocol Version ${health.protocolVersion}`,
      );
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
      this.logger.error(
        'Failed to initialize Sui Client:',
        errorMsg,
        errorStack,
      );
      throw new InternalServerErrorException(
        'Failed to connect to Sui blockchain.',
      );
    }
  }

  public getClient(): SuiClient {
    if (!this.suiClient) {
      throw new InternalServerErrorException('SuiClient is not initialized.');
    }
    return this.suiClient;
  }

  public async requestSuiFromFaucet(
    recipientAddress: string,
  ): Promise<unknown> {
    if (!this.suiFaucetUrl) {
      throw new InternalServerErrorException(
        'SUI_FAUCET_URL is not configured.',
      );
    }
    this.logger.log(
      `Requesting SUI from faucet for address: ${recipientAddress}`,
    );
    try {
      const response = await fetch(this.suiFaucetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          FixedAmountRequest: { recipient: recipientAddress },
        }),
      });
      const data = (await response.json()) as unknown;
      if (!response.ok) {
        let errorMsg = response.statusText;
        if (
          data &&
          typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof (data as Record<string, unknown>).error === 'string'
        ) {
          errorMsg = (data as Record<string, string>).error;
        }
        this.logger.error(`Faucet request failed: ${JSON.stringify(data)}`);
        throw new InternalServerErrorException(
          `Faucet request failed: ${errorMsg}`,
        );
      }
      this.logger.log(
        `Faucet response for ${recipientAddress}: ${JSON.stringify(data)}`,
      );
      return data;
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
      this.logger.error(`Error requesting SUI from faucet: ${errorMsg}`);
      throw new InternalServerErrorException(
        `Failed to request SUI from faucet: ${errorMsg}`,
      );
    }
  }

  public async getSuiBalance(address: string): Promise<string> {
    try {
      const coins = await this.suiClient.getBalance({ owner: address });
      // Return the totalBalance as a string (MIST)
      return coins.totalBalance?.toString() ?? '0';
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
        `Failed to get SUI balance for ${address}: ${errorMsg}`,
      );
      throw new InternalServerErrorException(
        `Could not retrieve balance for address ${address}.`,
      );
    }
  }

  public async transferSuiNative(
    senderKeypair: Keypair,
    recipientAddress: string,
    amountMIST: number,
  ): Promise<unknown> {
    const txb = new TransactionBlock();
    const [coin] = txb.splitCoins(txb.gas, [txb.pure(amountMIST)]);
    txb.transferObjects([coin], txb.pure(recipientAddress));
    try {
      const result = await this.suiClient.signAndExecuteTransactionBlock({
        signer: senderKeypair,
        transactionBlock: txb,
        options: {
          showEffects: true,
          showBalanceChanges: true,
        },
      });
      this.logger.log(
        `SUI native transfer successful. Digest: ${result.digest}`,
      );
      return result;
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
      this.logger.error(
        `Error during SUI native transfer: ${errorMsg}`,
        errorStack,
      );
      throw new InternalServerErrorException(
        `SUI native transfer failed: ${errorMsg}`,
      );
    }
  }
}
