export interface JWTPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface JWTRefreshPayload {
  userId: string;
}
