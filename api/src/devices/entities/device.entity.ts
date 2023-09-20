import 'reflect-metadata'
import { Attribute, AutoGenerateAttribute, Entity, INDEX_TYPE } from "@typedorm/common";
import {AUTO_GENERATE_ATTRIBUTE_STRATEGY} from '@typedorm/common';
import { region, accessMap, expectedOutputs } from '../devices.model';

@Entity({
    name: 'device',
    primaryKey: {
        partitionKey: 'DEVICE#{{deviceId}}',
        sortKey: 'DEVICE#{{deviceId}}'
    },
    // indexes: {
    //     GSI1: {
    //         partitionKey: 'USECASE_FRIENDLY_NAME#{{friendlyName}}',
    //         sortKey: 'USECASE_ID#{{usecaseId}}',
    //         type: INDEX_TYPE.GSI
    //     }
    // }
})
export class DeviceEntity {
    
    @Attribute()
    deviceId: string;

    @Attribute()
    friendlyName: string;

    @Attribute()
    description: string;

    @Attribute()
    // @IsString()
    publishTopics: string;

    @Attribute()
    // @IsString()
    subscribeTopics: string;

    @Attribute()
    // @IsString()
    thingArn: string;

    @Attribute()
    // @IsString()
    thingId: string;

    @Attribute()
    // @IsString()
    certArn: string;

    @Attribute()
    // @IsString()
    certId: string;

    @Attribute()
    // @IsString()
    policyArn: string;

    @Attribute()
    // @IsString()
    caCert: string;

    @Attribute()
    // @IsString()
    iotEndpoint: string;

    @Attribute()
    // @IsString()
    ingestionTopic: string;

    @AutoGenerateAttribute({
        strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.ISO_DATE,
        autoUpdate: true
    })
    updatedAt?: Date;

}
