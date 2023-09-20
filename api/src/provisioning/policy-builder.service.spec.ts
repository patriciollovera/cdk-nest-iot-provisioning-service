import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PolicyBuilderService } from './policy-builder.service';
import { ProvisioningConfig } from './provisioning.config';

describe('PolicyBuilderService', () => {
    let service: PolicyBuilderService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PolicyBuilderService, ProvisioningConfig],
            imports: [
                ConfigModule.forRoot({
                    envFilePath: '.env'
                })
            ]
        }).compile();

        service = module.get<PolicyBuilderService>(PolicyBuilderService);
    });

    it('get doc', () => {
        service.init('mqttClientId');
        service.allowIngestion('physicalDeviceId', 'mqttClientId');
        service.allowPublish('pubTopic1');
        service.allowPublish('pubTopic2');
        service.allowPublish('pubTopic3');
        service.allowSubscribe('subTopic1');
        service.allowSubscribe('subTopic2');
        const res = service.getPolicy();
        console.log(res);
    })
})