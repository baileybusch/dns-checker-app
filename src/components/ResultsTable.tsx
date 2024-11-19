import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, ExternalLink, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { DNSRecord, DNSRecordStatus } from '../types';
import { Modal } from './Modal';

interface ResultsTableProps {
  records: DNSRecord[];
}

interface DomainGroup {
  domain: string;
  records: DNSRecord[];
}

const StatusIcon = ({ status }: { status: DNSRecordStatus }) => {
  switch (status) {
    case 'valid':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'invalid':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case 'review':
      return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    case 'pending':
    default:
      return <Clock className="w-5 h-5 text-gray-400 animate-spin" />;
  }
};

export function ResultsTable({ records }: ResultsTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<DNSRecord | null>(null);
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());

  // Helper function to get base domain
  const getBaseDomain = (domain: string) => {
    // Remove DKIM and DMARC prefixes first
    domain = domain.replace(/^(crdl01\._domainkey\.|_dmarc\.)/, '');
    
    // Split the domain into parts
    const parts = domain.split('.');
    
    // If we have more than 2 parts (e.g., e.avoyatravel.com), 
    // take the last 3 parts to keep the subdomain
    if (parts.length > 2) {
      return parts.slice(Math.max(0, parts.length - 3)).join('.');
    }
    return domain;
  };

  // Group records by domain
  const domainGroups: DomainGroup[] = records.reduce((groups: DomainGroup[], record) => {
    const baseDomain = getBaseDomain(record.domain);
    
    const existingGroup = groups.find(g => g.domain === baseDomain);
    if (existingGroup) {
      existingGroup.records.push(record);
    } else {
      groups.push({ domain: baseDomain, records: [record] });
    }
    return groups;
  }, []);

  // Auto-expand first domain using useEffect
  useEffect(() => {
    if (domainGroups.length > 0) {
      setExpandedDomains(new Set([domainGroups[0].domain]));
    }
  }, [records]); // Dependency on records ensures this runs when records change

  const handleValueClick = (record: DNSRecord) => {
    setSelectedRecord(record);
  };

  const toggleDomain = (domain: string) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domain)) {
      newExpanded.delete(domain);
    } else {
      newExpanded.add(domain);
    }
    setExpandedDomains(newExpanded);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Record Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {domainGroups.map((group) => (
              <React.Fragment key={group.domain}>
                {/* Domain summary row */}
                <tr 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleDomain(group.domain)}
                >
                  <td className="px-6 py-4">
                    {expandedDomains.has(group.domain) ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {group.domain}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      {group.records.map((record, idx) => (
                        <div key={idx} className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">{record.type}</span>
                          {StatusIcon({ status: record.status })}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
                {/* Expanded records table */}
                {expandedDomains.has(group.domain) && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Domain
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Value
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Message
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {group.records.map((record, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  {StatusIcon({ status: record.status })}
                                  <span className={`text-sm font-medium ${
                                    record.status === 'valid' ? 'text-green-600' :
                                    record.status === 'invalid' ? 'text-red-600' :
                                    record.status === 'error' ? 'text-red-600' :
                                    record.status === 'review' ? 'text-orange-500' :
                                    'text-gray-400'
                                  }`}>
                                    {record.status && record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {record.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {record.domain}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button
                                  onClick={() => handleValueClick(record)}
                                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 max-w-xs truncate group"
                                >
                                  <span className="truncate group-hover:underline">View Value</span>
                                  <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {record.message || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={`${selectedRecord?.type} Record Details`}
      >
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Domain</h4>
            <p className="mt-1 text-sm text-gray-900">{selectedRecord?.domain}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Value</h4>
            <div className="mt-1">
              <pre 
                className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md overflow-y-auto max-h-[200px]"
                style={{
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {selectedRecord?.value}
              </pre>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Status</h4>
            <p className="mt-1 text-sm text-gray-900">
              {selectedRecord?.status === 'valid' && (
                <span className="text-green-600">Valid</span>
              )}
              {selectedRecord?.status === 'invalid' && (
                <span className="text-red-600">Invalid</span>
              )}
              {selectedRecord?.status === 'error' && (
                <span className="text-red-600">Error</span>
              )}
              {selectedRecord?.status === 'pending' && (
                <span className="text-blue-600">Pending</span>
              )}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Message</h4>
            <p className="mt-1 text-sm text-gray-900">{selectedRecord?.message}</p>
          </div>
        </div>
      </Modal>
    </>
  );
}