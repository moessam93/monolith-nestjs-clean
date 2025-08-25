import { Injectable } from '@nestjs/common';
import { last } from 'rxjs';
import { CreateBeatDto } from './dto/create-beat-dto';
import { UpdateBeatDto } from './dto/update-beat-dto';

export interface Beat {
    id: string;
    name: string;
    price: number;
    description?: string;    
    // add other properties as needed
}

@Injectable()
export class BeatsService {
    // local db local array
    private readonly beats: Beat[] = [];
    getAllBeats() {
        return this.beats;
    }
    getBeatById(id: string) {
        return this.beats.find(beat => beat.id === id);
    }
    createBeat(beat: CreateBeatDto) {
        const lastBeat = this.beats[this.beats.length - 1];
        const newBeat: Beat = {
            id: lastBeat ? (Number(lastBeat.id) + 1).toString() : '1',
            name: beat.name,
            price: beat.price,
            description: beat.description
            // add other properties as needed
        };
        this.beats.push(newBeat);
        return newBeat;
    }
    updateBeat(id: string, updatedBeat:UpdateBeatDto) {
        const index = this.beats.findIndex(beat => beat.id === id);
        if (index !== -1) {
            if (updatedBeat.name && updatedBeat.name !== this.beats[index].name) {
                // Prevent changing the id
                this.beats[index].name = updatedBeat.name;
            }

            if (updatedBeat.price && updatedBeat.price !== this.beats[index].price) {
                // Prevent changing the id
                this.beats[index].price = updatedBeat.price;
            }

            if (updatedBeat.description && updatedBeat.description !== this.beats[index].description) {
                // Prevent changing the id
                this.beats[index].description = updatedBeat.description;
            }

            this.beats[index] = { ...this.beats[index], ...updatedBeat };
            return this.beats[index];
        }
        return null;
    }
    deleteBeat(id: string) {
        const index = this.beats.findIndex(beat => beat.id === id);
        if (index !== -1) {
            this.beats.splice(index, 1);
            return true;
        }
        return false;
    }
}