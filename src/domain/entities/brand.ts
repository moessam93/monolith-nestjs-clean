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

  updateNames(nameEn: string, nameAr: string): void {
    this.nameEn = nameEn;
    this.nameAr = nameAr;
  }

  updateLogo(logoUrl: string): void {
    this.logoUrl = logoUrl;
  }

  updateWebsite(websiteUrl: string): void {
    this.websiteUrl = websiteUrl;
  }
}
