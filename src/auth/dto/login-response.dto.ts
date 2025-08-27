export class LoginResponseDto {
  id: string;
  email: string;
  name: string;
  roles: string[];
  access_token: string;
  expiredAt: Date;
}
