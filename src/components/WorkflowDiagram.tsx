import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import {
  Folder as FolderIcon,
  Edit as EditIcon,
  Compare as CompareIcon,
  Save as SaveIcon,
  Schema as SchemaIcon,
  Code as CodeIcon,
} from '@mui/icons-material';

interface FlowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  optional?: boolean;
}

const flowSteps: FlowStep[] = [
  {
    id: 'select',
    title: 'File Selection',
    description: 'Choose configuration file from directory browser or dropdown',
    icon: <FolderIcon />,
    color: '#3b82f6'
  },
  {
    id: 'load',
    title: 'Load Configuration',
    description: 'System loads JSON and associated schema for validation',
    icon: <CodeIcon />,
    color: '#10b981'
  },
  {
    id: 'schema',
    title: 'Schema Editor',
    description: 'Optionally modify schema structure and validation rules',
    icon: <SchemaIcon />,
    color: '#8b5cf6',
    optional: true
  },
  {
    id: 'edit',
    title: 'Interactive Editing',
    description: 'Edit configuration using dynamic forms or JSON view',
    icon: <EditIcon />,
    color: '#f59e0b'
  },
  {
    id: 'compare',
    title: 'Real-time Comparison',
    description: 'Review changes with side-by-side diff view',
    icon: <CompareIcon />,
    color: '#ef4444'
  },
  {
    id: 'save',
    title: 'Save & Export',
    description: 'Save changes to file or copy to clipboard',
    icon: <SaveIcon />,
    color: '#06b6d4'
  }
];

const WorkflowDiagram: React.FC = () => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
        📊 Config Ninja Workflow
      </Typography>
      
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        maxWidth: 800,
        mx: 'auto'
      }}>
        {flowSteps.map((step, index) => (
          <React.Fragment key={step.id}>
            <Card 
              sx={{ 
                width: '100%',
                maxWidth: 600,
                border: `2px solid ${step.color}`,
                boxShadow: `0 4px 12px ${step.color}20`,
                position: 'relative',
                ...(step.optional && {
                  borderStyle: 'dashed',
                  opacity: 0.8
                })
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  mb: 1
                }}>
                  <Box 
                    sx={{ 
                      color: step.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: `${step.color}15`,
                      border: `2px solid ${step.color}30`
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: step.color,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      {index + 1}. {step.title}
                      {step.optional && (
                        <Typography
                          variant="caption"
                          sx={{
                            backgroundColor: 'warning.main',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontWeight: 500
                          }}
                        >
                          Optional
                        </Typography>
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            
            {index < flowSteps.length - 1 && (
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                my: 1
              }}>
                <Typography 
                  sx={{ 
                    fontSize: '2rem',
                    color: 'primary.main',
                    fontWeight: 'bold',
                    transform: 'scaleY(1.5)'
                  }}
                >
                  ↓
                </Typography>
              </Box>
            )}
          </React.Fragment>
        ))}
      </Box>
      
      {/* Legend */}
      <Box sx={{ 
        mt: 4, 
        p: 2, 
        backgroundColor: 'grey.50', 
        borderRadius: 1,
        maxWidth: 600,
        mx: 'auto'
      }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          Workflow Legend:
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 16, 
              height: 16, 
              border: '2px solid #3b82f6',
              borderRadius: 0.5
            }} />
            <Typography variant="caption">Required Steps</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 16, 
              height: 16, 
              border: '2px dashed #8b5cf6',
              borderRadius: 0.5,
              opacity: 0.8
            }} />
            <Typography variant="caption">Optional Steps</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default WorkflowDiagram;
