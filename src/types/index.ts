export type DNSRecordType = 'SPF' | 'DKIM' | 'DMARC' | 'CNAME' | 'MX';
export type DNSRecordStatus = 'pending' | 'valid' | 'invalid' | 'review' | 'error';

export interface DNSRecord {
  type: DNSRecordType;
  domain: string;
  value: string;
  status: DNSRecordStatus;
  expectedValue?: string;
  isLoading?: boolean;
  message?: string;
} 