import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as lambda from "aws-cdk-lib/aws-lambda";
import * as gateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Cors, EndpointType, IResource, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { CfnParameter} from 'aws-cdk-lib';
import { IGrantable } from 'aws-cdk-lib/aws-iam';


export class apistack extends Construct {

  readonly lambdafunciton: IGrantable;	

  constructor(scope: Construct, id: string)
    {
      super(scope, id);
  
    // pack all external deps in layer
    const dynamoApiLayer = new cdk.aws_lambda.LayerVersion(this, "dynamoApiLayer", {
      code: cdk.aws_lambda.Code.fromAsset("api/node_modules"),
      compatibleRuntimes: [
        cdk.aws_lambda.Runtime.NODEJS_16_X,
      ],
    });
        
    // add handler to respond to all our api requests
    const dynamoAPiLambda = new cdk.aws_lambda.Function(this, "dynamoApiHandler", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("api/dist"),
      handler: "main.api",
      layers: [dynamoApiLayer],
      timeout: cdk.Duration.seconds(10),
      environment: {
        NODE_PATH: "$NODE_PATH:/opt",
        DDB_TABLE: "deviceTable",
      },
    });

    this.lambdafunciton = dynamoAPiLambda;

    const nestapi = new cdk.aws_apigateway.RestApi(this, `dynamoApiEndpoint`, {
      restApiName: `dynamoApiLambda`,
      defaultMethodOptions: {
        apiKeyRequired: false,
      },
      deployOptions: {
        stageName: 'v1',
      },
      defaultCorsPreflightOptions: {
				allowOrigins: Cors.ALL_ORIGINS,
			},

    });

    
    
    // Asign secret as API Key
    // add api key to enable monitoring
    const api_Key = nestapi.addApiKey('dynamo-ApiKey', {
      apiKeyName: `dynamo-api-key`,
    });
    
    
    const usagePlan = nestapi.addUsagePlan('dynamo-UsagePlan', {
      description: 'dynamo-Standard',
      name: 'dynamo-Standard',
    });

    usagePlan.addApiKey(api_Key);

    usagePlan.addApiStage({
      stage: nestapi.deploymentStage,
    });

    
    // add proxy resource to handle all api requests
    const apiResource = nestapi.root.addProxy({
      defaultIntegration: new cdk.aws_apigateway.LambdaIntegration(dynamoAPiLambda),
      // anyMethod:  false,  // this is necessary otherwise you get conflict in Methods
    });
   
    new cdk.CfnOutput(this, `dynamo-gateway`, {
      exportName: `dynamo-gateway-arn`,
      value: nestapi.restApiName,
    });
      
    }
}