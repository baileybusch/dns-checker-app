import { useState } from 'react';
import { FileUpload } from './FileUpload';
import { TextInput } from './TextInput';
import { DomainInput } from './DomainInput';
import { DNSRecord } from '../types';
import { FileText, Upload, Globe } from 'lucide-react';

interface InputTabsProps {
  onRecordsLoaded: (records: DNSRecord[]) => void;
  onTabChange: () => void;
}

export function InputTabs({ onRecordsLoaded, onTabChange }: InputTabsProps) {
  const [activeTab, setActiveTab] = useState<'file' | 'text' | 'domain'>('domain');

  const handleTabChange = (tab: 'file' | 'text' | 'domain') => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      onTabChange();
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('domain')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'domain'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <Globe className="w-5 h-5" />
            <span>Check Domain</span>
          </button>
          <button
            onClick={() => handleTabChange('file')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'file'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <Upload className="w-5 h-5" />
            <span>Upload CSV</span>
          </button>
          <button
            onClick={() => handleTabChange('text')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'text'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <FileText className="w-5 h-5" />
            <span>Paste Text</span>
          </button>
        </nav>
      </div>

      <div className="mt-4">
        {activeTab === 'domain' ? (
          <DomainInput onRecordsLoaded={onRecordsLoaded} />
        ) : activeTab === 'file' ? (
          <FileUpload onRecordsLoaded={onRecordsLoaded} />
        ) : (
          <TextInput onRecordsLoaded={onRecordsLoaded} />
        )}
      </div>
    </div>
  );
}