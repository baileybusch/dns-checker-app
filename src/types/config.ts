export interface DNSCheckConfig {
  spf: {
    requireExactMatch: boolean;
    requiredIncludes: string[];
    allowPartialMatch: boolean;
  };
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