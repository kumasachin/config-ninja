import React from 'react';

interface HeaderProps {
  showConfigForm: boolean;
  viewMode: 'form' | 'json';
  onViewModeChange: (mode: 'form' | 'json') => void;
  onShowHelp: () => void;
  onShowSchemaEditor: () => void;
}

const Header: React.FC<HeaderProps> = ({
  showConfigForm,
  viewMode,
  onViewModeChange,
  onShowHelp,
  onShowSchemaEditor
}) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1>Config Ninja</h1>
          <p className="subtitle">Advanced Tenant Configuration Manager</p>
        </div>
        <div className="header-right">
          <button
            className="help-button"
            onClick={onShowHelp}
            title="Help & Documentation - Learn how to use Config Ninja"
            style={{ marginRight: "1rem" }}
          >
            ❓ Help
          </button>
          <button
            className="change-schema-link"
            onClick={onShowSchemaEditor}
            title="Change Schema - Edit schema or create from sample"
          >
            🔄 Change Schema
          </button>
        </div>
      </div>
      {showConfigForm && (
        <div className="view-toggle">
          <button
            className={viewMode === "form" ? "active" : ""}
            onClick={() => onViewModeChange("form")}
          >
            📝 Form View
          </button>
          <button
            className={viewMode === "json" ? "active" : ""}
            onClick={() => onViewModeChange("json")}
          >
            📄 JSON View
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
