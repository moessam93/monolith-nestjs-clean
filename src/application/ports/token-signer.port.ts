export interface TokenSignerPort {
  sign(payload: Record<string, any>, options?: { expiresIn?: string }): Promise<{ token: string; exp?: number }>;
  verify(token: string): Promise<any>;
  decode(token: string): any;
}
