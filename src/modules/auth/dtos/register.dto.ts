import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'The user password (min 8 characters)',
    example: 'StrongP@ssw0rd!',
  })
  @IsString({ message: 'Password must be a string.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @MaxLength(64, { message: 'Password cannot exceed 64 characters.' })
  // Add more complex regex validation if needed for strong passwords
  password: string;

  // Add other required fields from your User entity here later, like full_name, phone_number, etc.
  // For Day 2, let's keep it simple with just email and password.
}
