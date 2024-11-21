export interface SPFConfig {
  requireExactMatch: boolean;
  requiredIncludes: string[];
  allowPartialMatch: boolean;
  validAllModifiers: string[];
}

export interface DNSCheckConfig {
  spf: SPFConfig;
  dkim: {
    requireExactMatch: boolean;
    allowPartialMatch: boolean;
  };
  dmarc: {
    requireExactMatch: boolean;
    requiredReportingAddresses: string[];
    allowPartialMatch: boolean;
  };
  cname: {
    requireExactMatch: boolean;
    allowPartialMatch: boolean;
  };
  mx: {
    requireExactMatch: boolean;
    requiredRecords: string[];
    allowPartialMatch: boolean;
  };
} 