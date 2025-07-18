import React, { useState } from 'react'
import './App.css'

interface ConfigTemplate {
  id: string
  name: string
  format: 'json'
  template: string
}

const templates: ConfigTemplate[] = [
  {
    id: 'package-json',
    name: 'package.json',
    format: 'json',
    template: `{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js"
  }
}`
  }
]

const App: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<ConfigTemplate | null>(null)
  const [configContent, setConfigContent] = useState<string>('')

  const handleTemplateSelect = (template: ConfigTemplate) => {
    setSelectedTemplate(template)
    setConfigContent(template.template)
  }

  const downloadConfig = () => {
    if (!selectedTemplate || !configContent) return

    const blob = new Blob([configContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = selectedTemplate.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(configContent)
      alert('Copied!')
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Config Ninja</h1>
      </header>

      <main className="main">
        <div className="templates">
          <h2>Choose Template</h2>
          <div className="templates-grid">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                onClick={() => handleTemplateSelect(template)}
              >
                <h3>{template.name}</h3>
                <span className="format-badge">{template.format}</span>
              </div>
            ))}
          </div>
        </div>

        {selectedTemplate && (
          <div className="editor">
            <div className="editor-header">
              <h3>Edit {selectedTemplate.name}</h3>
              <div className="actions">
                <button onClick={copyToClipboard}>Copy</button>
                <button onClick={downloadConfig} className="primary">Download</button>
              </div>
            </div>
            <textarea
              className="config-editor"
              value={configContent}
              onChange={(e) => setConfigContent(e.target.value)}
              placeholder="Your configuration..."
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
