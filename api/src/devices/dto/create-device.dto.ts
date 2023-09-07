import { IsNotEmpty, IsString, IsOptional, IsArray, IsNumber, IsObject, IsIn, ArrayNotEmpty } from "class-validator";
import { region, accessMap, expectedOutputs } from '../devices.model';

export class CreateDeviceDto {

    @IsString()
    @IsNotEmpty()
    deviceId: string;

    @IsString()
    @IsNotEmpty()
    friendlyName: string;

    @IsString()
    @IsNotEmpty()
    description: string;

}
