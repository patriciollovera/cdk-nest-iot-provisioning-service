import { BadRequestException, Injectable, Logger, UnsupportedMediaTypeException, forwardRef, Inject } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DeviceType } from './devices.model';
import { DeviceEntity } from './entities/device.entity';
import { DeviceDao } from './devices.dao';


@Injectable()
export class DevicesService {
  private logger = new Logger('UsecaseService');

  constructor(
    private deviceDao: DeviceDao,
  ) {}

  async create(createDeviceDto: CreateDeviceDto) {
    let device = new DeviceEntity();
    Object.keys(createDeviceDto).map( key => {
      device[key] = createDeviceDto[key]
    });
    const res = await this.deviceDao.createDevice(device);
    return res;
  }

  async findAll() {
    //return `This action returns all devices`;
    return await this.deviceDao.listDevices();
  }

  async findOne(deviceId: string) {
    return await this.deviceDao.getDevice(deviceId);
  }

  async update(deviceId: string, updateDeviceDto: UpdateDeviceDto) {
    const res = await this.deviceDao.updateDevice(deviceId, {
      ...updateDeviceDto
    });
    return res;
  }

  async remove(deviceId: string) {
    const res = await this.deviceDao.deleteDevice(deviceId);
    return res;
  }
}
