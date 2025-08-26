import { FindOneBrandResponseDto } from './find-one-brand-response.dto';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';

export class FindAllBrandsResponseDto {
  data: FindOneBrandResponseDto[];
  meta: PaginationMetaDto;

  constructor(data: FindOneBrandResponseDto[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }

  static fromBrands(brands: any[], meta: PaginationMetaDto): FindAllBrandsResponseDto {
    const mappedBrands = FindOneBrandResponseDto.fromBrands(brands);
    return new FindAllBrandsResponseDto(mappedBrands, meta);
  }
}
