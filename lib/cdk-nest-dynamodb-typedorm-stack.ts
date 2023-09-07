import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { stageId, StageStackProps } from './common';
import { apistack } from './stacks/api.constructs';
import { DDBResources } from './stacks/ddb.resources';



export class CdkNestDynamodbTypedormStack extends cdk.Stack {
  apiresources: apistack;

  constructor(scope: Construct, id: string, props: StageStackProps) {
    super(scope, id, props);

    this.apiresources = new apistack(this, stageId('dynamo-api', props.stage));

    const deviceTable = new DDBResources(this, 'table', {
      tableName: 'deviceTable',
      partitionKeyName: 'PK',
      sortKeyName: 'SK',
      billingMode: 'PROVISIONED',
      timeToLiveAttribute: 'ttlExpiry',
      gsi:['GSI1', 'GSI2'],
      lsi:['LSI1']
    });

    // give required privileges
    deviceTable.lambdaRWAccess(this.apiresources.lambdafunciton);

  }
}
