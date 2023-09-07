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

    @AutoGenerateAttribute({
        strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.ISO_DATE,
        autoUpdate: true
    })
    updatedAt?: Date;

}
