import React, { useState, useEffect } from 'react'
import './App.css'
import { getConfigurationFiles, readConfigFile, ConfigFile } from './utils/fileSystem'
import DirectoryBrowser from './components/DirectoryBrowser'
import ConfigComparison from "./components/ConfigComparison";
import SchemaEditor from "./components/SchemaEditor";

interface TenantConfig {
  features: {
    enabledModules: string[];
    betaFeatures: string[];
    roles: string[];
    enableAdvancedReporting: boolean;
    useAIInsights: boolean;
  };
  api: {
    baseUrl: string;
    authUrl?: string;
    timeout?: number;
    retryAttempts?: number;
  };
  auth: {
    clientId: string;
    scopes: string[];
    tokenLifetime?: number;
  };
  branding: {
    favicon?: string;
    title: string;
    logo?: string;
    theme?: {
      primaryColor?: string;
      secondaryColor?: string;
    };
  };
  tenants: Array<{
    tenantId: string;
    tenantName: string;
    tenantImage?: string;
    customer: string;
    environment: string;
    theme?: {
      primaryColor?: string;
      secondaryColor?: string;
      fontFamily?: string;
    };
    features?: {
      enabledModules?: string[];
      customSettings?: Record<string, any>;
    };
  }>;
}

// Schema-based options
const moduleOptions = [
  "reporting",
  "analytics",
  "audit-log",
  "notifications",
  "user-management",
];
const betaFeatureOptions = [
  "ai-suggestions",
  "tenant-isolation",
  "advanced-search",
  "real-time-sync",
];
const roleOptions = ["admin", "editor", "viewer", "manager", "guest"];

const defaultConfig: TenantConfig = {
  features: {
    enabledModules: ["reporting", "analytics"],
    betaFeatures: ["ai-suggestions"],
    roles: ["admin", "editor", "viewer"],
    enableAdvancedReporting: true,
    useAIInsights: false,
  },
  api: {
    baseUrl: "https://api.bass.io/v1",
    authUrl: "https://auth.bass.io/oauth2/token",
    timeout: 30000,
    retryAttempts: 3,
  },
  auth: {
    clientId: "bass-default-client-id",
    scopes: ["read:data", "write:data"],
    tokenLifetime: 3600,
  },
  branding: {
    favicon: "/assets/default/favicon.ico",
    title: "BASS Platform",
    logo: "/assets/default/logo.png",
    theme: {
      primaryColor: "#4b5563",
      secondaryColor: "#6b7280",
    },
  },
  tenants: [
    {
      tenantId: "acme-corp",
      tenantName: "Acme Corporation",
      tenantImage: "/assets/tenants/acme/image.png",
      customer: "acme-corp",
      environment: "production",
      theme: {
        primaryColor: "#4b5563",
        secondaryColor: "#6b7280",
        fontFamily: "Arial, sans-serif",
      },
      features: {
        enabledModules: ["reporting", "analytics"],
        customSettings: {},
      },
    },
  ],
};

