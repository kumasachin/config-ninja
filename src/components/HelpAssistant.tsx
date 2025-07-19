import React, { useState } from "react";
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  HelpOutline as HelpIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Code as CodeIcon,
  Description as DocsIcon,
} from "@mui/icons-material";

interface Message {
  id: string;
  type: "user" | "support";
  content: string;
  timestamp: Date;
}

interface HelpAssistantProps {
  repositoryContext?: {
    name: string;
    description: string;
    technologies: string[];
    features: string[];
  };
}

const HelpAssistant: React.FC<HelpAssistantProps> = ({ repositoryContext }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const defaultContext = {
    name: "Config Ninja",
    description:
      "A React TypeScript configuration management application with schema editor, nested object/array support, and PWA capabilities",
    technologies: [
      "React 18",
      "TypeScript",
      "Material-UI",
      "Vite",
      "Express.js",
      "Cypress",
    ],
    features: [
      "3-level nested object/array schema editing",
      "JSON Schema generation from samples",
      "File system API integration",
      "Configuration comparison",
      "PWA support",
      "Automated testing with Cypress",
    ],
  };

  const context = repositoryContext || defaultContext;

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = getHelpResponse(input);

      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "support",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, supportMessage]);
    } catch (error) {
      console.error("Help response error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "support",
        content:
          "Sorry, I encountered an error. Let me provide some general help instead.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const getHelpResponse = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();

    if (
      lowerPrompt.includes("start") ||
      lowerPrompt.includes("install") ||
      lowerPrompt.includes("setup") ||
      lowerPrompt.includes("begin")
    ) {
      return `So you want to get ${context.name} running? Here's what I usually do:

First, clone the repo and run \`npm install\` to get all dependencies.

Make sure to copy \`.env.example\` to \`.env\` - you'll need that for the config.

Then you've got a couple options:
- \`npm run dev\` starts just the frontend (port 3001)
- \`npm run dev:server\` for just the backend (port 8002) 
- \`npm start\` fires up both at once

Once it's running, head to http://localhost:3001 and you're good to go!

Pro tip: Start by creating a simple schema first, then generate a form from it. That's usually the best way to see what this thing can actually do.`;
    }

    if (
      lowerPrompt.includes("schema") ||
      lowerPrompt.includes("edit") ||
      lowerPrompt.includes("json schema")
    ) {
      return `The schema editor is honestly the coolest part of this app. Click the "🔄 Change Schema" button to get started.

You've got two ways to work with it:

**Manual approach**: Build your schema piece by piece. Add fields, set their types (string, number, boolean, array, object), add descriptions, set up validation rules. It's pretty intuitive once you get the hang of it.

**Smart generation**: This one's my favorite - just paste in some JSON data and it'll figure out the schema for you. Super handy when you're working with existing configs or APIs.

The really nice thing is it handles complex nested stuff really well. You can go 3 levels deep with objects and arrays, and it keeps track of everything with full TypeScript support.

Once you've got your schema, it generates the actual forms in real-time. Pretty neat to watch it work.`;
    }

    if (
      lowerPrompt.includes("config") ||
      lowerPrompt.includes("save") ||
      lowerPrompt.includes("load") ||
      lowerPrompt.includes("file")
    ) {
      return `The configuration management system handles all your file operations:

You can save configs as JSON files, load them back up, and even compare different versions side by side. Really helpful for tracking what changed between deployments.

Basic workflow:
1. Create or edit your schema
2. Generate the configuration forms
3. Fill out the forms with your actual data
4. Save everything locally or export it
5. Use the comparison tool to see differences

It supports JSON configs, JSON Schema exports, TypeScript interface generation, and even environment variable exports. Pretty comprehensive for most use cases.`;
    }

    if (
      lowerPrompt.includes("test") ||
      lowerPrompt.includes("cypress") ||
      lowerPrompt.includes("qa") ||
      lowerPrompt.includes("quality")
    ) {
      return `Testing setup is pretty solid here. We're using Cypress for end-to-end testing.

Run \`npm run test:e2e\` to execute all tests, or \`npm run test:e2e:open\` if you want the interactive GUI (which is way more fun to watch).

The test suite covers the important stuff:
- Schema editor functionality 
- Creating and editing nested objects
- Array handling 
- Form generation
- File operations
- Basic UI interactions

All tests are in the \`cypress/e2e/\` directory. Last I checked, we had 10 scenarios running and they're all passing.

If you're adding new features, definitely write some tests for them. The existing tests are a good template to follow.`;
    }

    if (
      lowerPrompt.includes("build") ||
      lowerPrompt.includes("deploy") ||
      lowerPrompt.includes("production") ||
      lowerPrompt.includes("hosting")
    ) {
      return `For building and deployment:

\`npm run build\` creates an optimized production build in the \`dist/\` folder. It includes the PWA manifest and service worker, so users can install it like a native app.

\`npm run preview\` lets you test the production build locally before deploying.

Deployment options are pretty flexible:
- Static hosting: Vercel, Netlify, GitHub Pages all work great
- CDN: AWS CloudFront, Cloudflare
- Self-hosted: Nginx, Apache
- Containers: Docker-ready

The PWA features give you offline functionality and app installation capability. Pretty neat for a web app.`;
    }

    if (
      lowerPrompt.includes("feature") ||
      lowerPrompt.includes("what") ||
      lowerPrompt.includes("capability") ||
      lowerPrompt.includes("can do")
    ) {
      return `${
        context.name
      } is basically a visual tool for managing configurations. Here's what it can do:

The main thing is the schema editor - you can create forms dynamically just by defining the structure. It handles nested objects (up to 3 levels), arrays, all the basic data types.

File management is built in - save configs as JSON, load them back, compare different versions side by side. Pretty handy for keeping track of changes.

It's built with ${context.technologies.join(
        ", "
      )} so it's got that modern React feel. The whole thing works offline too since it's a PWA - you can literally install it like a native app.

Other neat stuff:
- TypeScript throughout for type safety
- Real-time form generation as you build schemas  
- Can reverse-engineer schemas from existing JSON
- Comprehensive test suite with Cypress
- Hot reload during development

It's really useful for API configurations, app settings, basically anywhere you need structured data entry forms but don't want to hand-code them every time.`;
    }

    if (
      lowerPrompt.includes("architecture") ||
      lowerPrompt.includes("structure") ||
      lowerPrompt.includes("technical") ||
      lowerPrompt.includes("how it works")
    ) {
      return `Technical architecture is pretty straightforward:

Frontend: React 18 with TypeScript, Material-UI for the design system, Vite for fast builds and dev server.

Project structure:
\`\`\`
src/
├── components/     # Reusable UI components
├── pages/         # Main application pages  
├── types/         # TypeScript definitions
├── utils/         # Helper functions
├── hooks/         # Custom React hooks
└── assets/        # Static files
\`\`\`

Data flow: Schema definition → validation → form generation → user input → config creation → file operations.

Key patterns we use:
- Component composition over inheritance
- Custom hooks for complex logic
- Type-safe state management
- Separation of concerns
- Error boundaries for resilience`;
    }

    if (
      lowerPrompt.includes("error") ||
      lowerPrompt.includes("problem") ||
      lowerPrompt.includes("issue") ||
      lowerPrompt.includes("troubleshoot") ||
      lowerPrompt.includes("help") ||
      lowerPrompt.includes("broken")
    ) {
      return `Common troubleshooting steps:

**Installation issues**: Clear npm cache (\`npm cache clean --force\`), delete node_modules and reinstall. Make sure you're on Node 16+.

**Dev server problems**: Check for port conflicts (change in .env), make sure backend starts on 8002, verify CORS config.

**Schema editor issues**: Remember the 3-level nesting limit, check that field types match your data, ensure valid JSON format.

**Build/deploy problems**: Look for TypeScript errors, verify service worker registration for PWA, check base URL config.

**Performance**: Enable React strict mode, check for memory leaks, use dynamic imports for large bundles.

If you're still stuck, check the help system (? button) or run the tests (\`npm run test:e2e\`) to isolate the issue.`;
    }

    if (
      lowerPrompt.includes("best practice") ||
      lowerPrompt.includes("tips") ||
      lowerPrompt.includes("recommendation") ||
      lowerPrompt.includes("optimize")
    ) {
      return `Some best practices that work well:

**Schema design**: Use clear field names, add helpful descriptions, keep nesting reasonable (max 3 levels), group related fields together.

**Workflow**: Start with sample JSON for complex schemas, use the comparison tool for debugging, save schemas as templates, test configs before deploying.

**Performance**: Minimize deep nesting, use arrays efficiently, enable PWA caching, optimize assets, implement lazy loading.

**Security**: Always validate input, use TypeScript strict mode, sanitize data, implement error boundaries, test edge cases.

**UX**: Provide clear descriptions, use appropriate input types, show loading states, add helpful error messages, test on different devices.

The help system has comprehensive guides if you need more detailed info on any of these topics.`;
    }

    if (
      lowerPrompt.includes("develop") ||
      lowerPrompt.includes("contribute") ||
      lowerPrompt.includes("code") ||
      lowerPrompt.includes("extend") ||
      lowerPrompt.includes("customize")
    ) {
      return `For development and customization:

Basic setup: Fork the repo, \`npm install\`, \`npm run dev\`, \`npm run test:e2e\`, \`npm run build\`.

Code standards: TypeScript strict mode, ESLint + Prettier, consistent patterns, comprehensive testing, documentation for new features.

Adding features: Create feature branches, write tests first (TDD), follow existing patterns, update docs, ensure accessibility.

Good areas to contribute:
- New field types and validation rules
- Additional export formats  
- UI/UX improvements
- Performance optimizations
- Internationalization
- More test scenarios

Architecture guidelines: Keep components focused, use custom hooks for complex logic, maintain type safety, follow React best practices.`;
    }

    if (
      lowerPrompt.includes("performance") ||
      lowerPrompt.includes("speed") ||
      lowerPrompt.includes("slow") ||
      lowerPrompt.includes("optimize") ||
      lowerPrompt.includes("fast")
    ) {
      return `Performance is pretty good out of the box:

Vite gives us lightning-fast builds and dev server, code splitting happens automatically, lazy loading for components, PWA caching for offline performance.

For monitoring: \`npm run build:analyze\` shows bundle sizes, Chrome DevTools for runtime performance, Lighthouse for web vitals.

Optimization strategies: Keep schemas reasonably simple, use React.memo for expensive components, minimize re-renders, compress assets, implement efficient caching.

Current benchmarks: < 2 seconds initial load on 3G, < 100ms schema generation, < 50ms form rendering for 20+ fields, < 500KB bundle size gzipped.

Quick wins: Enable PWA caching, use dynamic imports, optimize images, minimize dependencies, implement virtual scrolling for large lists.`;
    }

    if (
      lowerPrompt.includes("api") ||
      lowerPrompt.includes("integration") ||
      lowerPrompt.includes("backend") ||
      lowerPrompt.includes("server") ||
      lowerPrompt.includes("endpoint")
    ) {
      return `Backend integration uses Express.js on port 8002:

API endpoints:
- \`GET /api/configs\`: List configurations
- \`POST /api/configs\`: Save new config
- \`PUT /api/configs/:id\`: Update config
- \`DELETE /api/configs/:id\`: Delete config
- \`GET /api/schemas\`: List schemas

Integration patterns: Fetch API for HTTP requests, comprehensive error handling, loading states for user feedback, offline PWA support.

External integrations: File system operations, JSON Schema validation, TypeScript generation, environment variables.

Security: Input validation on both ends, CORS configuration, file system restrictions, data sanitization.

Custom examples: Connect to APIs for validation, integrate with CI/CD pipelines, add database storage, implement authentication.`;
    }

    return `Hey! I'm here to help with ${context.name}.

**Common questions**:
🚀 "How to start" - Setup and installation guide
🔧 "Schema editor" - Learn schema creation and editing  
⭐ "Features" - Discover available capabilities
🧪 "Testing" - Running tests and QA
🏗️ "Architecture" - Technical details and structure
🛠️ "Troubleshooting" - Common issues and solutions
💡 "Best practices" - Tips for optimal usage
📈 "Performance" - Speed optimization techniques
🔌 "API integration" - Backend and external connections

Just ask about anything - features, errors, development, architecture, whatever you need help with!`;
  };

  const quickQuestions = [
    { text: "How do I get started?", icon: <HelpIcon /> },
    { text: "How does the schema editor work?", icon: <CodeIcon /> },
    { text: "What features are available?", icon: <DocsIcon /> },
    { text: "How do I run tests?", icon: <CodeIcon /> },
    { text: "How to troubleshoot problems?", icon: <HelpIcon /> },
    { text: "What are the best practices?", icon: <DocsIcon /> },
    { text: "How to deploy to production?", icon: <CodeIcon /> },
    { text: "How to optimize performance?", icon: <HelpIcon /> },
    { text: "How to integrate with APIs?", icon: <CodeIcon /> },
    { text: "What's the technical architecture?", icon: <DocsIcon /> },
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="Help Assistant"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
        onClick={() => setOpen(true)}
      >
        <HelpIcon />
      </Fab>

      {/* Help Assistant Dialog */}
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
          <HelpIcon color="primary" />
          <Typography variant="h6" sx={{ flex: 1 }}>
            Help Center - {context.name}
          </Typography>
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
                👋 Hi! I'm here to help you understand and use this React
                repository. Ask me anything about the code, features, or how to
                get started!
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
                    Looking up information...
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
              placeholder="Ask me anything about this repository..."
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

export default HelpAssistant;
