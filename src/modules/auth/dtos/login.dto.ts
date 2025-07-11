import { PickType } from '@nestjs/swagger';
import { RegisterUserDto } from './register.dto';

export class LoginUserDto extends PickType(RegisterUserDto, [
  'email',
  'password',
] as const) {}