// Reusable form components
const ToggleSwitch: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}> = ({ label, checked, onChange, description }) => (
  <div className="toggle-group">
    <div className="toggle-header">
      <label className="toggle-label">{label}</label>
      <div
        className={`toggle-switch ${checked ? "checked" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <div className="toggle-slider"></div>
      </div>
    </div>
    {description && <p className="field-description">{description}</p>}
  </div>
);

const MultiSelect: React.FC<{
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  description?: string;
}> = ({ label, options, selected, onChange, description }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  return (
    <div className="form-group">
      <label className="field-label">{label}</label>
      {description && <p className="field-description">{description}</p>}
      <div className="multi-select">
        <div className="multi-select-header" onClick={() => setIsOpen(!isOpen)}>
          <span>
            {selected.length > 0
              ? `${selected.length} selected`
              : "Select options"}
          </span>
          <span className={`arrow ${isOpen ? "open" : ""}`}>▼</span>
        </div>
        {isOpen && (
          <div className="multi-select-dropdown">
            {options.map((option) => (
              <label key={option} className="multi-select-option">
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      {selected.length > 0 && (
        <div className="selected-items">
          {selected.map((item) => (
            <span key={item} className="selected-tag">
              {item}
              <button type="button" onClick={() => toggleOption(item)}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const NumberInput: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
  unit?: string;
}> = ({ label, value, onChange, min, max, step = 1, description, unit }) => (
  <div className="form-group">
    <label className="field-label">{label}</label>
    {description && <p className="field-description">{description}</p>}
    <div className="number-input-container">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className="number-input"
      />
      {unit && <span className="input-unit">{unit}</span>}
    </div>
  </div>
);

const ArrayInput: React.FC<{
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  description?: string;
  pattern?: string;
}> = ({ label, values, onChange, placeholder, description, pattern }) => {
  const [newValue, setNewValue] = useState("");

  const addValue = () => {
    if (newValue.trim() && !values.includes(newValue.trim())) {
      onChange([...values, newValue.trim()]);
      setNewValue("");
    }
  };

  const removeValue = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addValue();
    }
  };

  return (
    <div className="form-group">
      <label className="field-label">{label}</label>
      {description && <p className="field-description">{description}</p>}
      <div className="array-input">
        <div className="array-input-controls">
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            pattern={pattern}
            className="array-text-input"
          />
          <button type="button" onClick={addValue} className="add-button">
            Add
          </button>
        </div>
        {values.length > 0 && (
          <div className="array-items">
            {values.map((value, index) => (
              <span key={index} className="array-tag">
                {value}
                <button type="button" onClick={() => removeValue(index)}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const KeyValueInput: React.FC<{
  label: string;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  description?: string;
}> = ({ label, values, onChange, description }) => {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const addKeyValue = () => {
    if (newKey.trim() && newValue.trim()) {
      onChange({ ...values, [newKey.trim()]: newValue.trim() });
      setNewKey("");
      setNewValue("");
    }
  };

  const removeKey = (key: string) => {
    const newValues = { ...values };
    delete newValues[key];
    onChange(newValues);
  };

  const updateValue = (key: string, value: string) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <div className="form-group">
      <label className="field-label">{label}</label>
      {description && <p className="field-description">{description}</p>}
      <div className="key-value-input">
        <div className="key-value-controls">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Key"
            className="key-input"
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Value"
            className="value-input"
          />
          <button type="button" onClick={addKeyValue} className="add-button">
            Add
          </button>
        </div>
        {Object.entries(values).length > 0 && (
          <div className="key-value-items">
            {Object.entries(values).map(([key, value]) => (
              <div key={key} className="key-value-item">
                <span className="key">{key}:</span>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateValue(key, e.target.value)}
                  className="value-edit"
                />
                <button
                  type="button"
                  onClick={() => removeKey(key)}
                  className="remove-button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<"form" | "json">("form");
  const [config, setConfig] = useState<TenantConfig>(defaultConfig);
  const [originalConfig, setOriginalConfig] =
    useState<TenantConfig>(defaultConfig);
  const [selectedTenantFile, setSelectedTenantFile] = useState<string>("");
  const [showConfigForm, setShowConfigForm] = useState<boolean>(false);
  const [showSchemaEditor, setShowSchemaEditor] = useState<boolean>(false);
  const [tenantFiles, setTenantFiles] = useState<ConfigFile[]>([]);
  const [currentDirectory, setCurrentDirectory] = useState<string>(
    "/Users/sachinkumar/Documents/config-ninja/src/config"
  );
  const [showDirectoryBrowser, setShowDirectoryBrowser] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Load configuration files when directory changes
  useEffect(() => {
    loadConfigurationFiles();
  }, [currentDirectory]);

  const loadConfigurationFiles = async () => {
    setLoading(true);
    try {
      const configFiles = await getConfigurationFiles(currentDirectory);

      // Add main config option
      const mainConfig: ConfigFile = {
        value: "main-config",
        label: "📄 Main Configuration (tenant-config.json)",
        path: `${currentDirectory}/tenant-config.json`,
      };

      setTenantFiles([mainConfig, ...configFiles]);
    } catch (error) {
      console.error("Error loading configuration files:", error);
      // Fallback to empty array or show error message
      setTenantFiles([
        {
          value: "main-config",
          label: "� Main Configuration (tenant-config.json)",
          path: `${currentDirectory}/tenant-config.json`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadTenantFile = async (fileKey: string) => {
    try {
      if (fileKey === "main-config") {
        setConfig(defaultConfig);
        setOriginalConfig(defaultConfig);
        return;
      }

      // Find the selected file from the tenant files list
      const selectedFile = tenantFiles.find((file) => file.value === fileKey);
      if (!selectedFile) {
        console.error("Selected file not found");
        return;
      }

      // Load the configuration file
      const configData = await readConfigFile(selectedFile.path);

      // Update config with loaded data
      const newConfig = { ...defaultConfig };
      if (configData.tenantId) {
        // Single tenant config file
        newConfig.tenants = [configData];
      } else {
        // Full configuration file
        Object.assign(newConfig, configData);
      }

      setConfig(newConfig);
      setOriginalConfig(JSON.parse(JSON.stringify(newConfig))); // Deep copy for original
    } catch (error) {
      console.error("Error loading tenant file:", error);
      // Handle error - maybe show a notification
    }
  };

  const handleFileSelection = (fileKey: string) => {
    setSelectedTenantFile(fileKey);
    if (fileKey) {
      loadTenantFile(fileKey);
    }
  };

  const handleDirectoryChange = (newPath: string) => {
    setCurrentDirectory(newPath);
  };

  const handleFileSelect = (filePath: string) => {
    // When a file is selected from the directory browser, add it to the dropdown
    const fileName = filePath.split("/").pop() || "";
    const newConfigFile: ConfigFile = {
      value: filePath,
      label: `📄 ${fileName}`,
      path: filePath,
    };

    // Add to tenant files if not already present
    const exists = tenantFiles.some((file) => file.path === filePath);
    if (!exists) {
      setTenantFiles((prev) => [...prev, newConfigFile]);
    }

    // Select this file
    setSelectedTenantFile(filePath);
    loadTenantFile(filePath);
    setShowDirectoryBrowser(false);
  };

  const handleSubmitSelection = () => {
    if (selectedTenantFile) {
      setShowConfigForm(true);
    }
  };

  const handleBackToSelection = () => {
    setShowConfigForm(false);
    setSelectedTenantFile("");
  };

  const saveTenantFile = () => {
    if (selectedTenantFile === "main-config") {
      downloadConfig();
    } else {
      // For individual tenant files, download just the tenant config
      if (config.tenants.length > 0) {
        const tenantConfig = config.tenants[0];
        const blob = new Blob([JSON.stringify(tenantConfig, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedTenantFile}-config.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  };

  const updateConfig = (path: string, value: any) => {
    setConfig((prev) => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let current: any = newConfig;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const addTenant = () => {
    setConfig((prev) => ({
      ...prev,
      tenants: [
        ...prev.tenants,
        {
          tenantId: "new-tenant-" + Date.now(),
          tenantName: "New Tenant",
          tenantImage: "/assets/tenants/default/image.png",
          customer: "new-customer",
          environment: "development",
          theme: {
            primaryColor: "#4b5563",
            secondaryColor: "#6b7280",
            fontFamily: "Arial, sans-serif",
          },
          features: {
            enabledModules: [],
            customSettings: {},
          },
        },
      ],
    }));
  };

  const removeTenant = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      tenants: prev.tenants.filter((_, i) => i !== index),
    }));
  };

  const downloadConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tenant-config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      alert("Configuration copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Failed to copy to clipboard");
    }
  };

  const handleSchemaEditorClose = () => {
    setShowSchemaEditor(false);
  };

  const handleSchemaSave = async (schema: any) => {
    try {
      console.log("Schema saved successfully:", schema);
      setShowSchemaEditor(false);

      // Optionally reload configuration files to reflect schema changes
      await loadConfigurationFiles();
    } catch (error) {
      console.error("Error in schema save callback:", error);
    }
  };
  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1>Config Ninja</h1>
            <p className="subtitle">Advanced Tenant Configuration Manager</p>
          </div>
          <div className="header-right">
            <button
              className="change-schema-link"
              onClick={() => {
                setShowSchemaEditor(true);
              }}
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
              onClick={() => setViewMode("form")}
            >
              📝 Form View
            </button>
            <button
              className={viewMode === "json" ? "active" : ""}
              onClick={() => setViewMode("json")}
            >
              📄 JSON View
            </button>
          </div>
        )}
      </header>

      <main className="main">
        {!showConfigForm ? (
          // File Selection Screen
          <div className="file-selection-container">
            <div className="file-selection-header">
              <h2>� Select Configuration File</h2>
              <p>
                Choose which tenant configuration file you want to load and
                modify
              </p>
            </div>

            <div className="file-selection-form">
              <div className="form-group">
                <label className="field-label">Configuration File *</label>
                <p className="field-description">
                  Select from discovered configuration files or browse to load
                  files from anywhere
                </p>
                <select
                  value={selectedTenantFile}
                  onChange={(e) => handleFileSelection(e.target.value)}
                  className="text-input large-select"
                  required
                  disabled={loading}
                >
                  <option value="">
                    {loading
                      ? "Loading files..."
                      : "-- Select a configuration file --"}
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
                        onClick={() =>
                          setShowDirectoryBrowser(!showDirectoryBrowser)
                        }
                        className="secondary-button"
                        style={{ marginLeft: "1rem" }}
                      >
                        {showDirectoryBrowser
                          ? "📁 Hide Browser"
                          : "🔍 Browse Files"}
                      </button>
                    </div>
                  </div>

                  {showDirectoryBrowser && (
                    <div className="directory-browser-container">
                      <DirectoryBrowser
                        currentPath={currentDirectory}
                        onPathChange={handleDirectoryChange}
                        onFileSelect={handleFileSelect}
                        showOnlyConfigFiles={true}
                      />
                    </div>
                  )}
                </div>
              </div>

              {selectedTenantFile && (
                <div className="file-selection-actions">
                  <button
                    onClick={handleSubmitSelection}
                    className="primary-button large-button"
                  >
                    📝 Load & Edit Configuration
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : viewMode === "form" ? (
          // Configuration Form - Two Column Layout
          <div className="form-container two-column">
            <div className="form-header">
              <button onClick={handleBackToSelection} className="back-button">
                ← Back to File Selection
              </button>
              <h2>📋 Tenant Configuration</h2>
              <p>
                Editing:{" "}
                {tenantFiles.find((f) => f.value === selectedTenantFile)?.label}
              </p>
            </div>

            <div className="form-content-wrapper">
              {/* Left Column - Form */}
              <div className="form-column">
                <div className="form-scroll-area">
                  {/* Features Section */}
                  <div className="form-section">
                    <h3>🚀 Features & Capabilities</h3>

                    <MultiSelect
                      label="Enabled Modules"
                      description="Core platform modules available to tenants"
                      options={moduleOptions}
                      selected={config.features.enabledModules}
                      onChange={(selected) =>
                        updateConfig("features.enabledModules", selected)
                      }
                    />

                    <MultiSelect
                      label="Beta Features"
                      description="Experimental features for early access"
                      options={betaFeatureOptions}
                      selected={config.features.betaFeatures}
                      onChange={(selected) =>
                        updateConfig("features.betaFeatures", selected)
                      }
                    />

                    <MultiSelect
                      label="User Roles"
                      description="Available user roles in the system"
                      options={roleOptions}
                      selected={config.features.roles}
                      onChange={(selected) =>
                        updateConfig("features.roles", selected)
                      }
                    />

                    <ToggleSwitch
                      label="Advanced Reporting"
                      description="Enable advanced reporting and analytics features"
                      checked={config.features.enableAdvancedReporting}
                      onChange={(checked) =>
                        updateConfig(
                          "features.enableAdvancedReporting",
                          checked
                        )
                      }
                    />

                    <ToggleSwitch
                      label="AI Insights"
                      description="Enable AI-powered insights and recommendations"
                      checked={config.features.useAIInsights}
                      onChange={(checked) =>
                        updateConfig("features.useAIInsights", checked)
                      }
                    />
                  </div>

                  {/* API Configuration Section */}
                  <div className="form-section">
                    <h3>🔗 API Configuration</h3>

                    <div className="form-group">
                      <label className="field-label">Base URL *</label>
                      <p className="field-description">
                        Primary API endpoint (must use HTTPS)
                      </p>
                      <input
                        type="url"
                        value={config.api.baseUrl}
                        onChange={(e) =>
                          updateConfig("api.baseUrl", e.target.value)
                        }
                        placeholder="https://api.example.com/v1"
                        className="text-input"
                        pattern="^https://.*"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="field-label">Authentication URL</label>
                      <p className="field-description">
                        OAuth2 authentication endpoint
                      </p>
                      <input
                        type="url"
                        value={config.api.authUrl || ""}
                        onChange={(e) =>
                          updateConfig("api.authUrl", e.target.value)
                        }
                        placeholder="https://auth.example.com/oauth2/token"
                        className="text-input"
                        pattern="^https://.*"
                      />
                    </div>

                    <NumberInput
                      label="Request Timeout"
                      description="API request timeout in milliseconds"
                      value={config.api.timeout || 30000}
                      onChange={(value) => updateConfig("api.timeout", value)}
                      min={1000}
                      max={60000}
                      step={1000}
                      unit="ms"
                    />

                    <NumberInput
                      label="Retry Attempts"
                      description="Number of retry attempts for failed requests"
                      value={config.api.retryAttempts || 3}
                      onChange={(value) =>
                        updateConfig("api.retryAttempts", value)
                      }
                      min={0}
                      max={5}
                    />
                  </div>

                  {/* Authentication Section */}
                  <div className="form-section">
                    <h3>🔐 Authentication</h3>

                    <div className="form-group">
                      <label className="field-label">Client ID *</label>
                      <p className="field-description">
                        OAuth2 client identifier
                      </p>
                      <input
                        type="text"
                        value={config.auth.clientId}
                        onChange={(e) =>
                          updateConfig("auth.clientId", e.target.value)
                        }
                        placeholder="your-client-id"
                        className="text-input"
                        required
                      />
                    </div>

                    <ArrayInput
                      label="OAuth2 Scopes"
                      description="Required permissions in format 'action:resource'"
                      values={config.auth.scopes}
                      onChange={(values) => updateConfig("auth.scopes", values)}
                      placeholder="read:data"
                      pattern="^(read|write|admin):[a-z-]+$"
                    />

                    <NumberInput
                      label="Token Lifetime"
                      description="Access token lifetime in seconds"
                      value={config.auth.tokenLifetime || 3600}
                      onChange={(value) =>
                        updateConfig("auth.tokenLifetime", value)
                      }
                      min={300}
                      max={86400}
                      unit="seconds"
                    />
                  </div>

                  {/* Branding Section */}
                  <div className="form-section">
                    <h3>🎨 Branding & UI</h3>

                    <div className="form-group">
                      <label className="field-label">Application Title *</label>
                      <p className="field-description">
                        Main application title (1-100 characters)
                      </p>
                      <input
                        type="text"
                        value={config.branding.title}
                        onChange={(e) =>
                          updateConfig("branding.title", e.target.value)
                        }
                        placeholder="My Platform"
                        className="text-input"
                        maxLength={100}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="field-label">Favicon Path</label>
                      <p className="field-description">
                        Path to favicon file (.ico, .png, .svg)
                      </p>
                      <input
                        type="text"
                        value={config.branding.favicon || ""}
                        onChange={(e) =>
                          updateConfig("branding.favicon", e.target.value)
                        }
                        placeholder="/assets/favicon.ico"
                        className="text-input"
                        pattern="^/.*\.(ico|png|svg)$"
                      />
                    </div>

                    <div className="form-group">
                      <label className="field-label">Logo Path</label>
                      <p className="field-description">
                        Path to logo file (.png, .svg, .jpg, .jpeg)
                      </p>
                      <input
                        type="text"
                        value={config.branding.logo || ""}
                        onChange={(e) =>
                          updateConfig("branding.logo", e.target.value)
                        }
                        placeholder="/assets/logo.png"
                        className="text-input"
                        pattern="^/.*\.(png|svg|jpg|jpeg)$"
                      />
                    </div>

                    <div className="theme-section">
                      <h4>Global Theme Colors</h4>
                      <div className="color-inputs">
                        <div className="form-group">
                          <label className="field-label">Primary Color</label>
                          <input
                            type="color"
                            value={
                              config.branding.theme?.primaryColor || "#4b5563"
                            }
                            onChange={(e) =>
                              updateConfig(
                                "branding.theme.primaryColor",
                                e.target.value
                              )
                            }
                            className="color-input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="field-label">Secondary Color</label>
                          <input
                            type="color"
                            value={
                              config.branding.theme?.secondaryColor || "#6b7280"
                            }
                            onChange={(e) =>
                              updateConfig(
                                "branding.theme.secondaryColor",
                                e.target.value
                              )
                            }
                            className="color-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tenants Section */}
                  <div className="form-section">
                    <div className="section-header">
                      <h3>🏢 Tenant Management</h3>
                      <button onClick={addTenant} className="add-tenant-button">
                        + Add Tenant
                      </button>
                    </div>

                    {config.tenants.map((tenant, index) => (
                      <div key={index} className="tenant-card">
                        <div className="tenant-header">
                          <h4>
                            Tenant {index + 1}: {tenant.tenantName}
                          </h4>
                          {config.tenants.length > 1 && (
                            <button
                              onClick={() => removeTenant(index)}
                              className="remove-tenant-button"
                            >
                              🗑️ Remove
                            </button>
                          )}
                        </div>

                        <div className="tenant-content">
                          <div className="form-group">
                            <label className="field-label">Tenant ID *</label>
                            <p className="field-description">
                              Unique identifier (2-50 chars, lowercase, numbers,
                              hyphens)
                            </p>
                            <input
                              type="text"
                              value={tenant.tenantId}
                              onChange={(e) =>
                                updateConfig(
                                  `tenants.${index}.tenantId`,
                                  e.target.value
                                )
                              }
                              placeholder="acme-corp"
                              className="text-input"
                              pattern="^[a-z0-9-]+$"
                              minLength={2}
                              maxLength={50}
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label className="field-label">Tenant Name *</label>
                            <p className="field-description">
                              Human-readable name (1-100 characters)
                            </p>
                            <input
                              type="text"
                              value={tenant.tenantName}
                              onChange={(e) =>
                                updateConfig(
                                  `tenants.${index}.tenantName`,
                                  e.target.value
                                )
                              }
                              placeholder="Acme Corporation"
                              className="text-input"
                              maxLength={100}
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label className="field-label">Customer *</label>
                            <p className="field-description">
                              Customer organization name
                            </p>
                            <input
                              type="text"
                              value={tenant.customer}
                              onChange={(e) =>
                                updateConfig(
                                  `tenants.${index}.customer`,
                                  e.target.value
                                )
                              }
                              placeholder="Acme Corp"
                              className="text-input"
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label className="field-label">Environment *</label>
                            <p className="field-description">
                              Deployment environment (dev, staging, prod)
                            </p>
                            <select
                              value={tenant.environment}
                              onChange={(e) =>
                                updateConfig(
                                  `tenants.${index}.environment`,
                                  e.target.value
                                )
                              }
                              className="text-input"
                              required
                            >
                              <option value="">Select environment</option>
                              <option value="development">Development</option>
                              <option value="staging">Staging</option>
                              <option value="production">Production</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label className="field-label">Tenant Image</label>
                            <p className="field-description">
                              Path to tenant logo/image
                            </p>
                            <input
                              type="text"
                              value={tenant.tenantImage || ""}
                              onChange={(e) =>
                                updateConfig(
                                  `tenants.${index}.tenantImage`,
                                  e.target.value
                                )
                              }
                              placeholder="/assets/tenants/acme/logo.png"
                              className="text-input"
                              pattern="^/.*\.(png|svg|jpg|jpeg)$"
                            />
                          </div>

                          <div className="theme-section">
                            <h5>Tenant Theme</h5>
                            <div className="color-inputs">
                              <div className="form-group">
                                <label className="field-label">
                                  Primary Color
                                </label>
                                <input
                                  type="color"
                                  value={
                                    tenant.theme?.primaryColor || "#4b5563"
                                  }
                                  onChange={(e) =>
                                    updateConfig(
                                      `tenants.${index}.theme.primaryColor`,
                                      e.target.value
                                    )
                                  }
                                  className="color-input"
                                />
                              </div>
                              <div className="form-group">
                                <label className="field-label">
                                  Secondary Color
                                </label>
                                <input
                                  type="color"
                                  value={
                                    tenant.theme?.secondaryColor || "#6b7280"
                                  }
                                  onChange={(e) =>
                                    updateConfig(
                                      `tenants.${index}.theme.secondaryColor`,
                                      e.target.value
                                    )
                                  }
                                  className="color-input"
                                />
                              </div>
                            </div>
                            <div className="form-group">
                              <label className="field-label">Font Family</label>
                              <input
                                type="text"
                                value={tenant.theme?.fontFamily || ""}
                                onChange={(e) =>
                                  updateConfig(
                                    `tenants.${index}.theme.fontFamily`,
                                    e.target.value
                                  )
                                }
                                placeholder="Arial, sans-serif"
                                className="text-input"
                              />
                            </div>
                          </div>

                          <div className="tenant-features">
                            <h5>Tenant-Specific Features</h5>
                            <MultiSelect
                              label="Enabled Modules Override"
                              description="Override global modules for this tenant"
                              options={moduleOptions}
                              selected={tenant.features?.enabledModules || []}
                              onChange={(selected) =>
                                updateConfig(
                                  `tenants.${index}.features.enabledModules`,
                                  selected
                                )
                              }
                            />

                            <KeyValueInput
                              label="Custom Settings"
                              description="Tenant-specific configuration overrides"
                              values={tenant.features?.customSettings || {}}
                              onChange={(values) =>
                                updateConfig(
                                  `tenants.${index}.features.customSettings`,
                                  values
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

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
                      <button
                        onClick={saveTenantFile}
                        className="primary-button"
                      >
                        💾 Save Config
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Comparison */}
              <div className="comparison-column">
                <div className="comparison-scroll-area">
                  <ConfigComparison
                    originalConfig={originalConfig}
                    currentConfig={config}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          // JSON View
          <div className="json-container">
            <div className="json-header">
              <button onClick={handleBackToSelection} className="back-button">
                ← Back to File Selection
              </button>
              <h3>📄 Generated Configuration</h3>
              <p>
                Viewing:{" "}
                {tenantFiles.find((f) => f.value === selectedTenantFile)?.label}
              </p>
              <div className="json-actions">
                <button onClick={copyToClipboard} className="secondary-button">
                  📋 Copy
                </button>
                <button onClick={saveTenantFile} className="primary-button">
                  💾 Save
                </button>
              </div>
            </div>
            <pre className="json-output">{JSON.stringify(config, null, 2)}</pre>
          </div>
        )}
      </main>

      {/* Schema Editor Modal */}
      {showSchemaEditor && (
        <SchemaEditor
          onClose={handleSchemaEditorClose}
          onSave={handleSchemaSave}
        />
      )}
    </div>
  );
};

export default App
