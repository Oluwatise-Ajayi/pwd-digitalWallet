import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../entities/user.entity'; // Import UserRole enum

export const ROLES_KEY = 'roles'; // Key to store roles metadata
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
