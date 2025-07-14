# Digital Wallet API

A secure and scalable digital wallet API built with NestJS, featuring user authentication, JWT-based authorization, Sui blockchain integration, and comprehensive error handling.

## Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 🛡️ **Role-based Authorization** - User roles and permissions
- 📊 **Structured Logging** - Comprehensive logging with Pino
- 🚀 **Rate Limiting** - API throttling for security
- 📚 **API Documentation** - Swagger/OpenAPI documentation
- 🏗️ **TypeScript** - Full type safety and modern development
- 🧪 **Testing Ready** - Jest testing framework configured
- 🪙 **Sui Blockchain Integration** - SUI address/key management, SUI transfers, and on-chain/off-chain transaction logging
- 🔑 **Encrypted Private Keys** - User SUI private keys are encrypted at rest

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: TypeORM with PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Logging**: Pino with structured logging
- **Documentation**: Swagger/OpenAPI
- **Rate Limiting**: NestJS Throttler
- **Validation**: class-validator, DTOs for all endpoints
- **Blockchain**: Sui blockchain integration via @mysten/sui.js

## Project Structure

```
src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
├── common/
│   └── filters/
│       └── all-exceptions.filter.ts
├── config/
│   ├── database.config.ts
│   └── jwt.config.ts
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── decorators/
│   │   ├── dtos/
│   │   ├── entities/
│   │   ├── guards/
│   │   └── jwt.strategy.ts
│   ├── wallet/
│   │   ├── wallet.controller.ts
│   │   ├── wallet.module.ts
│   │   ├── wallet.service.ts
│   │   ├── dtos/
│   │   │   ├── create-wallet-address.dto.ts
│   │   │   ├── wallet-address-response.dto.ts
│   │   │   └── sui-transfer.dto.ts
│   │   ├── entities/
│   │   │   ├── transaction.entity.ts
│   │   │   └── wallet-address.entity.ts
│   ├── sui-integration/
│   │   ├── sui-integration.module.ts
│   │   └── sui-integration.service.ts
│   └── shared/
│       ├── shared.module.ts
│       └── utils/
│           └── encryption.util.ts
└── test/
```

## Key Endpoints

### Wallet
- `GET /wallet/my-wallet-summary` — Get all SUI wallet addresses for the authenticated user, including balances
- `POST /wallet/generate-address` — Generate a new SUI address for the authenticated user (returns address, nickname, createdAt, etc.)
- `POST /wallet/transfer-sui` — Transfer SUI from one of the user's addresses to another SUI address (on-chain)

### Auth
- `POST /auth/register` — User registration
- `POST /auth/login` — User login
- `GET /auth/profile` — Get user profile (protected)

## DTOs and Type Safety
- All endpoints use DTOs (Data Transfer Objects) for input validation and output typing
- TypeScript types and interfaces are used throughout for maximum safety
- Example DTOs: `CreateWalletAddressDto`, `WalletAddressResponseDto`, `SuiTransferDto`

## SUI/MIST Conversion
- SUI amounts are converted to MIST (1 SUI = 1,000,000,000 MIST) using a type-safe helper
- All on-chain operations use MIST for precision

## Security
- User SUI private keys are encrypted at rest using AES-256-CBC
- Only the authenticated user can access or use their private keys
- All sensitive operations are protected by JWT and role-based guards

## Environment Variables

```
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=digital_wallet

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Application
PORT=3000
NODE_ENV=development

# Sui Blockchain
SUI_NETWORK=devnet # or testnet/mainnet/localnet
SUI_FULLNODE_URL=https://fullnode.devnet.sui.io:443 # or your custom node
SUI_FAUCET_URL=https://faucet.devnet.sui.io/gas # for devnet/testnet
ENCRYPTION_KEY=your_32_char_encryption_key_here
```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run start:prod
```

### Build
```bash
npm run build
```

## API Documentation

Once the application is running, you can access the API documentation at:

- **Swagger UI**: http://localhost:3000/api-docs

The documentation includes:
- Authentication endpoints
- Wallet endpoints (SUI address management, SUI transfer)
- Request/response schemas
- Interactive testing interface

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.
