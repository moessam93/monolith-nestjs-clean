export class Brand {
  constructor(
    public readonly id: number,
    public nameEn: string,
    public nameAr: string,
    public logoUrl: string,
    public websiteUrl: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
