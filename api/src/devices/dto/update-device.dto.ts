import { PartialType } from '@nestjs/mapped-types';
import { CreateDeviceDto } from './create-device.dto';
import { IsNotEmpty,IsString, IsOptional, IsArray, IsNumber, IsIn, ArrayNotEmpty } from "class-validator";
import { region, accessMap, expectedOutputs } from '../devices.model';


export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {
    
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
