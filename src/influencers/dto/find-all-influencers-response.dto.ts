import { FindOneInfluencerResponseDto } from './find-one-influencer-response.dto';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';

export class FindAllInfluencersResponseDto {
  data: FindOneInfluencerResponseDto[];
  meta: PaginationMetaDto;

  constructor(data: FindOneInfluencerResponseDto[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }

  static fromInfluencers(influencers: any[], meta: PaginationMetaDto): FindAllInfluencersResponseDto {
    const mappedInfluencers = FindOneInfluencerResponseDto.fromInfluencers(influencers);
    return new FindAllInfluencersResponseDto(mappedInfluencers, meta);
  }
}
