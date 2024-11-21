import React, { useCallback, useState } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { Upload } from 'lucide-react';
import Papa from 'papaparse';
import type { ParseResult } from 'papaparse';
import { DNSRecord } from '../types';

interface FileUploadProps {
  onRecordsLoaded: (records: DNSRecord[]) => void;
}

interface CSVRow {
  'sending_domain': string;
  'SPF host': string;
  'SPF record (TXT record type)': string;
  'DKIM host': string;
  'DKIM record (TXT record type)': string;
  'CNAME host': string;
  'CNAME record': string;
  'DMARC host': string;
  'DMARC record (TXT record type)': string;
  'MX host': string;
  'MX record A': string;
  'MX record B': string;
  'MX priority': string;
  [key: string]: string;
}

const dropzoneOptions: DropzoneOptions = {
  accept: {
    'text/csv': ['.csv']
  },
  multiple: false
};

export function FileUpload({ onRecordsLoaded }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    ...dropzoneOptions,
    onDrop
  });

  const handleSubmit = () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);

    Papa.parse<CSVRow>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<CSVRow>) => {
        try {
          if (results.errors.length > 0) {
            setError(`CSV parsing error: ${results.errors[0].message}`);
            setIsLoading(false);
            return;
          }

          if (results.data.length === 0) {
            setError('No valid records found in CSV');
            setIsLoading(false);
            return;
          }

          const allRecords: DNSRecord[] = [];

          results.data.forEach((row: CSVRow) => {
            if (!row['sending_domain']) {
              console.warn('Skipping row without sending domain:', row);
              return;
            }

            // Add SPF Record
            if (row['SPF host'] && row['SPF record (TXT record type)']) {
              allRecords.push({
                type: 'SPF',
                domain: row['SPF host'],
                value: 'Checking...',
                expectedValue: row['SPF record (TXT record type)'],
                status: 'pending'
              });
            }

            // Add DKIM Record
            if (row['DKIM host'] && row['DKIM record (TXT record type)']) {
              allRecords.push({
                type: 'DKIM',
                domain: row['DKIM host'],
                value: 'Checking...',
                expectedValue: row['DKIM record (TXT record type)'],
                status: 'pending'
              });
            }

            // Add CNAME Record
            if (row['CNAME host'] && row['CNAME record']) {
              allRecords.push({
                type: 'CNAME',
                domain: row['CNAME host'],
                value: 'Checking...',
                expectedValue: row['CNAME record'],
                status: 'pending'
              });
            }

            // Add DMARC Record
            if (row['DMARC host'] && row['DMARC record (TXT record type)']) {
              allRecords.push({
                type: 'DMARC',
                domain: row['DMARC host'],
                value: 'Checking...',
                expectedValue: row['DMARC record (TXT record type)'],
                status: 'pending'
              });
            }

            // Add MX Records
            if (row['MX host'] && (row['MX record A'] || row['MX record B'])) {
              const mxValue = [row['MX record A'], row['MX record B']]
                .filter(Boolean)
                .map(record => `${row['MX priority']} ${record}`)
                .join('\n');

              allRecords.push({
                type: 'MX',
                domain: row['MX host'],
                value: 'Checking...',
                expectedValue: mxValue,
                status: 'pending'
              });
            }
          });

          if (allRecords.length === 0) {
            setError('No valid DNS records found in CSV');
            setIsLoading(false);
            return;
          }

          // Call onRecordsLoaded with the parsed records
          onRecordsLoaded(allRecords);
          setSelectedFile(null);
          setIsLoading(false);
        } catch (err) {
          console.error('Error processing CSV:', err);
          setError(err instanceof Error ? err.message : 'Error processing CSV file');
          setIsLoading(false);
        }
      },
      error: (error: Error) => {
        console.error('Papa Parse error:', error);
        setError(`Failed to parse CSV: ${error.message}`);
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
      <div {...getRootProps()} className="w-full text-center">
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">
          {isDragActive
            ? "Drop the CSV file here..."
            : "Drag 'n' drop a CSV file here, or click to select one"}
        </p>
      </div>

      {selectedFile && (
        <div className="mt-4 text-sm text-gray-600">
          Selected file: {selectedFile.name}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!selectedFile || isLoading}
        className={`mt-4 w-full py-2 px-4 rounded-lg transition-colors font-medium
          ${selectedFile && !isLoading
            ? 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
            : 'bg-white text-blue-500 border border-blue-500 hover:bg-blue-50 active:bg-blue-100'
          }`}
      >
        {isLoading ? 'Processing...' : 'Verify Records'}
      </button>
    </div>
  );
}