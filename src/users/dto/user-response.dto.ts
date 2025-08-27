export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  phoneNumberCountryCode?: string;
  createdAt: Date;
  updatedAt: Date;
  roles: {
    id: number;
    key: string;
    nameEn: string;
    nameAr: string;
  }[];
}
