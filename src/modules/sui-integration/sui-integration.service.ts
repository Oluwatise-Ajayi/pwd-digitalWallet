import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';

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
      throw new Error('SUI_NETWORK or SUI_FULLNODE_URL must be set');
    }
    if (!suiFaucetUrl) {
      this.logger.error('SUI_FAUCET_URL environment variable is not set!');
      throw new Error('SUI_FAUCET_URL must be set');
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
        throw new Error('No valid SUI network or fullnode URL provided');
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
      if (error && typeof error === 'object') {
        const err = error as { message?: string; stack?: string };
        this.logger.error(
          'Failed to initialize Sui Client:',
          err.message ?? '',
          err.stack ?? '',
        );
      } else {
        this.logger.error('Failed to initialize Sui Client:', String(error));
      }
      throw error;
    }
  }

  public getClient(): SuiClient {
    if (!this.suiClient) {
      throw new Error('SuiClient is not initialized.');
    }
    return this.suiClient;
  }

  async requestSuiFromFaucet(recipientAddress: string): Promise<unknown> {
    if (!this.suiFaucetUrl) {
      throw new Error('SUI_FAUCET_URL is not configured.');
    }
    this.logger.log(
      `Requesting SUI from faucet for address: ${recipientAddress}`,
    );
    try {
      const response = await fetch(this.suiFaucetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        throw new Error(`Faucet request failed: ${errorMsg}`);
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
      throw error;
    }
  }

  // You will add more methods here for:
  // - Getting SUI balance
  // - Querying objects
  // - Executing transaction blocks
  // - Subscribing to events
}
