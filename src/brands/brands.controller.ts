import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { FindAllBrandsResponseDto } from './dto/find-all-brands-response.dto';
import { FindOneBrandResponseDto } from './dto/find-one-brand-response.dto';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @Get()
  findAll(@Query('search') search: string, @Query('page', ParseIntPipe) page: number = 1, @Query('limit', ParseIntPipe) limit: number = 10): Promise<FindAllBrandsResponseDto> {
    return this.brandsService.findAll(search, page, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<FindOneBrandResponseDto | null> {
    return this.brandsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandsService.update(id, updateBrandDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.remove(id);
  }
}
