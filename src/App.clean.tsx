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
    title: string;
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor: string;
    theme: "light" | "dark" | "auto";
  };
  tenants: Array<{
    id: string;
    name: string;
    domain: string;
    description?: string;
    contactEmail?: string;
    maxUsers?: number;
    isActive: boolean;
    theme?: {
      primaryColor?: string;
      fontFamily?: string;
    };
    features?: {
      enabledModules?: string[];
      customSettings?: Record<string, any>;
    };
  }>;
}

interface JsonSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  description?: string;
  enum?: any[];
  items?: any;
  minimum?: number;
  maximum?: number;
  minItems?: number;
  maxItems?: number;
  default?: any;
}

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
    title: "BASS Platform",
    logoUrl: "/assets/default/logo.png",
    faviconUrl: "/assets/default/favicon.ico",
    primaryColor: "#4b5563",
    theme: "light",
  },
  tenants: [
    {
      id: "acme-corp",
      name: "ACME Corporation",
      domain: "acme.com",
      description: "Large enterprise client",
      contactEmail: "admin@acme.com",
      maxUsers: 500,
      isActive: true,
      theme: {
        primaryColor: "#ff6b35",
        fontFamily: "Inter, sans-serif",
      },
      features: {
        enabledModules: ["reporting", "analytics", "audit-log"],
        customSettings: {
          "data-retention": "365",
          "backup-frequency": "daily",
        },
      },
    },
  ],
};

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'directory' | 'form' | 'json'>('directory');
  const [configFiles, setConfigFiles] = useState<ConfigFile[]>([]);
  const [selectedTenantFile, setSelectedTenantFile] = useState<string>('');
  const [config, setConfig] = useState<TenantConfig>(defaultConfig);
  const [originalConfig, setOriginalConfig] = useState<TenantConfig>(defaultConfig);
  const [showSchemaEditor, setShowSchemaEditor] = useState(false);
  const [schemaProperties, setSchemaProperties] = useState<JsonSchema | null>(null);
  const [schemaLoading, setSchemaLoading] = useState(false);

  // Load schema from file
  const loadSchemaFromFile = async () => {
    setSchemaLoading(true);
    try {
      const response = await fetch('http://localhost:8002/api/files/schema?path=src/config/tenant-config.schema.json');
      if (response.ok) {
        const schema = await response.json();
        setSchemaProperties(schema);
      }
    } catch (error) {
      console.error('Failed to load schema:', error);
    }
    setSchemaLoading(false);
  };

  // Load schema on component mount
  useEffect(() => {
    loadSchemaFromFile();
  }, []);

  // Render form field based on schema
  const renderSchemaBasedField = (key: string, schema: JsonSchema, value: any): React.ReactNode => {
    if (!schema) return null;

    const handleChange = (newValue: any) => {
      updateConfig(key, newValue);
    };

    if (schema.type === 'object' && schema.properties) {
      return (
        <div className="nested-object">
          {Object.entries(schema.properties).map(([propKey, propSchema]) => (
            <div key={propKey} className="form-group">
              <label className="field-label">
                {propKey.charAt(0).toUpperCase() + propKey.slice(1).replace(/([A-Z])/g, ' $1')}
                {schema.required?.includes(propKey) && ' *'}
              </label>
              {propSchema.description && (
                <p className="field-description">{propSchema.description}</p>
              )}
              {renderSchemaBasedField(`${key}.${propKey}`, propSchema, value?.[propKey])}
            </div>
          ))}
        </div>
      );
    }

    if (schema.type === 'array') {
      if (schema.items?.enum) {
        // Multi-select for enum arrays
        return (
          <div className="multi-select">
            {schema.items.enum.map((option: string) => (
              <label key={option} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentArray = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      handleChange([...currentArray, option]);
                    } else {
                      handleChange(currentArray.filter((item: string) => item !== option));
                    }
                  }}
                />
                {option}
              </label>
            ))}
          </div>
        );
      }
      
      if (schema.items?.type === 'object') {
        // Array of objects (like tenants)
        const arrayValue = Array.isArray(value) ? value : [];
        return (
          <div className="array-field">
            <div className="array-header">
              <span className="count-badge">{arrayValue.length}</span>
              <span>{arrayValue.length === 1 ? 'Item' : 'Items'}</span>
              <button
                type="button"
                onClick={() => {
                  const newItem = generateDefaultFromSchema(schema.items);
                  handleChange([...arrayValue, newItem]);
                }}
                className="add-button"
              >
                + Add Item
              </button>
            </div>
            {arrayValue.map((item: any, index: number) => (
              <div key={index} className="array-item">
                <div className="array-item-header">
                  <h4>Item {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newArray = arrayValue.filter((_: any, i: number) => i !== index);
                      handleChange(newArray);
                    }}
                    className="remove-button"
                    disabled={arrayValue.length === 1}
                  >
                    🗑️
                  </button>
                </div>
                {renderSchemaBasedField(`${key}.${index}`, schema.items, item)}
              </div>
            ))}
          </div>
        );
      }
    }

    if (schema.enum) {
      return (
        <select
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="select-input"
        >
          <option value="">Select an option</option>
          {schema.enum.map((option: any) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (schema.type === 'boolean') {
      return (
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleChange(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      );
    }

    if (schema.type === 'number' || schema.type === 'integer') {
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => handleChange(Number(e.target.value))}
          min={schema.minimum}
          max={schema.maximum}
          className="number-input"
        />
      );
    }

    // Default to text input
    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        className="text-input"
        required={schema.required?.includes(key)}
      />
    );
  };

  // Generate default value from schema
  const generateDefaultFromSchema = (schema: JsonSchema): any => {
    if (schema.default !== undefined) return schema.default;
    
    if (schema.type === 'object' && schema.properties) {
      const obj: any = {};
      Object.entries(schema.properties).forEach(([key, propSchema]) => {
        obj[key] = generateDefaultFromSchema(propSchema);
      });
      return obj;
    }
    
    if (schema.type === 'array') return [];
    if (schema.type === 'boolean') return false;
    if (schema.type === 'number' || schema.type === 'integer') return 0;
    return '';
  };

  // Generate complete config from schema
  const generateConfigFromSchema = (): TenantConfig => {
    if (!schemaProperties?.properties) return defaultConfig;
    
    const generated: any = {};
    Object.entries(schemaProperties.properties).forEach(([key, schema]) => {
      generated[key] = generateDefaultFromSchema(schema);
    });
    
    return generated as TenantConfig;
  };

  const updateConfig = (path: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current = newConfig as any;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (current[key] === undefined) {
          current[key] = {};
        }
        current = current[key];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const handleSchemaEditorClose = () => {
    setShowSchemaEditor(false);
  };

  const handleSchemaSave = () => {
    loadSchemaFromFile(); // Reload schema after save
    setShowSchemaEditor(false);
  };

  const handleDirectorySelect = async (directoryPath: string) => {
    try {
      const files = await getConfigurationFiles(directoryPath);
      setConfigFiles(files);
      setCurrentScreen('form');
    } catch (error) {
      console.error('Error loading configuration files:', error);
    }
  };

  const handleTenantFileSelect = async (fileName: string) => {
    setSelectedTenantFile(fileName);
    try {
      const fileContent = await readConfigFile(fileName);
      const parsedConfig = JSON.parse(fileContent);
      setConfig(parsedConfig);
      setOriginalConfig(parsedConfig);
    } catch (error) {
      console.error('Error reading config file:', error);
      setConfig(generateConfigFromSchema());
      setOriginalConfig(generateConfigFromSchema());
    }
  };

  const handleBackToDirectory = () => {
    setCurrentScreen('directory');
    setConfigFiles([]);
    setSelectedTenantFile('');
  };

  const handleSwitchToJson = () => {
    setCurrentScreen('json');
  };

  const handleBackToForm = () => {
    setCurrentScreen('form');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
  };

  const saveTenantFile = async () => {
    try {
      const response = await fetch('http://localhost:8002/api/files/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: selectedTenantFile,
          content: JSON.stringify(config, null, 2),
        }),
      });

      if (response.ok) {
        console.log('Configuration saved successfully');
        setOriginalConfig({ ...config });
      } else {
        console.error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  };

  const tenantFiles = configFiles.map(file => ({
    value: file.fileName,
    label: file.displayName
  }));

  if (currentScreen === 'directory') {
    return (
      <div className="App">
        <div className="header">
          <h1>🥷 Config Ninja</h1>
          <p>Schema-driven tenant configuration management</p>
        </div>
        <DirectoryBrowser onDirectorySelect={handleDirectorySelect} />
      </div>
    );
  }

  if (currentScreen === 'form') {
    return (
      <div className="App">
        <div className="header">
          <h1>🥷 Config Ninja</h1>
          <div className="header-actions">
            <button onClick={() => setShowSchemaEditor(true)} className="schema-button">
              ⚙️ Edit Schema
            </button>
            <button onClick={handleBackToDirectory} className="back-button">
              ← Back to Directory
            </button>
          </div>
        </div>

        <main className="main">
          <div className="tenant-file-selector">
            <label htmlFor="tenant-select">Choose Configuration:</label>
            <select
              id="tenant-select"
              value={selectedTenantFile}
              onChange={(e) => handleTenantFileSelect(e.target.value)}
              className="file-select"
            >
              <option value="">Select a tenant configuration...</option>
              {tenantFiles.map((file) => (
                <option key={file.value} value={file.value}>
                  {file.label}
                </option>
              ))}
            </select>
            <button onClick={handleSwitchToJson} className="view-toggle">
              📄 View JSON
            </button>
          </div>

          {selectedTenantFile && (
            <div className="form-container">
              <div className="form-header">
                <h2>⚙️ Configuration Editor</h2>
                <p>
                  Editing: {tenantFiles.find((f) => f.value === selectedTenantFile)?.label}
                </p>
              </div>

              <div className="form-content-wrapper">
                {/* Left Column - Form */}
                <div className="form-column">
                  <div className="form-scroll-area">
                    {schemaLoading ? (
                      <div className="loading">Loading schema...</div>
                    ) : schemaProperties ? (
                      // Schema-driven form generation
                      Object.entries(schemaProperties.properties || {}).map(([sectionName, sectionSchema]) => (
                        <div key={sectionName} className="form-section">
                          <h3>
                            {sectionName === 'features' && '🚀 '}
                            {sectionName === 'api' && '🔗 '}
                            {sectionName === 'auth' && '🔐 '}
                            {sectionName === 'branding' && '🎨 '}
                            {sectionName === 'tenants' && '👥 '}
                            {sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace(/([A-Z])/g, ' $1')}
                          </h3>
                          {renderSchemaBasedField(sectionName, sectionSchema, config[sectionName as keyof TenantConfig])}
                        </div>
                      ))
                    ) : (
                      <div className="no-schema">
                        <p>No schema loaded. Please edit the schema first.</p>
                        <button
                          onClick={() => setShowSchemaEditor(true)}
                          className="primary-button"
                        >
                          Edit Schema
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-footer">
                    <div className="preview-info">
                      <span className="config-file-name">
                        📄 Config for: {tenantFiles.find((f) => f.value === selectedTenantFile)?.label}
                      </span>
                    </div>
                    <div className="button-group">
                      <button onClick={copyToClipboard} className="secondary-button">
                        📋 Copy JSON
                      </button>
                      <button onClick={saveTenantFile} className="primary-button">
                        💾 Save Config
                      </button>
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
  }

  // JSON View
  return (
    <div className="App">
      <div className="header">
        <h1>🥷 Config Ninja</h1>
        <div className="header-actions">
          <button onClick={handleBackToForm} className="back-button">
            ← Back to Form
          </button>
        </div>
      </div>

      <div className="json-container">
        <div className="json-header">
          <h3>📄 Generated Configuration</h3>
          <p>
            Viewing: {tenantFiles.find((f) => f.value === selectedTenantFile)?.label}
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
    </div>
  );
};

export default App;
