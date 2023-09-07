import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { DeviceDao } from './devices.dao';

@Module({
  controllers: [DevicesController],
  providers: [DevicesService, DeviceDao]
})
export class DevicesModule {}
