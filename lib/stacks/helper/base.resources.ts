import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class BaseConstruct extends Construct {
    id: string
    awsAccountId: string
    awsRegion: string

    constructor(scope: Construct, constructId: string) {
        super(scope, constructId);
        this.id = constructId
        this.awsAccountId = cdk.Stack.of(this).account
        this.awsRegion = cdk.Stack.of(this).region
    }

    resourceId(name: string) {
        return `${this.id}-${name}`
    }

}