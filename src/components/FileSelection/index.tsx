import React from 'react';
import { ConfigFile } from '../../types/config';
import DirectoryBrowser from '../DirectoryBrowser';
import DemoNotification from '../DemoNotification';

interface FileSelectionProps {
  selectedTenantFile: string;
  tenantFiles: ConfigFile[];
  currentDirectory: string;
  showDirectoryBrowser: boolean;
  loading: boolean;
  onFileSelection: (fileKey: string) => void;
  onDirectoryChange: (newPath: string) => void;
  onFileSelect: (filePath: string) => void;
  onToggleDirectoryBrowser: () => void;
  onSubmitSelection: () => void;
}

const FileSelection: React.FC<FileSelectionProps> = ({
  selectedTenantFile,
  tenantFiles,
  currentDirectory,
  showDirectoryBrowser,
  loading,
  onFileSelection,
  onDirectoryChange,
  onFileSelect,
  onToggleDirectoryBrowser,
  onSubmitSelection,
}) => {
  return (
    <div className="file-selection-container">
      <div className="file-selection-header">
        <DemoNotification />
        <h2>📁 Select Configuration File</h2>
        <p>
          Choose which tenant configuration file you want to load and modify
        </p>
      </div>

      <div className="file-selection-form">
        <div className="form-group">
          <label className="field-label">Configuration File *</label>
          <p className="field-description">
            Select from discovered configuration files or browse to load files
            from anywhere
          </p>
          <select
            value={selectedTenantFile}
            onChange={(e) => onFileSelection(e.target.value)}
            className="text-input large-select"
            required
            disabled={loading}
          >
            <option value="">
              {loading ? "Loading files..." : "-- Select a configuration file --"}
            </option>
            {tenantFiles.map((file) => (
              <option key={file.value} value={file.value}>
                {file.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <div className="directory-browser-section">
            <div className="current-directory">
              <label className="field-label">Current Directory</label>
              <div className="directory-path">
                <code>{currentDirectory}</code>
                <button
                  onClick={onToggleDirectoryBrowser}
                  className="secondary-button"
                  style={{ marginLeft: "1rem" }}
                >
                  {showDirectoryBrowser ? "📁 Hide Browser" : "🔍 Browse Files"}
                </button>
              </div>
            </div>

            {showDirectoryBrowser && (
              <div className="directory-browser-container">
                <DirectoryBrowser
                  currentPath={currentDirectory}
                  onPathChange={onDirectoryChange}
                  onFileSelect={onFileSelect}
                  showOnlyConfigFiles={true}
                />
              </div>
            )}
          </div>
        </div>

        {selectedTenantFile && (
          <div className="file-selection-actions">
            <button
              onClick={onSubmitSelection}
              className="primary-button large-button"
            >
              📝 Load & Edit Configuration
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileSelection;
