import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ example: 'refresh_token_string_here_if_used' })
  // We'll implement refresh tokens later, but prepare the DTO
  refresh_token?: string;

  @ApiProperty({ example: 'bearer' })
  token_type: string;

  @ApiProperty({ example: 3600, description: 'Expires in seconds' })
  expires_in: number;
}
