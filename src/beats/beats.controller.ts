import { Controller, Delete, Get, Param, Post, Put, NotFoundException, Body, HttpException, HttpStatus } from "@nestjs/common";
import type { Beat } from "./beats.service";
import { BeatsService } from "./beats.service";
import { CreateBeatDto } from "./dto/create-beat-dto";
import { UpdateBeatDto } from "./dto/update-beat-dto";

@Controller('beats')
export class BeatsController {
    constructor(private beatsService: BeatsService) {}
    @Get()
    getBeats(): Beat[] {
        try{
            return this.beatsService.getAllBeats();
        }
        catch(err){
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    getBeat(@Param('id') id:string): Beat {
        const beat = this.beatsService.getBeatById(id);
        if (!beat) {
            throw new NotFoundException(`Beat with id ${id} not found`);
        }
        return beat;
    }

    @Post()
    createBeat(@Body() beat: CreateBeatDto): Beat {
        return this.beatsService.createBeat(beat);
    }

    @Put(':id')
    updateBeat(@Param('id') id:string, @Body() beat: UpdateBeatDto): Beat {
        const updatedBeat = this.beatsService.updateBeat(id, beat);
        if (!updatedBeat) {
            throw new NotFoundException(`Beat with id ${id} not found`);
        }
        return updatedBeat;
    }

    @Delete(':id')
    deleteBeat(@Param('id') id:string): string {
        return this.beatsService.deleteBeat(id) ? `Beat with id ${id} deleted` : `Beat with id ${id} not found`;
    }
}
