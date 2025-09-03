import { Influencer } from "./influencer";
import { Brand } from "./brand";

export class Beat {
  constructor(
    public readonly id: number,
    public caption: string | null,
    public mediaUrl: string,
    public thumbnailUrl: string,
    public statusKey: string,
    public influencerId: number,
    public brandId: number,
    public readonly influencer: Influencer,
    public readonly brand: Brand,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
