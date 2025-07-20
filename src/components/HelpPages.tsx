import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Info as InfoIcon,
  PlayArrow as PlayArrowIcon,
  Settings as SettingsIcon,
  Folder as FolderIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Compare as CompareIcon,
  Code as CodeIcon,
  Schema as SchemaIcon,
  AutoAwesome as AutoAwesomeIcon,
  Storage as StorageIcon,
} from "@mui/icons-material";
interface HelpPagesProps {
  open: boolean;
  onClose: () => void;
}

const HelpPages: React.FC<HelpPagesProps> = ({ open, onClose }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const workflowSteps = [
    {
      label: 'Select Configuration File',
      description: 'Choose which tenant configuration you want to work with',
      icon: <FolderIcon />,
      details: [
        'Browse available configuration files from the dropdown',
        'Use the Directory Browser to explore file system',
        'Filter to show only configuration files',
        'Preview file paths and metadata'
      ]
    },
    {
      label: 'Load & Edit Configuration',
      description: 'Load the selected file and start editing',
      icon: <EditIcon />,
      details: [
        'Configuration loads into an intelligent form',
        'All fields are validated against the schema',
        'Real-time comparison shows changes',
        'Switch between Form View and JSON View'
      ]
    },
    {
      label: 'Modify Schema (Optional)',
      description: 'Customize the configuration schema if needed',
      icon: <SchemaIcon />,
      details: [
        'Add new fields with different data types',
        'Support for nested objects and arrays',
        'Generate schema from sample JSON',
        'Save schema changes to schema file'
      ]
    },
    {
      label: 'Review Changes',
      description: 'Compare original vs modified configuration',
      icon: <CompareIcon />,
      details: [
        'Side-by-side comparison view',
        'Highlight added, modified, and removed fields',
        'Real-time change statistics',
        'Easy identification of configuration differences'
      ]
    },
    {
      label: 'Save Configuration',
      description: 'Save your changes back to the file system',
      icon: <SaveIcon />,
      details: [
        'Save directly to the original file',
        'Copy JSON to clipboard',
        'Validation before saving',
        'Confirmation of successful save'
      ]
    }
  ];

  const features = [
    {
      title: 'Smart File Browser',
      icon: <FolderIcon color="primary" />,
      description: 'Navigate through directories and identify configuration files automatically',
      capabilities: [
        'Recursive directory scanning',
        'Configuration file detection',
        'File metadata display',
        'System file explorer integration'
      ]
    },
    {
      title: 'Dynamic Schema Editor',
      icon: <SchemaIcon color="secondary" />,
      description: 'Create and modify JSON schemas with a visual interface',
      capabilities: [
        'Drag-and-drop field management',
        'Support for complex data types',
        'Nested object and array handling',
        'Schema generation from samples'
      ]
    },
    {
      title: 'Real-time Comparison',
      icon: <CompareIcon color="success" />,
      description: 'Live comparison between original and modified configurations',
      capabilities: [
        'Side-by-side diff view',
        'Change highlighting',
        'Statistical analysis',
        'Change history tracking'
      ]
    },
    {
      title: 'AI-Powered Assistant',
      icon: <AutoAwesomeIcon color="info" />,
      description: 'Get help and guidance with AI assistance',
      capabilities: [
        'Context-aware responses',
        'Multi-provider support (Ollama, HuggingFace)',
        'Repository-specific knowledge',
        'Quick question shortcuts'
      ]
    }
  ];

  const technologies = [
    { name: 'React 18', purpose: 'Frontend framework', color: 'primary' },
    { name: 'TypeScript', purpose: 'Type safety', color: 'secondary' },
    { name: 'Material-UI v7', purpose: 'UI components', color: 'success' },
    { name: 'Vite', purpose: 'Build tool', color: 'warning' },
    { name: 'JSON Schema', purpose: 'Validation', color: 'info' },
    { name: 'Cypress', purpose: 'E2E testing', color: 'error' }
  ];

  const DataFlowDiagram = () => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <StorageIcon color="secondary" />
        Data Flow Architecture
      </Typography>
      
      <Card>
        <CardContent>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 2,
            '& .data-node': {
              p: 2,
              border: '2px solid',
              borderRadius: 1,
              textAlign: 'center',
              position: 'relative'
            },
            '& .data-node.input': {
              borderColor: 'success.main',
              backgroundColor: 'success.50'
            },
            '& .data-node.process': {
              borderColor: 'warning.main',
              backgroundColor: 'warning.50'
            },
            '& .data-node.output': {
              borderColor: 'error.main',
              backgroundColor: 'error.50'
            }
          }}>
            <Box className="data-node input">
              <CodeIcon />
              <Typography variant="subtitle2">JSON Files</Typography>
              <Typography variant="caption">Configuration data</Typography>
            </Box>
            
            <Box className="data-node input">
              <SchemaIcon />
              <Typography variant="subtitle2">Schema File</Typography>
              <Typography variant="caption">Validation rules</Typography>
            </Box>
            
            <Box className="data-node process">
              <SettingsIcon />
              <Typography variant="subtitle2">Form Generator</Typography>
              <Typography variant="caption">Dynamic UI creation</Typography>
            </Box>
            
            <Box className="data-node process">
              <EditIcon />
              <Typography variant="subtitle2">User Edits</Typography>
              <Typography variant="caption">Interactive modifications</Typography>
            </Box>
            
            <Box className="data-node process">
              <CompareIcon />
              <Typography variant="subtitle2">Diff Engine</Typography>
              <Typography variant="caption">Change detection</Typography>
            </Box>
            
            <Box className="data-node output">
              <SaveIcon />
              <Typography variant="subtitle2">Updated Config</Typography>
              <Typography variant="caption">Modified JSON</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderTabContent = () => {
    switch (currentTab) {
      case 0: // Overview
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Config Ninja</strong> is an advanced tenant configuration management tool that simplifies editing complex JSON configurations through an intuitive visual interface.
            </Alert>

            <Typography variant="h6" gutterBottom>What is Config Ninja?</Typography>
            <Typography paragraph>
              Config Ninja transforms complex JSON configuration files into user-friendly forms, making it easy to manage tenant-specific settings across different environments (development, staging, production). It provides real-time validation, change tracking, and schema-based form generation.
            </Typography>

            <Typography variant="h6" gutterBottom>Key Benefits</Typography>
            <List>
              <ListItem>
                <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Visual Configuration Editing" 
                  secondary="Replace complex JSON editing with intuitive forms"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><SchemaIcon color="secondary" /></ListItemIcon>
                <ListItemText 
                  primary="Schema-Driven Validation" 
                  secondary="Automatic validation and type checking based on JSON schemas"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CompareIcon color="success" /></ListItemIcon>
                <ListItemText 
                  primary="Real-time Change Tracking" 
                  secondary="See exactly what changed with side-by-side comparisons"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><AutoAwesomeIcon color="info" /></ListItemIcon>
                <ListItemText 
                  primary="AI-Powered Assistance" 
                  secondary="Get contextual help and guidance while editing"
                />
              </ListItem>
            </List>

            <DataFlowDiagram />
          </Box>
        );

      case 1: // Getting Started
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Quick Start Guide</Typography>
            
            <Stepper activeStep={activeStep} orientation="vertical">
              {workflowSteps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    optional={
                      index === 2 ? (
                        <Typography variant="caption">Optional</Typography>
                      ) : null
                    }
                    icon={step.icon}
                  >
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    <Typography paragraph>{step.description}</Typography>
                    <List dense>
                      {step.details.map((detail, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <PlayArrowIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={detail} />
                        </ListItem>
                      ))}
                    </List>
                    <Box sx={{ mb: 2 }}>
                      <div>
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{ mt: 1, mr: 1 }}
                          disabled={index === workflowSteps.length - 1}
                        >
                          {index === workflowSteps.length - 1 ? 'Finish' : 'Continue'}
                        </Button>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Back
                        </Button>
                      </div>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
            {activeStep === workflowSteps.length && (
              <Paper square elevation={0} sx={{ p: 3 }}>
                <Typography>All steps completed - you're ready to use Config Ninja!</Typography>
                <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                  Reset Guide
                </Button>
              </Paper>
            )}
          </Box>
        );

      case 2: // Features
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Core Features</Typography>
            
            <Box sx={{ display: 'grid', gap: 2, mb: 3 }}>
              {features.map((feature, index) => (
                <Card key={index}>
                  <CardHeader
                    avatar={feature.icon}
                    title={feature.title}
                    subheader={feature.description}
                  />
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>Capabilities:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {feature.capabilities.map((capability, idx) => (
                        <Chip key={idx} label={capability} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>Technology Stack</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {technologies.map((tech, index) => (
                <Chip
                  key={index}
                  label={`${tech.name} - ${tech.purpose}`}
                  color={tech.color as any}
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        );

      case 3: // Usage Guide
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Detailed Usage Guide</Typography>

            <Card sx={{ mb: 3 }}>
              <CardHeader title="📁 File Selection" />
              <CardContent>
                <Typography paragraph>
                  Start by selecting a configuration file to work with:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="1. Use the dropdown to see available configuration files"
                      secondary="Files are automatically discovered in the current directory"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="2. Click 'Browse Files' to explore the file system"
                      secondary="Navigate through directories to find your target configuration"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="3. Select a file and click 'Load & Edit Configuration'"
                      secondary="The application will load the JSON and generate a form"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardHeader title="✏️ Configuration Editing" />
              <CardContent>
                <Typography paragraph>
                  Edit your configuration using the generated form:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Form View"
                      secondary="User-friendly form fields with validation and help text"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="JSON View"
                      secondary="Direct JSON editing with syntax highlighting"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Real-time Comparison"
                      secondary="See changes highlighted in the comparison panel"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardHeader title="🔧 Schema Management" />
              <CardContent>
                <Typography paragraph>
                  Customize the configuration schema:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Edit Schema Tab"
                      secondary="Add, modify, or remove fields with visual tools"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Generate from Sample"
                      secondary="Create schemas automatically from existing JSON configurations"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Field Types"
                      secondary="Support for strings, numbers, booleans, arrays, and nested objects"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="💾 Saving and Export" />
              <CardContent>
                <Typography paragraph>
                  Save your work:
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Save to File"
                      secondary="Directly update the original configuration file"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Copy to Clipboard"
                      secondary="Copy the JSON configuration for use elsewhere"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Validation"
                      secondary="All changes are validated against the schema before saving"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        );

      case 4: // Troubleshooting
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Troubleshooting Guide</Typography>

            <Alert severity="warning" sx={{ mb: 3 }}>
              If you encounter issues, try these common solutions first.
            </Alert>

            <Card sx={{ mb: 2 }}>
              <CardHeader title="🚫 Cannot Load Configuration File" />
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>Possible Causes:</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="File permissions - ensure the file is readable" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Invalid JSON format - check for syntax errors" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="File path issues - verify the file exists" />
                  </ListItem>
                </List>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Solutions:</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Validate JSON using an online JSON validator" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Check file permissions in your operating system" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Try loading a different configuration file" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
              <CardHeader title="⚠️ Schema Validation Errors" />
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>Common Issues:</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Required fields missing values" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Data type mismatches (string vs number)" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Invalid array or object structures" />
                  </ListItem>
                </List>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>How to Fix:</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Check the Schema Editor for field requirements" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Ensure all required fields have values" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Verify data types match schema expectations" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
              <CardHeader title="💾 Cannot Save Changes" />
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>Check These Items:</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="File write permissions for the target directory" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Disk space availability" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="File is not locked by another application" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Configuration passes all validation checks" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="🤖 AI Assistant Not Working" />
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>Setup Steps:</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Install Ollama locally for best performance" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Check HuggingFace API key if using cloud AI" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Static responses work without any setup" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="See AI_ASSISTANT_SETUP.md for detailed instructions" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          height: '90vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="primary" />
          Config Ninja Help & Documentation
        </Typography>
        <IconButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="📖 Overview" />
          <Tab label="🚀 Getting Started" />
          <Tab label="⚡ Features" />
          <Tab label="📋 Usage Guide" />
          <Tab label="🔧 Troubleshooting" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {renderTabContent()}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpPages;
