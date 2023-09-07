export type region = 'us-west-2' | 'us-east-1' | 'eu-west-1' |'eu-central-1' | 'ap-northeast-2' | 'ap-southeast-1'

export type accessMap = 'platformCore' | 'location' | 'ingestion' | 'catalog';

export type outputName = string;

export type expectedOutputs = {
    [stackName: string] : outputName[]
}

export interface DeviceType {
    name: string;
    [key: string ]: any;
    attributes: {
        state: 'registered' | 'active' | 'failed'
        [key: string ]: any;
    }
}
