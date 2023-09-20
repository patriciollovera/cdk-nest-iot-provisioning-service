import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { DeviceDao } from './devices.dao';
import { ProvisioningService } from '../provisioning/provisioning.service';
import { PolicyBuilderService } from '../provisioning/policy-builder.service';
import { ProvisioningConfig } from '../provisioning/provisioning.config';
import { ProvisioningModule } from '../provisioning/provisioning.module';

@Module({
  imports: [
    ProvisioningModule
  ],
  controllers: [DevicesController],
  providers: [DevicesService, ProvisioningService, PolicyBuilderService, DeviceDao, ProvisioningConfig]
})
export class DevicesModule {}
