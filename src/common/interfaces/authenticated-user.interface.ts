export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  /** Status atual da conta (carregado do banco no JwtStrategy). */
  status?: string;
}
