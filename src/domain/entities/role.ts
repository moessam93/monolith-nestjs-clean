export class Role {
  constructor(
    public readonly id: number,
    public readonly key: string,
    public nameEn: string,
    public nameAr: string,
  ) {}

  updateNames(nameEn: string, nameAr: string): void {
    this.nameEn = nameEn;
    this.nameAr = nameAr;
  }
}
