import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { DNSRecord } from '../types';
import { getDomainRecords } from '../utils/dnsChecker';

interface DomainInputProps {
  onRecordsLoaded: (records: DNSRecord[]) => void;
}

export function DomainInput({ onRecordsLoaded }: DomainInputProps) {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;

    setLoading(true);
    try {
      const records = await getDomainRecords(domain);
      onRecordsLoaded(records);
    } catch (error) {
      console.error('Error fetching domain records:', error);
    }
    setLoading(false);
    setDomain('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Enter sending domain (e.g., example.com)"
          className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Search className="w-5 h-5" />
          {loading ? 'Checking...' : 'Check Domain'}
        </button>
      </div>
    </form>
  );
}