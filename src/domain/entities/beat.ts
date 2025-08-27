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

  updateCaption(caption: string | null): void {
    this.caption = caption;
  }

  updateMedia(mediaUrl: string, thumbnailUrl: string): void {
    this.mediaUrl = mediaUrl;
    this.thumbnailUrl = thumbnailUrl;
  }

  updateStatus(statusKey: string): void {
    this.statusKey = statusKey;
  }

  isActive(): boolean {
    return this.statusKey === 'active';
  }
}
