import React from 'react';
import { TenantConfig, ConfigFile } from '../../types/config';

interface JsonViewProps {
  config: TenantConfig;
  selectedTenantFile: string;
  tenantFiles: ConfigFile[];
  onBackToSelection: () => void;
  onCopyToClipboard: () => void;
  onSave: () => void;
}

const JsonView: React.FC<JsonViewProps> = ({
  config,
  selectedTenantFile,
  tenantFiles,
  onBackToSelection,
  onCopyToClipboard,
  onSave,
}) => {
  return (
    <div className="json-container">
      <div className="json-header">
        <button onClick={onBackToSelection} className="back-button">
          ← Back to File Selection
        </button>
        <h3>📄 Generated Configuration</h3>
        <p>
          Viewing:{" "}
          {tenantFiles.find((f) => f.value === selectedTenantFile)?.label}
        </p>
        <div className="json-actions">
          <button onClick={onCopyToClipboard} className="secondary-button">
            📋 Copy
          </button>
          <button onClick={onSave} className="primary-button">
            💾 Save
          </button>
        </div>
      </div>
      <pre className="json-output">{JSON.stringify(config, null, 2)}</pre>
    </div>
  );
};

export default JsonView;
