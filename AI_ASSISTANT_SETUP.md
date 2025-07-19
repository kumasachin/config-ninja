# AI Assistant Setup Guide

The Config Ninja application includes an integrated AI assistant to help you understand and use the repository. The assistant supports multiple AI providers with different capabilities and setup requirements.

## 🤖 AI Provider Options

### 1. **Ollama (Recommended - Free & Local)**
- ✅ **Completely free**
- ✅ **Runs locally** (privacy-focused)
- ✅ **Best code understanding**
- ✅ **No API limits**

### 2. **Hugging Face (Fallback - Free Tier)**
- ✅ **Free tier available**
- ✅ **No local setup required**
- ⚠️ **Limited requests per hour**

### 3. **Static Responses (Always Available)**
- ✅ **No setup required**
- ✅ **Instant responses**
- ⚠️ **Pre-defined answers only**

## 🚀 Quick Setup (Recommended)

### Option 1: Ollama Setup (Best Experience)

1. **Install Ollama**:
   ```bash
   # macOS
   brew install ollama
   
   # Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Windows
   # Download from https://ollama.ai/download
   ```

2. **Start Ollama service**:
   ```bash
   ollama serve
   ```

3. **Install a model** (choose one):
   ```bash
   # General purpose (recommended)
   ollama pull llama3.2
   
   # Code-focused (better for development questions)
   ollama pull codellama
   
   # Lightweight option
   ollama pull llama3.2:1b
   ```

4. **Start the Config Ninja app**:
   ```bash
   npm run dev
   npm run dev:server
   ```

The AI assistant will automatically detect Ollama and use it for the best experience!

### Option 2: No Setup Required

If you don't want to install anything, the AI assistant will automatically fall back to:
1. **Hugging Face API** (free tier) - for basic AI responses
2. **Static responses** - for instant help with common questions

## 🎯 How to Use the AI Assistant

1. **Open the assistant**: Click the floating AI icon (🤖) in the bottom-right corner
2. **Ask questions** about:
   - How to get started with the repository
   - How to use the schema editor
   - Code structure and architecture
   - Running tests and deployment
   - Specific features and capabilities

3. **Quick questions**: Use the pre-defined chips for common questions

## 💡 Example Questions

- "How do I get started with this project?"
- "How does the 3-level nesting work in the schema editor?"
- "How do I run the Cypress tests?"
- "What technologies are used in this project?"
- "How do I deploy this application?"
- "Can you explain the schema generation feature?"

## 🔧 Advanced Configuration

### Custom AI Provider

You can extend the AIAssistant component to use other providers:

```typescript
// Add to AIAssistant.tsx
const getCustomAIResponse = async (prompt: string): Promise<string> => {
  // Your custom AI provider logic here
  // e.g., OpenAI, Claude, Google AI, etc.
};
```

### Environment Variables

For production deployments with external AI services, add these to your `.env`:

```env
# Optional: Add API keys for external services
VITE_OPENAI_API_KEY=your_openai_key
VITE_HUGGINGFACE_API_KEY=your_hf_key
```

## 🆘 Troubleshooting

### Ollama Not Working?
1. Make sure Ollama is running: `ollama serve`
2. Check if models are installed: `ollama list`
3. Verify port 11434 is accessible: `curl http://localhost:11434/api/tags`

### AI Responses Seem Generic?
- Try installing Ollama with CodeLlama model for better code understanding
- The static fallback provides repository-specific information even without AI

### Performance Issues?
- Use smaller models like `llama3.2:1b` for faster responses
- Consider using the static response mode for instant help

## 📊 Feature Comparison

| Provider | Setup | Cost | Code Understanding | Response Quality | Privacy |
|----------|--------|------|-------------------|------------------|---------|
| Ollama | Medium | Free | Excellent | Excellent | Complete |
| Hugging Face | Easy | Free* | Good | Good | Limited |
| Static | None | Free | Good | Good | Complete |

*Free tier has limits

## 🎉 Ready to Use!

The AI assistant is now integrated and ready to help users understand your React repository. It will automatically choose the best available provider and provide contextual help based on your project's structure and features.

The assistant knows about:
- React 18 + TypeScript setup
- Material-UI components
- Schema editor functionality
- 3-level nesting capabilities
- Cypress testing setup
- PWA features
- Build and deployment process
