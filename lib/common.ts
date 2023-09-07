import * as cdk from 'aws-cdk-lib';
export interface StageStackProps extends cdk.StackProps {
readonly stage: string
}
export const stageId = (id: string, stage: string) => `${id}-${stage}`