import React, { useState, useEffect } from 'react';

interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description?: string;
  options?: string[]; // for select fields
  children?: SchemaField[]; // for nested objects
}

interface Schema {
  name: string;
  description: string;
  fields: SchemaField[];
}

interface SchemaEditorProps {
  onClose: () => void;
  onSave: (schema: Schema) => void;
  existingSchema?: Schema;
}

const SchemaEditor: React.FC<SchemaEditorProps> = ({ onClose, onSave, existingSchema }) => {
  // Always use the standard schema path
  const SCHEMA_FILE_PATH = '/Users/sachinkumar/Documents/config-ninja/src/config/tenant-config.schema.json';
  
  const [schema, setSchema] = useState<Schema>({
    name: 'BASS Platform Tenant Configuration',
    description: 'Configuration schema for BASS platform tenant settings and features',
    fields: []
  });
  const [activeTab, setActiveTab] = useState<'edit' | 'generate'>('edit');
  const [sampleConfig, setSampleConfig] = useState<string>('');
  const [generationError, setGenerationError] = useState<string>('');
  const [loadingSchema, setLoadingSchema] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');
  const [savingSchema, setSavingSchema] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');

  // Load schema on component mount
  useEffect(() => {
    loadExistingSchema();
  }, []);

  const loadExistingSchema = async () => {
    setLoadingSchema(true);
    setLoadError('');
    
    try {
      // Load the tenant-config.schema.json file using relative URL with proxy
      const response = await fetch(
        `/api/read-file?path=${encodeURIComponent(SCHEMA_FILE_PATH)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to load schema file: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Schema data received:", data);

      const jsonSchema = JSON.parse(data.content);
      console.log("Parsed JSON schema:", jsonSchema);

      // Convert JSON Schema to our internal schema format
      const convertedSchema = convertJsonSchemaToInternalFormat(jsonSchema);
      console.log("Converted schema:", convertedSchema);
      setSchema(convertedSchema);
    } catch (error) {
      console.error('Error loading schema:', error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setLoadError(`Failed to load existing schema file: ${errorMessage}`);
    } finally {
      setLoadingSchema(false);
    }
  };

  const convertJsonSchemaToInternalFormat = (jsonSchema: any): Schema => {
    const fields: SchemaField[] = [];
    
    if (jsonSchema.properties) {
      for (const [key, value] of Object.entries(jsonSchema.properties)) {
        const prop = value as any;
        const field: SchemaField = {
          name: key,
          type: mapJsonSchemaType(prop),
          required: jsonSchema.required?.includes(key) || false,
          description: prop.description || '',
          options: extractOptionsFromJsonSchema(prop)
        };
        
        // Handle nested objects
        if (prop.type === 'object' && prop.properties) {
          field.children = Object.entries(prop.properties).map(([childKey, childValue]) => {
            const childProp = childValue as any;
            return {
              name: childKey,
              type: mapJsonSchemaType(childProp),
              required: prop.required?.includes(childKey) || false,
              description: childProp.description || '',
              options: extractOptionsFromJsonSchema(childProp)
            };
          });
        }
        
        // Handle arrays with object items
        if (prop.type === 'array' && prop.items?.type === 'object' && prop.items.properties) {
          field.children = Object.entries(prop.items.properties).map(([childKey, childValue]) => {
            const childProp = childValue as any;
            return {
              name: childKey,
              type: mapJsonSchemaType(childProp),
              required: prop.items.required?.includes(childKey) || false,
              description: childProp.description || '',
              options: extractOptionsFromJsonSchema(childProp)
            };
          });
        }
        
        fields.push(field);
      }
    }
    
    return {
      name: jsonSchema.title || 'Loaded Schema',
      description: jsonSchema.description || 'Schema loaded from file',
      fields
    };
  };

  const mapJsonSchemaType = (prop: any): SchemaField['type'] => {
    if (prop.type === 'array') return 'array';
    if (prop.type === 'object') return 'object';
    if (prop.type === 'boolean') return 'boolean';
    if (prop.type === 'integer' || prop.type === 'number') return 'number';
    return 'string';
  };

  const extractOptionsFromJsonSchema = (prop: any): string[] | undefined => {
    if (prop.enum) return prop.enum;
    if (prop.items?.enum) return prop.items.enum;
    return undefined;
  };

  const convertInternalFormatToJsonSchema = (internalSchema: Schema): any => {
    const jsonSchema: any = {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "$id": "https://bass.io/schemas/tenant-config.json",
      "title": internalSchema.name,
      "description": internalSchema.description,
      "type": "object",
      "required": [],
      "properties": {},
      "additionalProperties": false
    };

    // Convert fields to JSON Schema properties
    internalSchema.fields.forEach(field => {
      const property: any = {
        type: field.type === 'number' ? 'integer' : field.type,
        description: field.description || ''
      };

      // Handle required fields
      if (field.required) {
        jsonSchema.required.push(field.name);
      }

      // Handle different field types
      if (field.type === 'array') {
        if (field.options && field.options.length > 0) {
          property.items = {
            type: "string",
            enum: field.options
          };
          property.uniqueItems = true;
        } else if (field.children && field.children.length > 0) {
          // Array of objects
          property.items = {
            type: "object",
            properties: {},
            required: []
          };
          
          field.children.forEach(child => {
            property.items.properties[child.name] = {
              type: child.type === 'number' ? 'integer' : child.type,
              description: child.description || ''
            };
            
            if (child.options && child.options.length > 0) {
              property.items.properties[child.name].enum = child.options;
            }
            
            if (child.required) {
              property.items.required.push(child.name);
            }
          });
        }
      } else if (field.type === 'object' && field.children && field.children.length > 0) {
        property.properties = {};
        property.required = [];
        
        field.children.forEach(child => {
          property.properties[child.name] = {
            type: child.type === 'number' ? 'integer' : child.type,
            description: child.description || ''
          };
          
          if (child.options && child.options.length > 0) {
            property.properties[child.name].enum = child.options;
          }
          
          if (child.required) {
            property.required.push(child.name);
          }
        });
      } else if (field.options && field.options.length > 0) {
        property.enum = field.options;
      }

      jsonSchema.properties[field.name] = property;
    });

    return jsonSchema;
  };

  const saveSchemaToFile = async () => {
    setSavingSchema(true);
    setSaveError('');
    
    try {
      // Convert internal schema to JSON Schema format
      const jsonSchema = convertInternalFormatToJsonSchema(schema);
      const schemaContent = JSON.stringify(jsonSchema, null, 2);
      
      // Save to the schema file
      const response = await fetch('http://localhost:8002/api/write-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: SCHEMA_FILE_PATH,
          content: schemaContent
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save schema file');
      }

      // Call the original onSave callback with success
      onSave(schema);
      
    } catch (error) {
      console.error('Error saving schema:', error);
      setSaveError('Failed to save schema file. Please try again.');
      setSavingSchema(false);
    }
  };

  const addField = () => {
    const newField: SchemaField = {
      name: `field_${schema.fields.length + 1}`,
      type: 'string',
      required: false,
      description: ''
    };
    setSchema(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const updateField = (index: number, field: SchemaField) => {
    setSchema(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => i === index ? field : f)
    }));
  };

  const removeField = (index: number) => {
    setSchema(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const generateSchemaFromSample = () => {
    try {
      const parsedConfig = JSON.parse(sampleConfig);
      const generatedFields = generateFieldsFromObject(parsedConfig);
      
      setSchema(prev => ({
        ...prev,
        fields: generatedFields
      }));
      setGenerationError('');
      setActiveTab('edit');
    } catch (error) {
      setGenerationError('Invalid JSON format. Please check your sample configuration.');
    }
  };

  const generateFieldsFromObject = (obj: any, prefix: string = ''): SchemaField[] => {
    const fields: SchemaField[] = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const fieldName = prefix ? `${prefix}.${key}` : key;
      let fieldType: SchemaField['type'] = 'string';
      let children: SchemaField[] | undefined;
      let options: string[] | undefined;
      
      if (Array.isArray(value)) {
        fieldType = 'array';
        if (value.length > 0 && typeof value[0] === 'string') {
          options = [...new Set(value)];
        }
      } else if (typeof value === 'object' && value !== null) {
        fieldType = 'object';
        children = generateFieldsFromObject(value, fieldName);
      } else if (typeof value === 'boolean') {
        fieldType = 'boolean';
      } else if (typeof value === 'number') {
        fieldType = 'number';
      }
      
      fields.push({
        name: key,
        type: fieldType,
        required: true,
        description: `Generated from sample: ${fieldName}`,
        options,
        children
      });
    }
    
    return fields;
  };

  const handleSave = () => {
    if (!schema.name.trim()) {
      alert('Please provide a schema name');
      return;
    }
    saveSchemaToFile();
  };

  return (
    <div className="schema-editor-overlay">
      <div className="schema-editor-modal">
        <div className="schema-editor-header">
          <h2>🛠 Schema Editor</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="schema-editor-tabs">
          <button
            className={`tab-button ${activeTab === "edit" ? "active" : ""}`}
            onClick={() => setActiveTab("edit")}
          >
            ✏️ Edit Schema
          </button>
          <button
            className={`tab-button ${activeTab === "generate" ? "active" : ""}`}
            onClick={() => setActiveTab("generate")}
          >
            🎯 Generate from Sample
          </button>
        </div>

        <div className="schema-editor-content">
          {activeTab === "edit" ? (
            <div className="edit-tab">
              {loadingSchema ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>
                    Loading schema from src/config/tenant-config.schema.json...
                  </p>
                </div>
              ) : loadError ? (
                <div className="error-message">
                  {loadError}
                  <button className="retry-button" onClick={loadExistingSchema}>
                    🔄 Retry Loading
                  </button>
                </div>
              ) : (
                <div>
                  <div className="schema-info">
                    <div className="schema-file-indicator">
                      <span className="file-icon">📄</span>
                      <div className="file-details">
                        <strong>
                          Editing: src/config/tenant-config.schema.json
                        </strong>
                        <p>Changes will be saved to this file automatically</p>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Schema Name</label>
                      <input
                        type="text"
                        value={schema.name}
                        onChange={(e) =>
                          setSchema((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Enter schema name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={schema.description}
                        onChange={(e) =>
                          setSchema((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Describe what this schema is for"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="fields-section">
                    <div className="fields-header">
                      <h3>Schema Fields ({schema.fields.length})</h3>
                      <button className="add-field-button" onClick={addField}>
                        + Add Field
                      </button>
                    </div>

                    <div className="fields-list">
                      {schema.fields.map((field, index) => (
                        <div key={index} className="field-editor">
                          <div className="field-row">
                            <div className="field-name">
                              <label>Field Name</label>
                              <input
                                type="text"
                                value={field.name}
                                onChange={(e) =>
                                  updateField(index, {
                                    ...field,
                                    name: e.target.value,
                                  })
                                }
                                placeholder="field_name"
                              />
                            </div>
                            <div className="field-type">
                              <label>Type</label>
                              <select
                                value={field.type}
                                onChange={(e) =>
                                  updateField(index, {
                                    ...field,
                                    type: e.target.value as SchemaField["type"],
                                  })
                                }
                              >
                                <option value="string">String</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="array">Array</option>
                                <option value="object">Object</option>
                              </select>
                            </div>
                            <div className="field-required">
                              <label>
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(e) =>
                                    updateField(index, {
                                      ...field,
                                      required: e.target.checked,
                                    })
                                  }
                                />
                                Required
                              </label>
                            </div>
                            <button
                              className="remove-field-button"
                              onClick={() => removeField(index)}
                            >
                              🗑
                            </button>
                          </div>
                          <div className="field-description">
                            <label>Description</label>
                            <input
                              type="text"
                              value={field.description || ""}
                              onChange={(e) =>
                                updateField(index, {
                                  ...field,
                                  description: e.target.value,
                                })
                              }
                              placeholder="Describe this field"
                            />
                          </div>
                          {field.type === "array" && (
                            <div className="field-options">
                              <label>Options (comma-separated)</label>
                              <input
                                type="text"
                                value={field.options?.join(", ") || ""}
                                onChange={(e) =>
                                  updateField(index, {
                                    ...field,
                                    options: e.target.value
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter(Boolean),
                                  })
                                }
                                placeholder="option1, option2, option3"
                              />
                            </div>
                          )}
                          {field.children && field.children.length > 0 && (
                            <div className="nested-fields">
                              <h5>Nested Fields ({field.children.length})</h5>
                              <div className="nested-field-item">
                                {field.children.map(
                                  (childField, childIndex) => (
                                    <div
                                      key={childIndex}
                                      className="nested-field-item"
                                    >
                                      <div className="nested-field-info">
                                        <strong>{childField.name}</strong>
                                        <span className="field-type-badge">
                                          {childField.type}
                                        </span>
                                        {childField.required && (
                                          <span className="required-badge">
                                            Required
                                          </span>
                                        )}
                                      </div>
                                      <div className="nested-field-description">
                                        {childField.description}
                                      </div>
                                      {childField.options && (
                                        <div className="nested-field-options">
                                          Options:{" "}
                                          {childField.options.join(", ")}
                                        </div>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {schema.fields.length === 0 && (
                        <div className="no-fields">
                          <p>
                            No fields defined yet. Click "Add Field" to start
                            building your schema.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className="generate-tab"
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                className="generate-info"
                style={{ marginBottom: "16px", flexShrink: 0 }}
              >
                <h3>🎯 Generate Schema from Sample Configuration</h3>
                <p>
                  Paste a sample JSON configuration below, and we'll
                  automatically generate a schema based on its structure and
                  data types.
                </p>
              </div>

              <div
                className="sample-input"
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <textarea
                  value={sampleConfig}
                  onChange={(e) => setSampleConfig(e.target.value)}
                  placeholder={`{
  "features": {
    "enabledModules": ["reporting", "analytics"],
    "betaFeatures": ["ai-suggestions"],
    "enableAdvancedReporting": true
  },
  "api": {
    "baseUrl": "https://api.example.com",
    "timeout": 30000
  }
}`}
                  style={{
                    width: "100%",
                    minHeight: "50vh",
                    height: "100%",
                    flex: 1,
                    resize: "none",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "12px",
                    fontFamily: "monospace",
                    fontSize: "14px",
                  }}
                />
                {generationError && (
                  <div className="error-message">{generationError}</div>
                )}
              </div>

              <div
                className="generate-actions"
                style={{ marginTop: "16px", flexShrink: 0 }}
              >
                <button
                  className="generate-button"
                  onClick={generateSchemaFromSample}
                  disabled={!sampleConfig.trim()}
                >
                  🚀 Generate Schema
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="schema-editor-footer">
          {saveError && (
            <div className="error-message save-error">{saveError}</div>
          )}
          <div className="footer-buttons">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button
              className="save-button"
              onClick={handleSave}
              disabled={savingSchema}
            >
              {savingSchema ? "💾 Saving..." : "💾 Save to Schema File"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemaEditor;
