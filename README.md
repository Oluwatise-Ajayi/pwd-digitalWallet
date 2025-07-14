# Digital Wallet API

A secure and scalable digital wallet API built with NestJS, featuring user authentication, JWT-based authorization, and comprehensive error handling.

## Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 🛡️ **Role-based Authorization** - User roles and permissions
- 📊 **Structured Logging** - Comprehensive logging with Pino
- 🚀 **Rate Limiting** - API throttling for security
- 📚 **API Documentation** - Swagger/OpenAPI documentation
- 🏗️ **TypeScript** - Full type safety and modern development
- 🧪 **Testing Ready** - Jest testing framework configured

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: TypeORM with PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Logging**: Pino with structured logging
- **Documentation**: Swagger/OpenAPI
- **Rate Limiting**: NestJS Throttler
- **Validation**: class-validator

## Project Structure

```
src/
├── app.controller.ts          # Main application controller
├── app.module.ts             # Root application module
├── app.service.ts            # Application service
├── main.ts                   # Application entry point
├── common/
│   └── filters/
│       └── all-exceptions.filter.ts  # Global exception handler
├── config/
│   ├── database.config.ts    # Database configuration
│   └── jwt.config.ts         # JWT configuration
└── modules/
    └── auth/
        ├── auth.controller.ts # Authentication endpoints
        ├── auth.module.ts     # Auth module
        ├── auth.service.ts    # Auth business logic
        ├── decorators/
        │   └── roles.decorator.ts     # Role decorators
        ├── dtos/
        │   ├── jwt-payload.dto.ts     # JWT payload type
        │   ├── login-response.dto.ts  # Login response
        │   ├── login.dto.ts           # Login request
        │   └── register.dto.ts        # Registration request
        ├── entities/
        │   └── user.entity.ts         # User entity
        ├── guards/
        │   └── roles.guard.ts         # Role-based access control
        └── jwt.strategy.ts            # JWT strategy
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pwd-wallet
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
```

### Environment Variables

Create a `.env` file with the following variables:

```env
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
```

### Database Setup

1. Create a PostgreSQL database
2. Update the database configuration in `.env`
3. Run migrations (when implemented):
```bash
npm run migration:run
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
- Request/response schemas
- Interactive testing interface

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile (protected)

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

## Development

### Code Quality

The project follows TypeScript and NestJS best practices:

- **Type Safety**: Full TypeScript implementation
- **Clean Architecture**: Modular design with separation of concerns
- **Error Handling**: Global exception filter with structured logging
- **Validation**: Request validation using class-validator
- **Documentation**: Comprehensive API documentation with Swagger

### Adding New Features

1. Create new modules in `src/modules/`
2. Follow the existing pattern for controllers, services, and DTOs
3. Add appropriate tests
4. Update API documentation

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: User roles and permissions
- **Rate Limiting**: API throttling to prevent abuse
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Secure error responses without information leakage

## Logging

The application uses structured logging with Pino:

- **Development**: Pretty-printed logs for easy reading
- **Production**: JSON structured logs for log aggregation
- **Levels**: Configurable log levels based on environment
- **Context**: Request tracking and error context

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions and support:
- Check the [NestJS Documentation](https://docs.nestjs.com)
- Visit the [NestJS Discord](https://discord.gg/G7Qnnhy)
- Review the API documentation at `/api-docs` when running locally
