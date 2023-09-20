import { Injectable, Logger } from '@nestjs/common';
import { InjectAwsService } from 'nest-aws-sdk';
import { Iot } from 'aws-sdk';
import { PolicyBuilderService } from './policy-builder.service';
import { PolicyParams } from './provisioning.model';
import * as request from 'superagent';
import { ProvisioningConfig } from './provisioning.config';

@Injectable()
export class ProvisioningService {
    logger: Logger;

    constructor(
        @InjectAwsService(Iot) private readonly iotClient: Iot,
        private policyBuilderService : PolicyBuilderService,
        private provisioningConfig: ProvisioningConfig
    ){
        this.logger = new Logger('ProvisioningService')
    }

    async createKeyAndCertificate(){
        const res = await this.iotClient.createKeysAndCertificate({
            setAsActive: true
        }).promise() as Iot.CreateKeysAndCertificateResponse;
        return res;
    }

    async deleteThingCredentials(deviceId:string, certficateId: string, certficateArn: string ){
        let errors: Error[] = [];
        const policyName = deviceId;
        // even an error has been happened, next deletion would be executed.
        try {
            await this.iotClient.detachThingPrincipal({
                thingName: deviceId,
                principal: certficateArn
            }).promise();
        } catch (e) {
            this.logger.error(`deleteThingCredentials: error: ${JSON.stringify(e)}`);
            errors.push(e);
        }
        try {
            await this.iotClient.detachPolicy({
                policyName: policyName, // all iot device has a same name of its deviceId
                target: certficateArn
            }).promise();
        } catch (e) {
            this.logger.error(`deleteThingCredentials: error: ${JSON.stringify(e)}`);
            errors.push(e);
        }
        try {
            const policyVersions = await this.iotClient.listPolicyVersions({
                policyName: policyName
            }).promise();
            await Promise.all(policyVersions.policyVersions.map(async version => {
                if(version.isDefaultVersion === false) {
                    await this.iotClient.deletePolicyVersion({
                        policyName: policyName,
                        policyVersionId: version.versionId
                    }).promise();
                }
            }));
            await this.iotClient.deletePolicy({
                policyName: policyName
            }).promise();
        } catch (e) {
            this.logger.error(`deleteThingCredentials: error: ${JSON.stringify(e)}`);
            errors.push(e);
        }
        try {
            await this.iotClient.updateCertificate({
                certificateId: certficateId,
                newStatus: 'INACTIVE'
            }).promise();
        } catch (e) {
            this.logger.error(`deleteThingCredentials: error: ${JSON.stringify(e)}`);
            errors.push(e);
        }
        try {
            await this.iotClient.deleteCertificate({
                certificateId: certficateId,
                forceDelete: true
            }).promise();
        } catch (e) {
            this.logger.error(`deleteThingCredentials: error: ${JSON.stringify(e)}`);
            errors.push(e);
        }

        if (errors.length > 0) {
            this.logger.error(`deleteThingCredentials: errors: ${JSON.stringify(errors)}`);
            throw new Error('Could not delete credentials');
        }

    }

    async createThing(deviceId: string){
        const res = await this.iotClient.createThing({
            thingName: deviceId
        }).promise() as Iot.CreateThingResponse;
        return res;
    }

    async deleteThing(deviceId: string){
        const res = await this.iotClient.deleteThing({
            thingName: deviceId
        }).promise() as Iot.DeleteThingGroupResponse;
        return res; 
    }

    async attachThingCertificate(deviceId: string, certArn: string){
        const res = await this.iotClient.attachThingPrincipal({
            thingName: deviceId,
            principal: certArn
        }).promise() as Iot.AttachThingPrincipalResponse
        return res;
    }

    async createPolicy(policyParams: PolicyParams){
        // Create Policy
        this.logger.debug(`create policy: params: ${JSON.stringify(policyParams)}`);
        this.policyBuilderService.init(policyParams.deviceId);
        this.logger.debug(`create policy: init done`);
        this.policyBuilderService.allowIngestion(policyParams.deviceId);
        this.logger.debug(`create policy: allow ingestion done`);
        this.policyBuilderService.allowPublish(policyParams.publishTopics);
        this.logger.debug(`create policy: allow publish done`);
        this.policyBuilderService.allowSubscribe(policyParams.subscribeTopics);
        this.logger.debug(`create policy: allow subscribe done`);
        const policyDoc = this.policyBuilderService.getPolicy();
        return await this.iotClient.createPolicy({
            policyName: `${policyParams.deviceId}`,
            policyDocument: policyDoc
        }).promise() as Iot.CreatePolicyResponse;
    }

    async attachPolicy(policyName: string, certId: string){
        return await this.iotClient.attachPolicy({
            policyName: policyName,
            target: certId
        }).promise();
    }

    async getCaCert(){
        const url = 'https://www.amazontrust.com/repository/AmazonRootCA1.pem'
        const res = await request.get(url)
        return {
            caCertPem: res.text
        }
    }

    async getEndpoint(){
        return await this.iotClient.describeEndpoint({endpointType: 'iot:Data-ATS'}).promise() as Iot.DescribeEndpointResponse;
    }

    async getIngestionTopics(deviceId: string){
       
        this.logger.debug(`getIngestionTopics: topic: ${this.provisioningConfig.ingestionRuleDecodedName}/${deviceId}`);
        return `${this.provisioningConfig.ingestionRuleDecodedName}/${deviceId}`;
        // return `${this.provisioningConfig.ingestionRuleDecodedName}/${physicalDeviceId}/${mqttClientId}/decoded`;
    }

}
