import 'reflect-metadata';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Connection } from '@typedorm/core';
import { DDB_ORM_CLIENT } from '../ddb/ddb.module';
import { DeviceEntity } from './entities/device.entity';
import { region } from './devices.model';

@Injectable()
export class DeviceDao{
    private logger = new Logger('deviceDao');

    constructor(
        @Inject(DDB_ORM_CLIENT) private ddb: Connection
    ) {}

    async listDevices() {
        return await this.ddb.scanManager.scan({
            entity: DeviceEntity,
        });
    }

    async getDevice(deviceId: string) {
        return await this.ddb.entityManager.findOne(DeviceEntity, {
            deviceId
        })
    }

    async createDevice(device: DeviceEntity) {
        this.logger.debug(`createDevice: device: ${JSON.stringify(device)}`);
        return await this.ddb.entityManager.create(device);
    }

    async updateDevice(deviceId: string, device: DeviceEntity) {
        return await this.ddb.entityManager.update(DeviceEntity, {
            deviceId
        }, {
            ...device
        });
    }

    async deleteDevice(deviceId: string) {
        return await this.ddb.entityManager.delete(DeviceEntity, {
            deviceId
        });
    }


}