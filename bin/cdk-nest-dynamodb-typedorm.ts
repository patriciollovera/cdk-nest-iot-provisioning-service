#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkNestDynamodbTypedormStack } from '../lib/cdk-nest-dynamodb-typedorm-stack';

const app = new cdk.App();
new CdkNestDynamodbTypedormStack(app, 'CdkNestDynamodbTypedormStack', {
  stage: 'dev',
});