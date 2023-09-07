import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './devices/devices.module';
import { DdbModule } from './ddb/ddb.module';
import { DeviceEntity } from './devices/entities/device.entity';
import { INDEX_TYPE } from '@typedorm/common';

@Module({
  imports: [
    DevicesModule,
    DdbModule.forRoot({
      ddbTable: {
          name: process.env.DDB_TABLE,
          partitionKey: 'PK',
          sortKey: 'SK',
          indexes: {
              LSI1: {
                  type: INDEX_TYPE.LSI,
                  sortKey: 'LSI1SK'
              },
              GSI1: {
                  type: INDEX_TYPE.GSI,
                  partitionKey: 'GSI1PK',
                  sortKey: 'GSI1SK'
              },
              GSI2: {
                  type: INDEX_TYPE.GSI,
                  partitionKey: 'GSI2PK',
                  sortKey: 'GSI2SK'
              }
          }
      },
      region: process.env.REGION,
      entities: [DeviceEntity]
  }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
