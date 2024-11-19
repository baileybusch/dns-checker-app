export type DNSRecordStatus = 'pending' | 'valid' | 'invalid' | 'error' | 'review';

export interface DNSRecord {
  type: string;
  domain: string;
  value: string;
  expectedValue?: string;
  status: DNSRecordStatus;
  message?: string;
  isLoading?: boolean;
}

export interface VerificationResult {
  isValid: boolean;
  message: string;
  value: string;
  matchesExpected?: boolean;
}