import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config'; // For accessing JWT_SECRET
import { JwtPayload } from './dtos/jwt-payload.dto'; // Your JWT payload interface
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService, // Inject ConfigService
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  // This method is called after the JWT is validated.
  // It takes the decoded payload and should return the user object to be attached to req.user
  async validate(payload: JwtPayload) {
    const { sub: userId } = payload; // 'sub' is standard for subject (user ID)
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      // You might select specific fields to attach to req.user, e.g., ['id', 'email', 'role']
      // Don't select sensitive data like password_hash here!
      select: ['id', 'email', 'role'], // Add 'role' here for RBAC later
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    return user; // This user object will be attached to req.user
  }
}
