import React from 'react';
import { TenantConfig } from '../../types/config';
import { ConfigFile } from '../../types/config';
import FeaturesSection from '../ConfigSections/FeaturesSection';
import ApiSection from '../ConfigSections/ApiSection';

interface ConfigFormProps {
  config: TenantConfig;
  originalConfig: TenantConfig;
  selectedTenantFile: string;
  tenantFiles: ConfigFile[];
  onBackToSelection: () => void;
  updateConfig: (path: string, value: any) => void;
  copyToClipboard: () => void;
  saveTenantFile: () => void;
}

const ConfigForm: React.FC<ConfigFormProps> = ({
  config,
  originalConfig,
  selectedTenantFile,
  tenantFiles,
  onBackToSelection,
  updateConfig,
  copyToClipboard,
  saveTenantFile,
}) => {
  return (
    <div className="form-container two-column">
      <div className="form-header">
        <button onClick={onBackToSelection} className="back-button">
          ← Back to File Selection
        </button>
        <h2>📋 Tenant Configuration</h2>
        <p>
          Editing:{" "}
          {tenantFiles.find((f) => f.value === selectedTenantFile)?.label}
        </p>
      </div>

      <div className="form-content-wrapper">
        <div className="form-column">
          <div className="form-scroll-area">
            <FeaturesSection config={config} updateConfig={updateConfig} />
            <ApiSection config={config} updateConfig={updateConfig} />

            <div className="form-actions">
              <div className="current-file-indicator">
                <span className="file-icon">📄</span>
                <span className="file-name">
                  Editing:{" "}
                  {
                    tenantFiles.find(
                      (f) => f.value === selectedTenantFile
                    )?.label
                  }
                </span>
              </div>
              <div className="button-group">
                <button
                  onClick={copyToClipboard}
                  className="secondary-button"
                >
                  📋 Copy JSON
                </button>
                <button onClick={saveTenantFile} className="primary-button">
                  💾 Save Config
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="comparison-column">
          <div className="comparison-scroll-area">
            {/* Replace with ConfigComparison component */}
            <pre>
              {JSON.stringify(
                {
                  original: originalConfig,
                  current: config,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigForm;
