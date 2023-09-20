import { IsNotEmpty, IsArray, IsOptional, IsString, IsBoolean, Matches } from "class-validator";

export class CreateDeviceDto {
    
    @IsString()
    @IsNotEmpty()
    @Matches(/^IOT[0-9]{12}$/)
    deviceId: string;

    @IsString()
    friendlyName: string;

    @IsString()
    description: string;

    @IsOptional()
    // @IsArray()
    publishTopics: string;

    @IsOptional()
    // @IsArray()
    subscribeTopics: string;

    @IsString()
    @IsOptional()
    thingArn: string;

    @IsString()
    @IsOptional()
    thingId: string;

    @IsString()
    @IsOptional()
    certArn: string;

    @IsString()
    @IsOptional()
    certId: string;

    @IsString()
    @IsOptional()
    policyArn: string;

    @IsString()
    @IsOptional()
    caCert: string;

    @IsString()
    @IsOptional()
    iotEndpoint: string;

    @IsString()
    @IsOptional()
    ingestionTopic: string;

}