import { useState } from 'react';
import { InputTabs } from './components/InputTabs';
import { ResultsTable } from './components/ResultsTable';
import { verifyDNSRecord } from './utils/dnsChecker';
import { DNSRecord, DNSRecordStatus } from './types';
import { Database } from 'lucide-react';
import { DNSCheckConfig } from './types/config';
import { ErrorBoundary } from './components/ErrorBoundary';

const defaultConfig: DNSCheckConfig = {
  spf: {
    requireExactMatch: false,
    requiredIncludes: ['include:_spf.cordialmail.net'],
    allowPartialMatch: true,
    validAllModifiers: ['-all', '~all']
  },
  dkim: {
    requireExactMatch: true,
    allowPartialMatch: true
  },
  dmarc: {
    requireExactMatch: false,
    requiredReportingAddresses: ['@dmarc.cordialmail.net'],
    allowPartialMatch: true
  },
  cname: {
    requireExactMatch: true,
    allowPartialMatch: true
  },
  mx: {
    requireExactMatch: true,
    requiredRecords: ['mxa.mailgun.org', 'mxb.mailgun.org'],
    allowPartialMatch: true
  }
};

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function App() {
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [config] = useState<DNSCheckConfig>(defaultConfig);

  const handleRecordsLoaded = async (loadedRecords: DNSRecord[]) => {
    setError(null);
    setRecords(loadedRecords.map(record => ({ ...record, status: 'pending' as DNSRecordStatus })));
    
    for (let i = 0; i < loadedRecords.length; i++) {
      const record = loadedRecords[i];
      try {
        setRecords(current =>
          current.map((r, index) =>
            index === i ? { ...r, isLoading: true } : r
          )
        );
        
        const result = await verifyDNSRecord(record, config);
        
        setRecords(current =>
          current.map((r, index) =>
            index === i
              ? {
                  ...r,
                  isLoading: false,
                  status: (result.status || (result.isValid 
                    ? (result.matchesExpected ? 'valid' : 'review')
                    : 'invalid')) as DNSRecordStatus,
                  message: result.message,
                  value: result.value || r.value
                }
              : r
          )
        );
      } catch (error) {
        setError('Failed to verify DNS records. Please try again.');
        setRecords(current =>
          current.map((r, index) =>
            index === i
              ? {
                  ...r,
                  status: 'error' as DNSRecordStatus,
                  message: error instanceof Error ? error.message : 'Verification failed'
                }
              : r
          )
        );
      }
    }
  };

  const handleTabChange = () => {
    setRecords([]);
    setError(null);
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Database className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              DNS Record Validator
            </h1>
            <p className="text-lg text-gray-600">
              Check a sending domain's DNS entries or provide expected values to verify
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
            <InputTabs 
              onRecordsLoaded={handleRecordsLoaded} 
              onTabChange={handleTabChange}
            />
          </div>

          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              {error}
            </div>
          )}

          {records.length > 0 && (
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <ResultsTable records={records} />
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;