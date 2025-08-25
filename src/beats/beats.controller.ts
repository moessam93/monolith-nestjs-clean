import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BeatsService } from './beats.service';
import { CreateBeatDto } from './dto/create-beat.dto';
import { UpdateBeatDto } from './dto/update-beat.dto';

@Controller('beats')
export class BeatsController {
  constructor(private readonly beatsService: BeatsService) {}

  @Post()
  create(@Body() createBeatDto: CreateBeatDto) {
    return this.beatsService.create(createBeatDto);
  }

  @Get()
  findAll(@Query('search') search: string) {
    return this.beatsService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.beatsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBeatDto: UpdateBeatDto) {
    return this.beatsService.update(+id, updateBeatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.beatsService.remove(+id);
  }
}
