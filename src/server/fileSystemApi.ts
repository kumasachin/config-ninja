import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8002;

app.use(cors());
app.use(express.json());

interface FileSystemItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  isConfig?: boolean;
  size?: number;
  modified?: Date;
}

// Endpoint to scan a directory
app.get('/api/scan-directory', async (req, res) => {
  try {
    const directoryPath = req.query.path as string;
    
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

    const items: FileSystemItem[] = [];
    const entries = fs.readdirSync(directoryPath);

    for (const entry of entries) {
      const fullPath = path.join(directoryPath, entry);
      
      try {
        const itemStats = fs.statSync(fullPath);
        const isDirectory = itemStats.isDirectory();
        const isConfig = !isDirectory && (
          entry.endsWith('.json') || 
          entry.endsWith('.config') ||
          entry.includes('config')
        );

        items.push({
          name: entry,
          path: fullPath,
          type: isDirectory ? 'directory' : 'file',
          isConfig,
          size: isDirectory ? undefined : itemStats.size,
          modified: itemStats.mtime
        });
      } catch (error) {
        // Skip files that can't be accessed (permissions, etc.)
        console.warn(`Skipping ${fullPath}: ${error}`);
      }
    }

    // Sort items: directories first, then files, alphabetically within each group
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

// Endpoint to validate if a path exists
app.get('/api/validate-path', async (req, res) => {
  try {
    const pathToValidate = req.query.path as string;
    
    if (!pathToValidate) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    const exists = fs.existsSync(pathToValidate);
    const isDirectory = exists ? fs.statSync(pathToValidate).isDirectory() : false;

    res.json({ exists, isDirectory });
  } catch (error) {
    console.error('Error validating path:', error);
    res.json({ exists: false, isDirectory: false });
  }
});

// Endpoint to read a configuration file
app.get('/api/read-file', async (req, res) => {
  try {
    const filePath = req.query.path as string;
    
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

    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Try to parse as JSON if it's a JSON file
    if (filePath.endsWith('.json')) {
      try {
        const jsonContent = JSON.parse(content);
        res.json(jsonContent);
      } catch (parseError) {
        res.status(400).json({ error: 'Invalid JSON format' });
      }
    } else {
      res.json({ content });
    }
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// Endpoint to write a configuration file
app.post('/api/write-file', async (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    
    if (!filePath || content === undefined) {
      return res.status(400).json({ error: 'Path and content are required' });
    }

    // Ensure the directory exists
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Write the file
    const contentToWrite = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    fs.writeFileSync(filePath, contentToWrite, 'utf-8');

    res.json({ success: true, message: 'File written successfully' });
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).json({ error: 'Failed to write file' });
  }
});

// Endpoint to get suggested base paths
app.get('/api/suggested-paths', async (_req, res) => {
  try {
    const suggestions = [
      {
        path: path.resolve('./src/config'),
        label: 'Project Config Directory',
        description: 'Current project configuration folder'
      },
      {
        path: path.resolve('./'),
        label: 'Project Root',
        description: 'Root directory of the current project'
      },
      {
        path: path.resolve(process.env.HOME || '~'),
        label: 'Home Directory',
        description: 'User home directory'
      },
      {
        path: '/Users',
        label: 'Users Directory',
        description: 'macOS Users directory'
      },
      {
        path: '/tmp',
        label: 'Temporary Directory',
        description: 'System temporary directory'
      }
    ];

    // Filter suggestions to only include existing paths
    const validSuggestions = suggestions.filter(suggestion => 
      fs.existsSync(suggestion.path)
    );

    res.json(validSuggestions);
  } catch (error) {
    console.error('Error getting suggested paths:', error);
    res.status(500).json({ error: 'Failed to get suggested paths' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 File System API server running on port ${PORT}`);
  console.log(`📁 Available at: http://localhost:${PORT}`);
});

export default app;
