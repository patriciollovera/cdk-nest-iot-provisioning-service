import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BaseConstruct } from './helper/base.resources';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { TableProps } from 'aws-cdk-lib/aws-dynamodb';
import { IGrantable } from 'aws-cdk-lib/aws-iam';

export interface DDBResourcesProps {
    tableName: string;
    partitionKeyName: string;
    sortKeyName: string;
    lsi?: string[];
    gsi?: string[];
    billingMode: 'PAY_PER_REQUEST' | 'PROVISIONED'
    timeToLiveAttribute?: string;
}

export class DDBResources extends BaseConstruct {
    
    dynamodbTable: dynamodb.Table

    constructor(scope: Construct, constructId: string, props: DDBResourcesProps) {
        super(scope, constructId);
        this.dynamodbTable = this.createDynamodbTable(
            props.tableName, 
            props.partitionKeyName, 
            props.sortKeyName,
            <dynamodb.BillingMode>props.billingMode,
            props.timeToLiveAttribute);
    
        if(props.lsi) {
            props.lsi.forEach((lsi: string) => {
                this.createLSI(lsi);
            });
        }
        if(props.gsi) {
            props.gsi.forEach((gsi: string) => {
                this.createGSI(gsi)
            })
        }
    }

    createDynamodbTable(
        tableName: string, 
        partitionKeyName: string, 
        sortKeyName: string, 
        billingMode = dynamodb.BillingMode.PAY_PER_REQUEST, 
        timeToLiveAttribute?: string
    ) {
        let createDynamodbTableParameters = {
            tableName: tableName,
            partitionKey: { name: partitionKeyName, type: dynamodb.AttributeType.STRING },
            sortKey: {name: sortKeyName, type: dynamodb.AttributeType.STRING},
            billingMode: billingMode,
            removalPolicy: cdk.RemovalPolicy.DESTROY
        } as {[key: string]: any};
        if (timeToLiveAttribute) {
            createDynamodbTableParameters['timeToLiveAttribute'] = timeToLiveAttribute;
        }
        return new dynamodb.Table(this, this.resourceId(tableName), <TableProps>createDynamodbTableParameters );
    }

    createLSI(lsiName: string) {
        const localSecondaryIndexProps: dynamodb.LocalSecondaryIndexProps = {
            indexName: lsiName,
            sortKey: {
                name: `${lsiName}SK`,
                type: dynamodb.AttributeType.STRING,
                },
                projectionType: dynamodb.ProjectionType.ALL
            };
        this.dynamodbTable.addLocalSecondaryIndex(localSecondaryIndexProps);
    }

    createGSI(gsiName: string) {
        const globalSecondaryIndexProps: dynamodb.GlobalSecondaryIndexProps = {
            indexName: gsiName,
            partitionKey: {
                name: `${gsiName}PK`,
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: `${gsiName}SK`,
                type: dynamodb.AttributeType.STRING,
                },
                projectionType: dynamodb.ProjectionType.ALL
            };
        this.dynamodbTable.addGlobalSecondaryIndex(globalSecondaryIndexProps);
    }

    lambdaRWAccess(lambda:IGrantable){
        this.dynamodbTable.grantReadWriteData(lambda);
    }

}
