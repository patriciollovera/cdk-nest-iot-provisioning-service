import 'reflect-metadata';
import { HttpException, Injectable, Inject, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { Connection } from '@typedorm/core';
import { DDB_ORM_CLIENT } from '../ddb/ddb.module';
import { DeviceEntity } from './entities/device.entity';
import { region } from './devices.model';
import { Iot } from 'aws-sdk';
import { ProvisioningService } from '../provisioning/provisioning.service'
import { InjectAwsService } from 'nest-aws-sdk';

@Injectable()
export class DeviceDao{
    private logger = new Logger('deviceDao');

    constructor(
        @InjectAwsService(Iot) private readonly iotClient: Iot,
        private provisioningService: ProvisioningService,
        @Inject(DDB_ORM_CLIENT) private ddb: Connection
    ) {}

    async listDevices() {
        return await this.ddb.scanManager.scan({
            entity: DeviceEntity,
        });
    }

    async getDevice(deviceId: string) {
        let device = await this.ddb.entityManager.findOne(DeviceEntity, {deviceId});
        if (device){
            return device
        } else {
            throw new NotFoundException('Device Not Found');
        }
        
    }

    async createDevice(device: DeviceEntity) {
        this.logger.debug(`createDevice: createDeviceDto: ${JSON.stringify(device)}`);

        // if id is in the dto, service logic check its duplication
        if ((await this.getDevice(device.deviceId))) {
            throw new ConflictException(`Device Id (${device.deviceId}) is reserved.`);
        }
       
        const createThing = await this.createIotThing(device);
        device.thingArn = createThing.thing.thingArn;
        device.thingId = createThing.thing.thingId;
        device.certArn = createThing.cert.certificateArn;
        device.certId = createThing.cert.certificateId;
        device.iotEndpoint = createThing.endPoint.endpointAddress;
        device.policyArn = createThing.policy.policyArn;

        this.logger.debug(`createDevice: device: ${JSON.stringify(device)}`);
        return await this.ddb.entityManager.create(device);
    }

    async createIotThing(device: DeviceEntity) {
        let thing: Iot.CreateThingResponse;
        let cert: Iot.CreateKeysAndCertificateResponse;
        let policy: Iot.CreatePolicyResponse;
        let caCert: any;
        let endPoint: Iot.DescribeEndpointResponse;
        let ingestionTopic: string;

        thing = await this.provisioningService.createThing(device.deviceId);
        this.logger.debug(`create thing: thing: ${JSON.stringify(thing)}`)
        this.logger.debug(`create thing: device: ${JSON.stringify(device)}`)
        try {
            cert = await this.provisioningService.createKeyAndCertificate();
            this.logger.debug(`create thing: cert: ${JSON.stringify(cert)}`)

            policy = await this.provisioningService.createPolicy({
                deviceId: device.deviceId,
                publishTopics: device.publishTopics,
                subscribeTopics: device.subscribeTopics
            });
            console.log(policy);
            this.logger.debug(`create thing: policy: ${policy}`)
            caCert = await this.provisioningService.getCaCert();
            this.logger.debug(`create thing: caCert: ${caCert}`)
            endPoint = await this.provisioningService.getEndpoint();
            this.logger.debug(`create device: endPoint: ${endPoint}`)
            ingestionTopic = await this.provisioningService.getIngestionTopics(
                device.deviceId
            )
            this.logger.debug(`create device: thing.thingName: ${thing.thingName}, cert.certificateArn: ${cert.certificateArn}`);    
            await this.provisioningService.attachThingCertificate(thing.thingName, cert.certificateArn);
            await this.provisioningService.attachPolicy(policy.policyName, cert.certificateArn);
        } catch (e) {
            this.logger.error(`createIotThing: error: e: ${JSON.stringify(e)}`);
            try { 
                await this.provisioningService.deleteThingCredentials(device.deviceId, cert.certificateId, cert.certificateArn);
            } catch (e) {
                this.logger.error(`createIotThing: deleteThingCredentials: error: e: ${JSON.stringify(e)}`);
            }
            await this.provisioningService.deleteThing(device.deviceId);
            new HttpException(e.text, e.status);
        }
        return { thing, cert, policy, caCert, endPoint, ingestionTopic }
    }

    async updateDevice(deviceId: string, device: Partial<DeviceEntity>) {
        
        // if id is in the dto, service logic check its duplication
        if (!(await this.getDevice(deviceId))) {
            throw new NotFoundException(`Device Id (${deviceId}) not found.`);
        }
        return await this.ddb.entityManager.update(DeviceEntity, {
            deviceId
        }, {
            ...device
        });
    }

    async deleteDevice(deviceId: string) {
        let device: any;
        this.logger.debug(`deleteDevice: deleteDeviceResources: ${JSON.stringify(deviceId)}`);
        
        device = await this.getDevice(deviceId);
        const createThing = await this.deleteDeviceResources(device);
        return await this.ddb.entityManager.delete(DeviceEntity, {
            deviceId
        });
    }

    async deleteDeviceResources(deviceId: DeviceEntity) {
        await this.provisioningService.deleteThingCredentials(deviceId.deviceId, <string>deviceId.certId, <string>deviceId.certArn);
        await this.provisioningService.deleteThing(deviceId.deviceId);
    }


    


}