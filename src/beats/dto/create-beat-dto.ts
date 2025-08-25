import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateBeatDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsNumber()
    @IsNotEmpty()
    readonly price: number;
    
    readonly description: string;
    // add other properties as needed
}