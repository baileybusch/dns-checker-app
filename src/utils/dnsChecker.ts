const DNS_API_ENDPOINT = 'https://cloudflare-dns.com/dns-query';
import { DNSCheckConfig } from '../types/config';

export async function verifyDNSRecord(record: any, config: DNSCheckConfig) {
  try {
    let queryType = record.type;
    let domain = record.domain;
    
    // Adjust query type based on record type
    switch (record.type) {
      case 'SPF':
      case 'DKIM':
      case 'DMARC':
        queryType = 'TXT';
        break;
    }

    const response = await fetch(
      `${DNS_API_ENDPOINT}?name=${encodeURIComponent(domain)}&type=${queryType}`,
      {
        headers: {
          'Accept': 'application/dns-json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`DNS query failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.Answer) {
      return {
        isValid: false,
        message: 'No DNS record found',
        value: '',
        matchesExpected: false
      };
    }

    // Helper function to compare actual and expected values
    const compareValues = (actual: string, expected?: string) => {
      if (!expected) return true;
      // Remove whitespace and quotes for comparison
      const normalizeValue = (val: string) => 
        val.replace(/\s+/g, ' ').trim().replace(/"/g, '').toLowerCase();
      return normalizeValue(actual) === normalizeValue(expected);
    };

    // Process the records based on type
    switch (record.type) {
      case 'SPF': {
        const spfRecords = data.Answer?.filter((answer: any) => 
          answer.data.includes('v=spf1')
        );
        
        // No SPF record found - Invalid
        if (!spfRecords || spfRecords.length === 0) {
          return {
            isValid: false,
            status: 'invalid',
            message: 'No SPF record found',
            value: '',
            matchesExpected: false
          };
        }

        const spfRecord = spfRecords[0].data.replace(/"/g, '');
        const exactMatch = spfRecord.trim() === 'v=spf1 include:_spf.cordialmail.net ~all';
        const hasRequiredInclude = spfRecord.includes('include:_spf.cordialmail.net ~all');

        // Case 1: Exact match
        if (exactMatch) {
          return {
            isValid: true,
            status: 'valid',
            message: 'SPF record matches exactly',
            value: spfRecord,
            matchesExpected: true
          };
        }

        // Case 2: Contains Cordial include but not exact match
        if (hasRequiredInclude) {
          return {
            isValid: true,
            status: 'valid',
            message: 'SPF record contains the Cordial include',
            value: spfRecord,
            matchesExpected: true
          };
        }

        // Case 3: Record exists but doesn't contain Cordial include
        return {
          isValid: true,
          status: 'review',
          message: 'SPF record found but needs review',
          value: spfRecord,
          matchesExpected: false
        };
      }
      
      case 'DKIM': {
        const dkimRecord = data.Answer.find((answer: any) => 
          answer.data.includes('v=DKIM1') || answer.data.includes('k=rsa')
        );

        if (!dkimRecord) {
          return {
            isValid: false,
            status: 'invalid',
            message: 'No DKIM record found',
            value: '',
            matchesExpected: false
          };
        }

        const actualValue = dkimRecord.data.replace(/"/g, '');
        const exactMatch = compareValues(actualValue, record.expectedValue);

        if (exactMatch) {
          return {
            isValid: true,
            status: 'valid',
            message: 'DKIM record matches exactly',
            value: actualValue,
            matchesExpected: true
          };
        }

        return {
          isValid: true,
          status: 'review',
          message: 'DKIM record found but needs review',
          value: actualValue,
          matchesExpected: false
        };
      }
      
      case 'DMARC': {
        const dmarcRecord = data.Answer.find((answer: any) => 
          answer.data.includes('v=DMARC1')
        );
        
        if (!dmarcRecord) {
          return {
            isValid: false,
            status: 'invalid',
            message: 'No DMARC record found',
            value: '',
            matchesExpected: false
          };
        }

        const actualValue = dmarcRecord.data.replace(/"/g, '');
        
        const hasCordialRua = actualValue.toLowerCase().includes('@dmarc.cordialmail.net');
        const hasCordialRuf = actualValue.toLowerCase().includes('@dmarc.cordialmail.net');
        
        if (!hasCordialRua || !hasCordialRuf) {
          return {
            isValid: true,
            status: 'review',
            message: 'Valid DMARC record found but missing Cordial reporting addresses',
            value: actualValue,
            matchesExpected: false
          };
        }

        return {
          isValid: true,
          status: 'valid',
          message: 'DMARC record contains required Cordial reporting addresses',
          value: actualValue,
          matchesExpected: true
        };
      }
      
      case 'CNAME': {
        const cnameRecord = data.Answer?.[0];
        
        if (!cnameRecord) {
          return {
            isValid: false,
            status: 'invalid',
            message: 'No CNAME record found',
            value: '',
            matchesExpected: false
          };
        }

        const actualValue = cnameRecord.data.replace(/\.$/, '');
        const exactMatch = compareValues(actualValue, record.expectedValue);

        if (exactMatch) {
          return {
            isValid: true,
            status: 'valid',
            message: 'CNAME record matches exactly',
            value: actualValue,
            matchesExpected: true
          };
        }

        return {
          isValid: true,
          status: 'review',
          message: 'CNAME record found but needs review',
          value: actualValue,
          matchesExpected: false
        };
      }
      
      case 'MX': {
        if (!data.Answer || data.Answer.length === 0) {
          return {
            isValid: false,
            status: 'invalid',
            message: 'No MX records found',
            value: '',
            matchesExpected: false
          };
        }

        const mxRecords = data.Answer
          .map((answer: any) => {
            const [priority, server] = answer.data.split(' ');
            return `${priority} ${server.replace(/\.$/, '')}`;
          })
          .sort();

        const actualValue = mxRecords.join('\n');
        
        // Check for exact match with both Mailgun records at priority 10
        const expectedMXRecords = [
          '10 mxa.mailgun.org',
          '10 mxb.mailgun.org'
        ];
        
        const exactMatch = mxRecords.length === 2 && 
          expectedMXRecords.every(expected => 
            mxRecords.some(mx => mx.toLowerCase() === expected.toLowerCase())
          );

        if (exactMatch) {
          return {
            isValid: true,
            status: 'valid',
            message: 'MX records match Mailgun configuration exactly',
            value: actualValue,
            matchesExpected: true
          };
        }

        // Record exists but doesn't match exactly
        return {
          isValid: true,
          status: 'review',
          message: 'MX records found but need review',
          value: actualValue,
          matchesExpected: false
        };
      }
      
      default:
        return {
          isValid: false,
          message: 'Unsupported record type',
          value: '',
          matchesExpected: false
        };
    }
  } catch (error) {
    console.error('DNS verification error:', error);
    return {
      isValid: false,
      message: error instanceof Error ? error.message : 'Error verifying record',
      value: '',
      matchesExpected: false
    };
  }
}

export async function getDomainRecords(domain: string) {
  return [
    {
      type: 'SPF',
      domain: domain,
      value: 'Checking...',
      status: 'pending'
    },
    {
      type: 'DKIM',
      domain: `crdl01._domainkey.${domain}`,
      value: 'Checking...',
      status: 'pending'
    },
    {
      type: 'DMARC',
      domain: `_dmarc.${domain}`,
      value: 'Checking...',
      status: 'pending'
    },
    {
      type: 'CNAME',
      domain: `mg.${domain}`,
      value: 'Checking...',
      expectedValue: 'mailgun.org',
      status: 'pending'
    },
    {
      type: 'MX',
      domain: domain,
      value: 'Checking...',
      status: 'pending'
    }
  ];
}