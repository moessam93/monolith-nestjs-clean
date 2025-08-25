import { IsNumber, IsString, IsOptional } from "class-validator";

export class UpdateBeatDto {
    @IsOptional()
    @IsString()
    readonly name?: string;
    
    @IsOptional()
    @IsNumber()
    readonly price?: number;

    @IsOptional()
    @IsString()
    readonly description?: string;    
    // add other properties as needed
}