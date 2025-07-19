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
        type: "assistant",
        content: "Sorry, something went wrong. Let me try to help anyway.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const getOllamaResponse = async (prompt: string): Promise<string> => {
    const systemInfo = `Just some quick context about ${context.name}:
    
- It's ${context.description}
- Uses: ${context.technologies.join(", ")}
- Has these features: ${context.features.join(", ")}

User wants help with this app - setting it up, understanding how it works, using the features, developing with it, that kind of thing. Just be natural and helpful.`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2",
        prompt: `${systemInfo}\n\nQuestion: ${prompt}`,
        stream: false,
      }),
    });

    const data = await response.json();
    return (
      data.response ||
      "Hmm, not sure about that one. Try asking something else?"
    );
  };

  const getHuggingFaceResponse = async (prompt: string): Promise<string> => {
    // Fallback to HuggingFace API
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `About ${
            context.description
          }. Tech: ${context.technologies.join(", ")}. Question: ${prompt}`,
          parameters: {
            max_length: 512,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();
    return data[0]?.generated_text || getStaticResponse(prompt);
  };

  const getStaticResponse = (prompt: string): string => {
    const query = prompt.toLowerCase();

    if (
      query.includes("start") ||
      query.includes("setup") ||
      query.includes("install")
    ) {
      return `Getting ${context.name} up and running:

First, make sure you have Node.js 18+ installed. Then:
- Run \`npm install\` to grab dependencies
- \`npm run dev\` starts the frontend (port 3001)
- \`npm run dev:server\` starts the backend (port 8002)
- Or just use \`npm start\` to fire up both

Head to http://localhost:3001 when it's ready.`;
    }

    if (query.includes("schema") || query.includes("edit")) {
      return `Schema editor stuff:

Hit the "🔄 Change Schema" button to open it up. You can either build schemas manually (add fields, set types like string/number/boolean/array/object) or use the "Generate from Sample" mode where you paste JSON and it figures out the schema for you.

Handles 3 levels of nesting and arrays of objects. Pretty handy for complex configs.`;
    }

    if (query.includes("test") || query.includes("cypress")) {
      return `Testing setup:

\`npm run test:e2e\` runs all tests
\`npm run test:e2e:open\` opens the Cypress GUI

Tests are in \`cypress/e2e/\` and cover schema editing, nesting, arrays, the works. All 10 scenarios passing last I checked.`;
    }

    if (query.includes("build") || query.includes("deploy")) {
      return `Build and deployment:

\`npm run build\` creates production build
\`npm run preview\` lets you test it locally

Outputs to \`dist/\` folder with PWA service worker included. Works on any static host - Vercel, Netlify, etc.`;
    }

    if (query.includes("feature") || query.includes("what")) {
      return `What ${context.name} does:

Main thing is the schema editor - create forms dynamically by defining structure. Handles nested objects, arrays, all the basic types.

Built with ${context.technologies.join(
        ", "
      )}. It's a PWA so works offline and can be installed.

Other stuff: TypeScript everywhere, real-time form generation, reverse-engineer schemas from JSON, Cypress tests.`;
    }

    return `Hey! Need help with ${context.name}?

Try asking about:
- "How to start" - getting set up
- "Schema editor" - the main editing features  
- "Testing" - running the test suite
- "Build" - production deployment
- "Features" - what this thing actually does

Just type whatever you're wondering about.`;
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
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 1000,
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
          "& .MuiDialog-paper": {
            height: "70vh",
            maxHeight: "600px",
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AIIcon color="primary" />
          <Typography variant="h6" sx={{ flex: 1 }}>
            AI Assistant - {context.name}
          </Typography>
          <Chip
            label={
              aiProvider === "ollama"
                ? "Ollama"
                : aiProvider === "huggingface"
                ? "HuggingFace"
                : "Static"
            }
            size="small"
            color="primary"
            variant="outlined"
          />
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {/* Welcome Message */}
          {messages.length === 0 && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                👋 Hey there! I can help you figure out how to use this React
                app. Ask me about features, setup, or anything else you're
                curious about.
              </Alert>

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Quick Questions:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
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
          <Box sx={{ flex: 1, overflow: "auto", mb: 2 }}>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: "flex",
                  justifyContent:
                    message.type === "user" ? "flex-end" : "flex-start",
                  mb: 1,
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: "80%",
                    backgroundColor:
                      message.type === "user" ? "primary.main" : "grey.100",
                    color: message.type === "user" ? "white" : "text.primary",
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {message.content}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.7, display: "block", mt: 0.5 }}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            ))}
            {loading && (
              <Box
                sx={{ display: "flex", justifyContent: "flex-start", mb: 1 }}
              >
                <Paper elevation={1} sx={{ p: 2, backgroundColor: "grey.100" }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" sx={{ ml: 1, display: "inline" }}>
                    Looking that up...
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>

          {/* Input Area */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="What do you need help with?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
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
              sx={{ minWidth: "auto", px: 2 }}
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
