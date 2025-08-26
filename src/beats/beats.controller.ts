import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { BeatsService } from './beats.service';
import { CreateBeatDto } from './dto/create-beat.dto';
import { UpdateBeatDto } from './dto/update-beat.dto';
import { FindAllBeatsResponseDto } from './dto/find-all-beats-response.dto';
import { FindOneBeatResponseDto } from './dto/find-one-beat-response.dto';

@Controller('beats')
export class BeatsController {
  constructor(private readonly beatsService: BeatsService) {}

  @Post()
  create(@Body() createBeatDto: CreateBeatDto) {
    return this.beatsService.create(createBeatDto);
  }

  @Get()
  findAll(@Query('search') search: string, @Query('page', ParseIntPipe) page: number = 1, @Query('limit', ParseIntPipe) limit: number = 10): Promise<FindAllBeatsResponseDto> {
    return this.beatsService.findAll(search, page, limit);
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number): Promise<FindOneBeatResponseDto | null> {
    return this.beatsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateBeatDto: UpdateBeatDto) {
    return this.beatsService.update(id, updateBeatDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.beatsService.remove(id);
  }
}
