import React, { useState } from 'react';
import { DNSRecord } from '../types';

interface TextInputProps {
  onRecordsLoaded: (records: DNSRecord[]) => void;
}

export function TextInput({ onRecordsLoaded }: TextInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    const lines = inputValue.trim().split('\n');
    if (lines.length === 0) return;

    const records: DNSRecord[] = [];

    lines.forEach(line => {
      const values = line.split('\t');
      if (values.length < 10) return; // Skip invalid lines

      const domain = values[0]; // Base domain

      // SPF Record
      if (values[1] && values[2]) {
        records.push({
          type: 'SPF',
          domain: values[1],
          value: 'Checking...',
          expectedValue: values[2],
          status: 'pending'
        });
      }

      // DKIM Record
      if (values[3] && values[4]) {
        records.push({
          type: 'DKIM',
          domain: values[3],
          value: 'Checking...',
          expectedValue: values[4],
          status: 'pending'
        });
      }

      // CNAME Record
      if (values[5] && values[6]) {
        records.push({
          type: 'CNAME',
          domain: values[5],
          value: 'Checking...',
          expectedValue: values[6],
          status: 'pending'
        });
      }

      // DMARC Record
      if (values[7] && values[8]) {
        records.push({
          type: 'DMARC',
          domain: values[7],
          value: 'Checking...',
          expectedValue: values[8],
          status: 'pending'
        });
      }

      // MX Records
      if (values[9] && (values[10] || values[11])) {
        const mxRecords = [];
        if (values[10] && values[10] !== 'Do not modify') {
          mxRecords.push(`${values[12] || '10'} ${values[10]}`);
        }
        if (values[11] && values[11] !== 'Do not modify') {
          mxRecords.push(`${values[12] || '10'} ${values[11]}`);
        }
        
        if (mxRecords.length > 0) {
          records.push({
            type: 'MX',
            domain: values[9],
            value: 'Checking...',
            expectedValue: mxRecords.join('\n'),
            status: 'pending'
          });
        }
      }
    });

    if (records.length > 0) {
      onRecordsLoaded(records);
      setInputValue('');
    }
  };

  const hasValidInput = inputValue.trim().split('\n').some(line => line.split('\t').length >= 10);

  return (
    <div className="space-y-4">
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Paste your tab-separated DNS records here..."
        className="w-full h-48 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        onClick={handleSubmit}
        disabled={!hasValidInput}
        className={`w-full py-2 px-4 rounded-lg transition-colors font-medium
          ${hasValidInput
            ? 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
            : 'bg-white text-blue-500 border border-blue-500 hover:bg-blue-50 active:bg-blue-100'
          }`}
      >
        Verify Records
      </button>
    </div>
  );
}