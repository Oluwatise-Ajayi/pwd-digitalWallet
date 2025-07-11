export interface JwtPayload {
  sub: string; // User ID
  email: string; // User email
  // Add any other data you want to carry in the JWT (e.g., roles)
}
