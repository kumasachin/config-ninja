import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 8002;

// Middleware
app.use(cors())
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Template management API
app.get('/api/templates', (req, res) => {
  const templates = [
    {
      id: 'package-json',
      name: 'package.json',
      description: 'Node.js package configuration',
      format: 'json',
      category: 'nodejs'
    },
    {
      id: 'docker-compose',
      name: 'docker-compose.yml',
      description: 'Docker Compose configuration',
      format: 'yaml',
      category: 'docker'
    },
    {
      id: 'vite-config',
      name: 'vite.config.ts',
      description: 'Vite configuration file',
      format: 'typescript',
      category: 'build-tools'
    },
    {
      id: 'eslint-config',
      name: '.eslintrc.js',
      description: 'ESLint configuration',
      format: 'javascript',
      category: 'linting'
    }
  ]
  
  res.json(templates)
})

// Config validation API
app.post('/api/validate', (req, res) => {
  const { content, format } = req.body
  
  try {
    if (format === 'json') {
      JSON.parse(content)
    }
    // Add more validation logic for other formats
    
    res.json({ valid: true, message: 'Configuration is valid' })
  } catch (error) {
    res.status(400).json({ 
      valid: false, 
      message: error.message 
    })
  }
})

// Config generation API
app.post('/api/generate', (req, res) => {
  const { templateId, customFields } = req.body
  
  // This would contain logic to generate configs based on templates
  // For now, return a simple response
  res.json({
    success: true,
    config: 'Generated configuration content would go here',
    templateId,
    customFields
  })
})

// File System API Endpoints
// Endpoint to scan a directory
app.get('/api/scan-directory', async (req, res) => {
  try {
    const directoryPath = req.query.path;
    
    if (!directoryPath) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    // Validate that the path exists and is accessible
    if (!fs.existsSync(directoryPath)) {
      return res.status(404).json({ error: 'Directory not found' });
    }

    const stats = fs.statSync(directoryPath);
    if (!stats.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory' });
    }

    // Read directory contents
    const files = fs.readdirSync(directoryPath);
    const items = [];

    for (const file of files) {
      // Skip hidden files and common development directories
      if (file.startsWith('.') || ['node_modules', 'dist', 'build'].includes(file)) {
        continue;
      }

      const filePath = path.join(directoryPath, file);
      const fileStats = fs.statSync(filePath);
      
      const item = {
        name: file,
        path: filePath,
        type: fileStats.isDirectory() ? 'directory' : 'file',
        size: fileStats.size,
        modified: fileStats.mtime,
        isConfig: false
      };

      // Mark as config file if it's a JSON file or config-related
      if (!fileStats.isDirectory() && 
          (file.endsWith('.json') || 
           file.includes('config') || 
           file.endsWith('.js') || 
           file.endsWith('.ts'))) {
        item.isConfig = true;
      }

      items.push(item);
    }

    // Sort items: directories first, then files
    items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    res.json(items);
  } catch (error) {
    console.error('Error scanning directory:', error);
    res.status(500).json({ error: 'Failed to scan directory' });
  }
});

// Endpoint to validate a path
app.get('/api/validate-path', (req, res) => {
  try {
    const targetPath = req.query.path;
    
    if (!targetPath) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    const exists = fs.existsSync(targetPath);
    if (!exists) {
      return res.status(404).json({ valid: false, error: 'Path does not exist' });
    }

    const stats = fs.statSync(targetPath);
    res.json({
      valid: true,
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      size: stats.size,
      modified: stats.mtime
    });
  } catch (error) {
    console.error('Error validating path:', error);
    res.status(500).json({ valid: false, error: 'Failed to validate path' });
  }
});

// Endpoint to read a file
app.get('/api/read-file', (req, res) => {
  try {
    const filePath = req.query.path;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      return res.status(400).json({ error: 'Path is not a file' });
    }

    // Check file size (limit to 10MB)
    if (stats.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large (max 10MB)' });
    }

    const content = fs.readFileSync(filePath, 'utf8');
    res.json({
      content,
      size: stats.size,
      modified: stats.mtime,
      path: filePath
    });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// Endpoint to write a file
app.post('/api/write-file', (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    
    if (!filePath || content === undefined) {
      return res.status(400).json({ error: 'Path and content are required' });
    }

    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf8');
    
    const stats = fs.statSync(filePath);
    res.json({
      success: true,
      path: filePath,
      size: stats.size,
      modified: stats.mtime
    });
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).json({ error: 'Failed to write file' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')))
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`)
})
