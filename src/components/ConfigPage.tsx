import React, { useState } from 'react';
import { DNSCheckConfig } from '../types/config';

interface ConfigPageProps {
  config: DNSCheckConfig;
  onConfigUpdate: (newConfig: DNSCheckConfig) => void;
}

export function ConfigPage({ config, onConfigUpdate }: ConfigPageProps) {
  const [currentConfig, setCurrentConfig] = useState<DNSCheckConfig>(config);

  const handleChange = (section: keyof DNSCheckConfig, field: string, value: any) => {
    setCurrentConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    onConfigUpdate(currentConfig);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">DNS Check Configuration</h2>
      
      {/* SPF Configuration */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">SPF Configuration</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={currentConfig.spf.requireExactMatch}
              onChange={(e) => handleChange('spf', 'requireExactMatch', e.target.checked)}
            />
            <span>Require Exact Match</span>
          </label>
          <div>
            <label className="block">Required Includes:</label>
            <input
              type="text"
              value={currentConfig.spf.requiredIncludes.join(', ')}
              onChange={(e) => handleChange('spf', 'requiredIncludes', e.target.value.split(',').map(s => s.trim()))}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </section>

      {/* Similar sections for DKIM, DMARC, CNAME, and MX */}
      
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Save Configuration
      </button>
    </div>
  );
} 