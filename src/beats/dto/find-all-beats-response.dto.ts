import { FindOneBeatResponseDto } from './find-one-beat-response.dto';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';

export class FindAllBeatsResponseDto {
  data: FindOneBeatResponseDto[];
  meta: PaginationMetaDto;

  constructor(data: FindOneBeatResponseDto[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }

  static fromBeats(beats: any[], meta: PaginationMetaDto): FindAllBeatsResponseDto {
    const mappedBeats = FindOneBeatResponseDto.fromBeats(beats);
    return new FindAllBeatsResponseDto(mappedBeats, meta);
  }
}
