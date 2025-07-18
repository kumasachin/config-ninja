import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 8000

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
