import React, { useState, useEffect } from 'react';
import {
  FileSystemItem,
  scanDirectory,
  validatePath,
  openFolderInExplorer,
} from "../utils/fileSystem";

interface DirectoryBrowserProps {
  currentPath: string;
  onPathChange: (path: string) => void;
  onFileSelect: (filePath: string) => void;
  showOnlyConfigFiles?: boolean;
}

export const DirectoryBrowser: React.FC<DirectoryBrowserProps> = ({
  currentPath,
  onPathChange,
  onFileSelect,
  showOnlyConfigFiles = false
}) => {
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualPath, setManualPath] = useState(currentPath);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  const loadDirectory = async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const directoryItems = await scanDirectory(path);
      let filteredItems = directoryItems;
      
      if (showOnlyConfigFiles) {
        filteredItems = directoryItems.filter(item => 
          item.type === 'directory' || 
          (item.type === 'file' && item.isConfig)
        );
      }
      
      setItems(filteredItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load directory');
    } finally {
      setLoading(false);
    }
  };

  const navigateToParent = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    if (parentPath && parentPath !== currentPath) {
      onPathChange(parentPath);
    }
  };

  const navigateToDirectory = (item: FileSystemItem) => {
    if (item.type === 'directory') {
      onPathChange(item.path);
    } else if (item.type === 'file' && item.isConfig) {
      onFileSelect(item.path);
    }
  };

  const handleOpenInExplorer = async (
    item: FileSystemItem,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); // Prevent navigation when clicking the open button

    try {
      const success = await openFolderInExplorer(item.path);
      if (!success) {
        alert("Failed to open folder in system explorer");
      }
    } catch (error) {
      console.error("Error opening folder:", error);
      alert("Failed to open folder in system explorer");
    }
  };

  const handleManualPathSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPath = manualPath.trim();
    
    if (trimmedPath && trimmedPath !== currentPath) {
      const isValid = await validatePath(trimmedPath);
      if (isValid) {
        onPathChange(trimmedPath);
        setError(null);
      } else {
        setError('Invalid path or path does not exist');
      }
    }
  };

  const getItemIcon = (item: FileSystemItem): string => {
    if (item.type === 'directory') {
      return '📁';
    }
    if (item.isConfig) {
      return '⚙️';
    }
    return '📄';
  };

  const formatFileSize = (item: FileSystemItem): string => {
    // In a real implementation, you'd get file size from the file system
    if (item.type === 'file') {
      return '< 1 KB';
    }
    return '';
  };

  return (
    <div className="directory-browser">
      <div className="directory-browser-header">
        <h3>📂 Directory Browser</h3>

        {/* Manual path input */}
        <form onSubmit={handleManualPathSubmit} className="manual-path-form">
          <div className="path-input-group">
            <label htmlFor="manual-path">Navigate to path:</label>
            <input
              id="manual-path"
              type="text"
              value={manualPath}
              onChange={(e) => setManualPath(e.target.value)}
              placeholder="Enter absolute path (e.g., /Users/username/Documents)"
              className="path-input"
            />
            <button type="submit" className="path-navigate-button">
              Go
            </button>
          </div>
        </form>

        {/* Current path breadcrumb */}
        <div className="current-path">
          <span className="path-label">Current path:</span>
          <code className="path-display">{currentPath}</code>
          <div className="path-actions">
            {currentPath !== "/" && (
              <button onClick={navigateToParent} className="parent-button">
                ↑ Parent
              </button>
            )}
            <button
              onClick={(e) =>
                handleOpenInExplorer(
                  {
                    name: currentPath.split("/").pop() || "Root",
                    path: currentPath,
                    type: "directory",
                  },
                  e
                )
              }
              className="open-current-button"
              title="Open current directory in system file explorer"
            >
              🔗 Open
            </button>
          </div>
        </div>
      </div>

      <div className="directory-browser-content">
        {loading && (
          <div className="directory-loading">
            <div className="loading-spinner"></div>
            <span>Loading directory...</span>
          </div>
        )}

        {error && (
          <div className="directory-error">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
            <button
              onClick={() => loadDirectory(currentPath)}
              className="retry-button"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="directory-items">
            {items.length === 0 ? (
              <div className="empty-directory">
                <span className="empty-icon">📭</span>
                <span>No items found in this directory</span>
              </div>
            ) : (
              <div className="items-grid">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className={`directory-item ${item.type}`}
                    onClick={() => navigateToDirectory(item)}
                  >
                    <div className="item-icon">{getItemIcon(item)}</div>
                    <div className="item-details">
                      <div className="item-name" title={item.name}>
                        {item.name}
                      </div>
                      <div className="item-meta">
                        <span className="item-type">{item.type}</span>
                        {item.type === "file" && (
                          <span className="item-size">
                            {formatFileSize(item)}
                          </span>
                        )}
                        {item.isConfig && (
                          <span className="config-badge">Config</span>
                        )}
                      </div>
                    </div>
                    {item.type === "directory" && (
                      <div className="item-actions">
                        <button
                          className="open-explorer-button"
                          onClick={(e) => handleOpenInExplorer(item, e)}
                          title="Open in system file explorer"
                        >
                          🔗
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="directory-browser-footer">
        <div className="directory-stats">
          <span>
            {items.filter((i) => i.type === "directory").length} directories
          </span>
          <span>{items.filter((i) => i.type === "file").length} files</span>
          {showOnlyConfigFiles && (
            <span>{items.filter((i) => i.isConfig).length} config files</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectoryBrowser;
