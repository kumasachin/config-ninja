import React, { useState, useEffect } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  IconButton,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Help as HelpIcon,
  Code as CodeIcon,
  Description as DocsIcon
} from '@mui/icons-material';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  repositoryContext?: {
    name: string;
    description: string;
    technologies: string[];
    features: string[];
  };
}

const AIAssistant: React.FC<AIAssistantProps> = ({ repositoryContext }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiProvider, setAiProvider] = useState<'ollama' | 'huggingface' | 'none'>('none');

  const defaultContext = {
    name: 'Config Ninja',
    description: 'A React TypeScript configuration management application with schema editor, nested object/array support, and PWA capabilities',
    technologies: ['React 18', 'TypeScript', 'Material-UI', 'Vite', 'Express.js', 'Cypress'],
    features: [
      '3-level nested object/array schema editing',
      'JSON Schema generation from samples',
      'File system API integration',
      'Configuration comparison',
      'PWA support',
      'Automated testing with Cypress'
    ]
  };

  const context = repositoryContext || defaultContext;

  // Check available AI providers on component mount
  useEffect(() => {
    checkAIProviders();
  }, []);

  const checkAIProviders = async () => {
    try {
      // Check if Ollama is running locally
      const ollamaResponse = await fetch('http://localhost:11434/api/tags');
      if (ollamaResponse.ok) {
        setAiProvider('ollama');
        return;
      }
    } catch (error) {
      console.log('Ollama not available');
    }

    // Fallback to Hugging Face (free tier)
    setAiProvider('huggingface');
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let response = '';
      
      if (aiProvider === 'ollama') {
        response = await getOllamaResponse(input);
      } else if (aiProvider === 'huggingface') {
        response = await getHuggingFaceResponse(input);
      } else {
        response = getStaticResponse(input);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI response error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Let me provide some general help instead.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const getOllamaResponse = async (prompt: string): Promise<string> => {
    const systemPrompt = `You are a helpful AI assistant for the ${context.name} repository. 
    
Repository Context:
- Name: ${context.name}
- Description: ${context.description}
- Technologies: ${context.technologies.join(', ')}
- Key Features: ${context.features.join(', ')}

Please provide helpful, accurate information about this React TypeScript project. Focus on:
- How to use the application
- Code structure and architecture
- Available features and capabilities
- Development setup and workflow
- Best practices for this tech stack

Keep responses concise but informative.`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2', // or 'codellama' for code-specific queries
        prompt: `${systemPrompt}\n\nUser Question: ${prompt}`,
        stream: false
      })
    });

    const data = await response.json();
    return data.response || 'Sorry, I could not process your request.';
  };

  const getHuggingFaceResponse = async (prompt: string): Promise<string> => {
    // Using Hugging Face's free inference API
    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `Context: ${context.description}. Technologies: ${context.technologies.join(', ')}. Question: ${prompt}`,
          parameters: {
            max_length: 512,
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();
    return data[0]?.generated_text || getStaticResponse(prompt);
  };

  const getStaticResponse = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('start') || lowerPrompt.includes('setup') || lowerPrompt.includes('install')) {
      return `To get started with ${context.name}:

1. **Prerequisites**: Node.js 18+, npm/yarn
2. **Installation**: \`npm install\`
3. **Development**: \`npm run dev\` (starts frontend on port 3001)
4. **Backend**: \`npm run dev:server\` (starts backend on port 8002)
5. **Full Setup**: \`npm start\` (starts both servers)

The app will be available at http://localhost:3001`;
    }

    if (lowerPrompt.includes('schema') || lowerPrompt.includes('edit')) {
      return `**Schema Editor Features**:

- Click "🔄 Change Schema" to open the schema editor
- Supports 3-level nested objects and arrays
- Two modes: Manual editing and "Generate from Sample"
- Add fields with types: string, number, boolean, array, object
- Real-time JSON Schema generation
- Supports complex nested structures like arrays of objects

**Usage**: Create your schema structure, then use it to generate configuration forms.`;
    }

    if (lowerPrompt.includes('test') || lowerPrompt.includes('cypress')) {
      return `**Testing with Cypress**:

- \`npm run test:e2e\`: Run all tests
- \`npm run test:e2e:open\`: Open Cypress GUI
- Tests cover: schema editing, nesting, arrays, generation

**Test Files**: Located in \`cypress/e2e/\`
All 10 test scenarios are passing with 100% success rate!`;
    }

    if (lowerPrompt.includes('build') || lowerPrompt.includes('deploy')) {
      return `**Building & Deployment**:

- \`npm run build\`: Creates production build
- \`npm run preview\`: Preview production build
- **PWA Ready**: Service worker included
- **Static Hosting**: Build outputs to \`dist/\` folder

The app is a Progressive Web App (PWA) with offline capabilities.`;
    }

    if (lowerPrompt.includes('feature') || lowerPrompt.includes('what')) {
      return `**Key Features of ${context.name}**:

✅ **Schema Editor**: 3-level nested object/array support
✅ **Generate from Sample**: Create schemas from JSON examples  
✅ **Configuration Management**: File system integration
✅ **Comparison Tool**: Compare different configurations
✅ **PWA Support**: Works offline, installable
✅ **Testing**: Comprehensive Cypress test suite
✅ **TypeScript**: Full type safety

**Tech Stack**: ${context.technologies.join(', ')}`;
    }

    return `I'm here to help with ${context.name}! 

**Quick Help Topics**:
- "How to start" - Setup and installation
- "Schema editor" - Using the schema editing features  
- "Testing" - Running Cypress tests
- "Build" - Production deployment
- "Features" - What this app can do

Feel free to ask specific questions about the code, features, or how to use this React application!`;
  };

  const quickQuestions = [
    { text: "How do I get started?", icon: <HelpIcon /> },
    { text: "How does the schema editor work?", icon: <CodeIcon /> },
    { text: "What features are available?", icon: <DocsIcon /> },
    { text: "How do I run tests?", icon: <CodeIcon /> }
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="AI Assistant"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000
        }}
        onClick={() => setOpen(true)}
      >
        <AIIcon />
      </Fab>

      {/* AI Assistant Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            height: '70vh',
            maxHeight: '600px'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AIIcon color="primary" />
          <Typography variant="h6" sx={{ flex: 1 }}>
            AI Assistant - {context.name}
          </Typography>
          <Chip 
            label={aiProvider === 'ollama' ? 'Ollama' : aiProvider === 'huggingface' ? 'HuggingFace' : 'Static'} 
            size="small" 
            color="primary" 
            variant="outlined" 
          />
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Welcome Message */}
          {messages.length === 0 && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                👋 Hi! I'm here to help you understand and use this React repository. 
                Ask me anything about the code, features, or how to get started!
              </Alert>
              
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Quick Questions:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {quickQuestions.map((q, index) => (
                  <Chip
                    key={index}
                    icon={q.icon}
                    label={q.text}
                    onClick={() => handleQuickQuestion(q.text)}
                    variant="outlined"
                    clickable
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Messages */}
          <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    backgroundColor: message.type === 'user' ? 'primary.main' : 'grey.100',
                    color: message.type === 'user' ? 'white' : 'text.primary'
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                <Paper elevation={1} sx={{ p: 2, backgroundColor: 'grey.100' }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" sx={{ ml: 1, display: 'inline' }}>
                    Thinking...
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>

          {/* Input Area */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask me anything about this repository..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              multiline
              maxRows={3}
              disabled={loading}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <SendIcon />
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIAssistant;
