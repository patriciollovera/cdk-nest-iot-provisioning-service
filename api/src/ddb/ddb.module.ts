import 'reflect-metadata'
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { createConnection } from '@typedorm/core';
import { Table, TableOptions } from '@typedorm/common';
import { DynamoDB } from 'aws-sdk';

export const DDB_ORM_CLIENT = 'DDB_ORM_CLIENT';

@Module({})
export class DdbModule {
    static forRoot(ddbMoudleOption: {ddbTable: TableOptions, region: string, entities: any[]}): DynamicModule {

        const table = new Table(ddbMoudleOption.ddbTable);

        const ddbClient = new DynamoDB.DocumentClient({
            service: new DynamoDB({region: ddbMoudleOption.region}),
            region: ddbMoudleOption.region
        });

        console.log("NOMBRE DE LA TABLE");
        console.log(table.name);

        const ddb = createConnection({
            name: table.name,
            table: table,
            entities: ddbMoudleOption.entities,
            documentClient: ddbClient
        })

        const ddbProvider: Provider = {
            provide: DDB_ORM_CLIENT,
            useValue: ddb
        }

        return {
            module: DdbModule,
            providers: [ddbProvider],
            exports: [ddbProvider],
            global: true
        }

    }
}
