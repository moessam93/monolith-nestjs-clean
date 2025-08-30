export class Beat {
  constructor(
    public readonly id: number,
    public caption: string | null,
    public mediaUrl: string,
    public thumbnailUrl: string,
    public statusKey: string,
    public influencerId: number,
    public brandId: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
