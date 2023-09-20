import { Test, TestingModule } from '@nestjs/testing';
import { ProvisioningService } from './provisioning.service';
import { Iot } from 'aws-sdk';
import { AwsSdkModule } from 'nest-aws-sdk';
import { PolicyBuilderService } from './policy-builder.service';
import { ProvisioningConfig } from './provisioning.config';

describe('ProvisioningService', () => {
  let service: ProvisioningService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProvisioningService, PolicyBuilderService, ProvisioningConfig],
      imports: [
        AwsSdkModule.forRoot({
            defaultServiceOptions: {
                region: 'us-east-1'
            },
            services: [Iot]
        })
      ]
    }).compile();

    service = module.get<ProvisioningService>(ProvisioningService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

//   it('createKeyAndCertificate', async () => {
//     const res = await service.createKeyAndCertificate();
//     console.log(JSON.stringify(res.certificatePem));
//     console.log(JSON.stringify(res.keyPair.PrivateKey));
//   });

//   it('createThing', async () => {
//     const res = await service.createThing('test123');
//     console.log(res);
//   });

//   it('attachThingCertificate', async () => {
//     const res = await service.attachThingCertificate('test123', 'arn:aws:iot:us-east-1:549632206553:cert/4fc315f3e814d4aa1c345449b0606a8471b48ba391aade1357865676a721b21a');
//     console.log(res);
//   });

  it('getCaCert', async () => {
    const res = await service.getCaCert();
    console.log(res);
  });

  it('deleteThingCredentials', async () => {
    const res = await service.deleteThingCredentials(
        'iotPlatformTest03',
        '5dcab326616ea91133a7045c1e5ec5643be2d189ddac4418d3e38c1ec9981f3b',
        'arn:aws:iot:us-east-1:549632206553:cert/5dcab326616ea91133a7045c1e5ec5643be2d189ddac4418d3e38c1ec9981f3b'
    );
    console.log(res);
  });

});
