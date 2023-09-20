import { Injectable } from '@nestjs/common';

@Injectable()
export class ProvisioningConfig {
    public accountId: string = process.env.ACCOUNT_ID;
    public region: string = process.env.REGION;
    // public ingestionRuleName: string = process.env.INGESTION_RULE_NAME;
    public ingestionRuleDecodedName: string = process.env.INGESTION_DECODED_RULE_NAME;
    public ingestionRulePassthroughName: string = process.env.INGESTION_PASSTHROUGH_RULE_NAME;
}