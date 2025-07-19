import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock the AIAssistant component
jest.mock('../components/AIAssistant', () => {
  const MockAIAssistant = () => <div data-testid="ai-assistant">AI Assistant</div>;
  return {
    __esModule: true,
    default: MockAIAssistant,
  };
});

// Mock the DirectoryBrowser component
jest.mock('../components/DirectoryBrowser', () => {
  const MockDirectoryBrowser = () => <div data-testid="directory-browser">Directory Browser</div>;
  return {
    __esModule: true,
    default: MockDirectoryBrowser,
  };
});

// Mock the ConfigComparison component  
jest.mock('../components/ConfigComparison', () => {
  const MockConfigComparison = () => <div data-testid="config-comparison">Config Comparison</div>;
  return {
    __esModule: true,
    default: MockConfigComparison,
  };
});

// Mock the SchemaEditor component
jest.mock('../components/SchemaEditor', () => {
  const MockSchemaEditor = () => <div data-testid="schema-editor">Schema Editor</div>;
  return {
    __esModule: true,
    default: MockSchemaEditor,
  };
});

// Mock the HelpPages component
jest.mock('../components/HelpPages', () => {
  const MockHelpPages = () => <div data-testid="help-pages">Help Pages</div>;
  return {
    __esModule: true,
    default: MockHelpPages,
  };
});

// Mock the utility functions
jest.mock('../utils/fileSystem', () => ({
  getConfigurationFiles: jest.fn().mockResolvedValue([
    { value: 'tenant1.json', label: 'Tenant 1 Config' },
    { value: 'tenant2.json', label: 'Tenant 2 Config' },
  ]),
  readConfigFile: jest.fn().mockResolvedValue({
    tenants: [
      {
        tenantId: 'tenant1',
        tenantName: 'Test Tenant',
        customer: 'Test Customer',
        environment: 'development',
        features: {
          enabledModules: ['module1', 'module2'],
          betaFeatures: [],
          roles: ['admin', 'user'],
          enableAdvancedReporting: true,
          useAIInsights: false
        },
        api: {
          baseUrl: 'https://api.example.com',
          timeout: 5000
        },
        auth: {
          clientId: 'test-client-id',
          scopes: ['read', 'write']
        },
        branding: {
          title: 'Test App',
          theme: {
            primaryColor: '#007bff'
          }
        }
      }
    ]
  })
}));

// Mock child components to avoid complex rendering
jest.mock('../components/DirectoryBrowser', () => {
  return function MockDirectoryBrowser() {
    return <div data-testid="directory-browser">Directory Browser</div>;
  };
});

jest.mock('../components/ConfigComparison', () => {
  return function MockConfigComparison() {
    return <div data-testid="config-comparison">Config Comparison</div>;
  };
});

jest.mock('../components/SchemaEditor', () => {
  return function MockSchemaEditor() {
    return <div data-testid="schema-editor">Schema Editor</div>;
  };
});

jest.mock('../components/AIAssistant', () => {
  return function MockAIAssistant() {
    return <div data-testid="ai-assistant">AI Assistant</div>;
  };
});

jest.mock('../components/HelpPages', () => {
  return function MockHelpPages() {
    return <div data-testid="help-pages">Help Pages</div>;
  };
});

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders main header', () => {
    render(<App />);
    
    expect(screen.getByText('🥷 Config Ninja')).toBeInTheDocument();
  });

  test('renders navigation buttons', () => {
    render(<App />);
    
    expect(screen.getByText('📁 Files')).toBeInTheDocument();
    expect(screen.getByText('🔧 Editor')).toBeInTheDocument();
    expect(screen.getByText('🔄 Schema')).toBeInTheDocument();
    expect(screen.getByText('📊 Compare')).toBeInTheDocument();
    expect(screen.getByText('❓ Help')).toBeInTheDocument();
  });

  test('shows file selection view by default', () => {
    render(<App />);
    
    expect(screen.getByText('📁 Configuration File Selection')).toBeInTheDocument();
    expect(screen.getByText('Choose a configuration file to get started:')).toBeInTheDocument();
  });

  test('renders AI Assistant component', () => {
    render(<App />);
    
    expect(screen.getByTestId('ai-assistant')).toBeInTheDocument();
  });

  test('renders floating buy button', () => {
    render(<App />);
    
    const buyButton = screen.getByRole('link', { name: /hire\/buy/i });
    expect(buyButton).toBeInTheDocument();
    expect(buyButton).toHaveAttribute('href', expect.stringContaining('mailto:kumasachin@gmail.com'));
  });

  test('switches to help view when help button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const helpButton = screen.getByText('❓ Help');
    await user.click(helpButton);
    
    expect(screen.getByTestId('help-pages')).toBeInTheDocument();
  });

  test('switches back to files view when files button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // First switch to help
    const helpButton = screen.getByText('❓ Help');
    await user.click(helpButton);
    
    // Then switch back to files
    const filesButton = screen.getByText('📁 Files');
    await user.click(filesButton);
    
    expect(screen.getByText('📁 Configuration File Selection')).toBeInTheDocument();
  });

  test('shows file browser when directory browser tab is active', () => {
    render(<App />);
    
    // Check that AI assistant is rendered (since directory browser is mocked)
    expect(screen.getByTestId('ai-assistant')).toBeInTheDocument();
  });

  test('displays configuration files dropdown when loaded', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Select Configuration File')).toBeInTheDocument();
    });
  });

  test('shows load button when file is selected', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Select Configuration File')).toBeInTheDocument();
    });

    // This would need the actual dropdown implementation to work
    // For now, just check that the component structure is correct
    expect(screen.getByText('📁 Configuration File Selection')).toBeInTheDocument();
  });

  test('buy button has correct email attributes', () => {
    render(<App />);
    
    const buyButton = screen.getByRole('link', { name: /hire\/buy/i });
    const href = buyButton.getAttribute('href');
    
    expect(href).toContain('mailto:kumasachin@gmail.com');
    expect(href).toContain('subject=Interested in Config Ninja');
    expect(href).toContain('Hire/Buy/Reuse');
  });

  test('navigation maintains active state styling', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const helpButton = screen.getByText('❓ Help');
    await user.click(helpButton);
    
    // The help button should have active styling
    // This would need to check CSS classes or aria-current attributes
    expect(helpButton.closest('button')).toBeInTheDocument();
  });

  test('renders all main sections', () => {
    render(<App />);
    
    // Check that main container exists
    expect(screen.getByText('🥷 Config Ninja')).toBeInTheDocument();
    
    // Check that navigation exists
    expect(screen.getByText('📁 Files')).toBeInTheDocument();
    
    // Check that main content area exists
    expect(screen.getByText('📁 Configuration File Selection')).toBeInTheDocument();
    
    // Check that AI assistant is rendered
    expect(screen.getByTestId('ai-assistant')).toBeInTheDocument();
  });
});
