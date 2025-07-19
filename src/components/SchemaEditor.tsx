import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  RocketLaunch as RocketLaunchIcon,
} from "@mui/icons-material";

interface SchemaField {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
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

const SchemaEditor: React.FC<SchemaEditorProps> = ({ onClose, onSave }) => {
  // Always use the standard schema path
  const SCHEMA_FILE_PATH =
    "/Users/sachinkumar/Documents/config-ninja/src/config/tenant-config.schema.json";

  const [schema, setSchema] = useState<Schema>({
    name: "BASS Platform Tenant Configuration",
    description:
      "Configuration schema for BASS platform tenant settings and features",
    fields: [],
  });
  const [activeTab, setActiveTab] = useState<"edit" | "generate">("edit");
  const [sampleConfig, setSampleConfig] = useState<string>("");
  const [generationError, setGenerationError] = useState<string>("");
  const [loadingSchema, setLoadingSchema] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>("");
  const [savingSchema, setSavingSchema] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>("");

  // Load schema on component mount
  useEffect(() => {
    loadExistingSchema();
  }, []);

  const loadExistingSchema = async () => {
    setLoadingSchema(true);
    setLoadError("");

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
      console.error("Error loading schema:", error);
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
          description: prop.description || "",
          options: extractOptionsFromJsonSchema(prop),
        };

        // Handle nested objects
        if (prop.type === "object" && prop.properties) {
          field.children = Object.entries(prop.properties).map(
            ([childKey, childValue]) => {
              const childProp = childValue as any;
              return {
                name: childKey,
                type: mapJsonSchemaType(childProp),
                required: prop.required?.includes(childKey) || false,
                description: childProp.description || "",
                options: extractOptionsFromJsonSchema(childProp),
              };
            }
          );
        }

        // Handle arrays with object items
        if (
          prop.type === "array" &&
          prop.items?.type === "object" &&
          prop.items.properties
        ) {
          field.children = Object.entries(prop.items.properties).map(
            ([childKey, childValue]) => {
              const childProp = childValue as any;
              return {
                name: childKey,
                type: mapJsonSchemaType(childProp),
                required: prop.items.required?.includes(childKey) || false,
                description: childProp.description || "",
                options: extractOptionsFromJsonSchema(childProp),
              };
            }
          );
        }

        fields.push(field);
      }
    }

    return {
      name: jsonSchema.title || "Loaded Schema",
      description: jsonSchema.description || "Schema loaded from file",
      fields,
    };
  };

  const mapJsonSchemaType = (prop: any): SchemaField["type"] => {
    if (prop.type === "array") return "array";
    if (prop.type === "object") return "object";
    if (prop.type === "boolean") return "boolean";
    if (prop.type === "integer" || prop.type === "number") return "number";
    return "string";
  };

  const extractOptionsFromJsonSchema = (prop: any): string[] | undefined => {
    if (prop.enum) return prop.enum;
    if (prop.items?.enum) return prop.items.enum;
    return undefined;
  };

  const convertInternalFormatToJsonSchema = (internalSchema: Schema): any => {
    const jsonSchema: any = {
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "https://bass.io/schemas/tenant-config.json",
      title: internalSchema.name,
      description: internalSchema.description,
      type: "object",
      required: [],
      properties: {},
      additionalProperties: false,
    };

    // Convert fields to JSON Schema properties
    internalSchema.fields.forEach((field) => {
      const property: any = {
        type: field.type === "number" ? "integer" : field.type,
        description: field.description || "",
      };

      // Handle required fields
      if (field.required) {
        jsonSchema.required.push(field.name);
      }

      // Handle different field types
      if (field.type === "array") {
        if (field.options && field.options.length > 0) {
          property.items = {
            type: "string",
            enum: field.options,
          };
          property.uniqueItems = true;
        } else if (field.children && field.children.length > 0) {
          // Array of objects
          property.items = {
            type: "object",
            properties: {},
            required: [],
          };

          field.children.forEach((child) => {
            property.items.properties[child.name] = {
              type: child.type === "number" ? "integer" : child.type,
              description: child.description || "",
            };

            if (child.options && child.options.length > 0) {
              property.items.properties[child.name].enum = child.options;
            }

            if (child.required) {
              property.items.required.push(child.name);
            }
          });
        }
      } else if (
        field.type === "object" &&
        field.children &&
        field.children.length > 0
      ) {
        property.properties = {};
        property.required = [];

        field.children.forEach((child) => {
          property.properties[child.name] = {
            type: child.type === "number" ? "integer" : child.type,
            description: child.description || "",
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
    setSaveError("");

    try {
      // Convert internal schema to JSON Schema format
      const jsonSchema = convertInternalFormatToJsonSchema(schema);
      const schemaContent = JSON.stringify(jsonSchema, null, 2);

      // Save to the schema file
      const response = await fetch("http://localhost:8002/api/write-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: SCHEMA_FILE_PATH,
          content: schemaContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save schema file");
      }

      // Call the original onSave callback with success
      onSave(schema);
    } catch (error) {
      console.error("Error saving schema:", error);
      setSaveError("Failed to save schema file. Please try again.");
      setSavingSchema(false);
    }
  };

  const addField = () => {
    const newField: SchemaField = {
      name: `field_${schema.fields.length + 1}`,
      type: "string",
      required: false,
      description: "",
    };
    setSchema((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const updateField = (index: number, field: SchemaField) => {
    setSchema((prev) => ({
      ...prev,
      fields: prev.fields.map((f, i) => (i === index ? field : f)),
    }));
  };

  const removeField = (index: number) => {
    setSchema((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const generateSchemaFromSample = () => {
    try {
      const parsedConfig = JSON.parse(sampleConfig);
      const generatedFields = generateFieldsFromObject(parsedConfig);

      setSchema((prev) => ({
        ...prev,
        fields: generatedFields,
      }));
      setGenerationError("");
      setActiveTab("edit");
    } catch (error) {
      setGenerationError(
        "Invalid JSON format. Please check your sample configuration."
      );
    }
  };

  const generateFieldsFromObject = (
    obj: any,
    prefix: string = ""
  ): SchemaField[] => {
    const fields: SchemaField[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const fieldName = prefix ? `${prefix}.${key}` : key;
      let fieldType: SchemaField["type"] = "string";
      let children: SchemaField[] | undefined;
      let options: string[] | undefined;

      if (Array.isArray(value)) {
        fieldType = "array";
        if (value.length > 0 && typeof value[0] === "string") {
          options = [...new Set(value)];
        }
      } else if (typeof value === "object" && value !== null) {
        fieldType = "object";
        children = generateFieldsFromObject(value, fieldName);
      } else if (typeof value === "boolean") {
        fieldType = "boolean";
      } else if (typeof value === "number") {
        fieldType = "number";
      }

      fields.push({
        name: key,
        type: fieldType,
        required: true,
        description: `Generated from sample: ${fieldName}`,
        options,
        children,
      });
    }

    return fields;
  };

  const handleSave = () => {
    if (!schema.name.trim()) {
      alert("Please provide a schema name");
      return;
    }
    saveSchemaToFile();
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: "80vh", maxHeight: "90vh" },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          🛠 Schema Editor
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
        >
          <Tab label="✏️ Edit Schema" value="edit" />
          <Tab label="🎯 Generate from Sample" value="generate" />
        </Tabs>
      </Box>

      <DialogContent
        sx={{ p: 0, display: "flex", flexDirection: "column", height: "100%" }}
      >
        {activeTab === "edit" ? (
          <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
            {loadingSchema ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "200px",
                }}
              >
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Loading schema from src/config/tenant-config.schema.json...
                </Typography>
              </Box>
            ) : loadError ? (
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={loadExistingSchema}
                  >
                    Retry Loading
                  </Button>
                }
              >
                {loadError}
              </Alert>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Paper elevation={1} sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Typography variant="h6">📄</Typography>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Editing: src/config/tenant-config.schema.json
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Changes will be saved to this file automatically
                      </Typography>
                    </Box>
                  </Box>

                  <Stack spacing={3}>
                    <TextField
                      label="Schema Name"
                      fullWidth
                      value={schema.name}
                      onChange={(e) =>
                        setSchema((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Enter schema name"
                    />
                    <TextField
                      label="Description"
                      fullWidth
                      multiline
                      rows={3}
                      value={schema.description}
                      onChange={(e) =>
                        setSchema((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe what this schema is for"
                    />
                  </Stack>
                </Paper>

                <Paper elevation={1} sx={{ p: 3, flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 3,
                    }}
                  >
                    <Typography variant="h6">
                      Schema Fields ({schema.fields.length})
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={addField}
                    >
                      Add Field
                    </Button>
                  </Box>

                  <Stack spacing={2}>
                    {schema.fields.map((field, index) => (
                      <Paper key={index} elevation={2} sx={{ p: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 2,
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <TextField
                            label="Field Name"
                            size="small"
                            sx={{ flex: 1 }}
                            value={field.name}
                            onChange={(e) =>
                              updateField(index, {
                                ...field,
                                name: e.target.value,
                              })
                            }
                            placeholder="field_name"
                          />
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Type</InputLabel>
                            <Select
                              value={field.type}
                              label="Type"
                              onChange={(e) =>
                                updateField(index, {
                                  ...field,
                                  type: e.target.value as SchemaField["type"],
                                })
                              }
                            >
                              <MenuItem value="string">String</MenuItem>
                              <MenuItem value="number">Number</MenuItem>
                              <MenuItem value="boolean">Boolean</MenuItem>
                              <MenuItem value="array">Array</MenuItem>
                              <MenuItem value="object">Object</MenuItem>
                            </Select>
                          </FormControl>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={field.required}
                                onChange={(e) =>
                                  updateField(index, {
                                    ...field,
                                    required: e.target.checked,
                                  })
                                }
                              />
                            }
                            label="Required"
                          />
                          <IconButton
                            color="error"
                            onClick={() => removeField(index)}
                            aria-label="Remove field"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>

                        <TextField
                          label="Description"
                          fullWidth
                          size="small"
                          value={field.description || ""}
                          onChange={(e) =>
                            updateField(index, {
                              ...field,
                              description: e.target.value,
                            })
                          }
                          placeholder="Describe this field"
                          sx={{ mb: 2 }}
                        />

                        {field.type === "array" && (
                          <TextField
                            label="Options (comma-separated)"
                            fullWidth
                            size="small"
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
                            sx={{ mb: 2 }}
                          />
                        )}

                        {field.children && field.children.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                              Nested Fields ({field.children.length})
                            </Typography>
                            <Stack spacing={1}>
                              {field.children.map((childField, childIndex) => (
                                <Paper
                                  key={childIndex}
                                  elevation={1}
                                  sx={{ p: 2, bgcolor: "grey.50" }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      mb: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight="bold"
                                    >
                                      {childField.name}
                                    </Typography>
                                    <Chip
                                      label={childField.type}
                                      size="small"
                                    />
                                    {childField.required && (
                                      <Chip
                                        label="Required"
                                        size="small"
                                        color="primary"
                                      />
                                    )}
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {childField.description}
                                  </Typography>
                                  {childField.options && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                      Options: {childField.options.join(", ")}
                                    </Typography>
                                  )}
                                </Paper>
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Paper>
                    ))}

                    {schema.fields.length === 0 && (
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No fields defined yet. Click "Add Field" to start
                          building your schema.
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ mb: 2, flexShrink: 0 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                🎯 Generate Schema from Sample Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paste a sample JSON configuration below, and we'll automatically
                generate a schema based on its structure and data types.
              </Typography>
            </Box>

            <Box
              sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                multiline
                fullWidth
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
                sx={{
                  flex: 1,
                  "& .MuiInputBase-root": {
                    height: "100%",
                    alignItems: "stretch",
                  },
                  "& .MuiInputBase-input": {
                    height: "100% !important",
                    fontFamily: "monospace",
                    fontSize: "14px",
                    padding: "16px !important",
                    minHeight: "60vh !important",
                  },
                  "& .MuiOutlinedInput-root": {
                    height: "100%",
                  },
                  "& .MuiOutlinedInput-input": {
                    height: "100% !important",
                    overflow: "auto !important",
                  },
                }}
              />

              {generationError && (
                <Alert severity="error">{generationError}</Alert>
              )}

              <Box sx={{ flexShrink: 0 }}>
                <Button
                  variant="contained"
                  startIcon={<RocketLaunchIcon />}
                  onClick={generateSchemaFromSample}
                  disabled={!sampleConfig.trim()}
                  fullWidth
                >
                  Generate Schema
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        {saveError && (
          <Alert severity="error" sx={{ flex: 1, mr: 2 }}>
            {saveError}
          </Alert>
        )}
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={savingSchema}
        >
          {savingSchema ? "Saving..." : "Save to Schema File"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SchemaEditor;
