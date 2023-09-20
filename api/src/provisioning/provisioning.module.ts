import { Module } from '@nestjs/common';
import { PolicyBuilderService } from './policy-builder.service';
import { ProvisioningConfig } from './provisioning.config';
import { ProvisioningService } from './provisioning.service';

@Module({
  providers: [ProvisioningService, ProvisioningConfig, PolicyBuilderService],
  exports: [ProvisioningService]
})
export class ProvisioningModule {}
