import { Injectable, Logger } from '@nestjs/common';
import { ProvisioningConfig } from './provisioning.config';

export interface IotStatement {
    Effect: 'Allow' | 'Deny';
    Action: string[];
    Resource: string[];
}

export interface IotPolicy {
    Version: string;
    Statement: IotStatement[];
}

@Injectable()
export class PolicyBuilderService {
    logger: Logger;
    iotPolicy: IotPolicy;
    arnPrefix: string;

    constructor(
        private provisioningConfig: ProvisioningConfig
    ){
        this.logger = new Logger('PolicyBuilderService');
        this.arnPrefix = `arn:aws:iot:${this.provisioningConfig.region}:${this.provisioningConfig.accountId}`;
        this.logger.debug(`Policy Builder Service: arn: ${this.arnPrefix}`);
    }

    init(deviceId: string){
        this.logger.debug(`Policy Builder Service: init: ${deviceId}`);
        this.iotPolicy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: 'Allow',
                    Action: ['iot:Connect'],
                    // Resource: [`${this.arnPrefix}:client/${mqttClientId}`]
                    Resource: [`${this.arnPrefix}:client/*`]
                },
                {
                    Effect: 'Allow',
                    Action: ['iot:Publish'],
                    Resource: [`${this.arnPrefix}:topic/${deviceId}`]
                },
                {
                    Effect: 'Allow',
                    Action: ['iot:Subscribe'],
                    Resource: [`${this.arnPrefix}:topicfilter/${deviceId}`]
                },
                {
                    Effect: 'Allow',
                    Action: ['iot:Receive'],
                    Resource: [`${this.arnPrefix}:topic/${deviceId}`]
                },
            ]
        }
        this.logger.debug(`Policy Builder Service: policy: ${this.iotPolicy}`);
    }

    allowIngestion(deviceId: string){
        const passthroughTopic = `${this.provisioningConfig.ingestionRulePassthroughName}/${deviceId}/passthrough`
        const decodedTopic = `${this.provisioningConfig.ingestionRuleDecodedName}/${deviceId}/decoded`
        this.iotPolicy.Statement[1].Resource.push(`${this.arnPrefix}:topic/${passthroughTopic}*`);
        this.iotPolicy.Statement[1].Resource.push(`${this.arnPrefix}:topic/${decodedTopic}*`);
        // this.iotPolicy.Statement[1].Resource.push(`${this.arnPrefix}:topic/${passthroughTopic}`);
        // this.iotPolicy.Statement[1].Resource.push(`${this.arnPrefix}:topic/${decodedTopic}`);
    }

    allowPublish(topic: string) {
        this.iotPolicy.Statement[1].Resource.push(`${this.arnPrefix}:topic/${topic}/*`);
    }

    allowSubscribe(topic: string) {
        this.iotPolicy.Statement[2].Resource.push(`${this.arnPrefix}:topicfilter/${topic}/*`);
        this.iotPolicy.Statement[3].Resource.push(`${this.arnPrefix}:topic/${topic}/*`);
    }

    getPolicy(){
        return JSON.stringify(this.iotPolicy);
    }

}