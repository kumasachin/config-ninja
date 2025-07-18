export interface FileSystemItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  isConfig?: boolean;
}

export interface ConfigFile {
  value: string;
  label: string;
  path: string;
  customer?: string;
  environment?: string;
}

// Function to scan a directory and find configuration files
export const scanDirectory = async (directoryPath: string): Promise<FileSystemItem[]> => {
  try {
    // In a real implementation, this would use Node.js fs or a file system API
    // For now, we'll simulate with the known structure, but make it dynamic
    const response = await fetch(`/api/scan-directory?path=${encodeURIComponent(directoryPath)}`);
    if (!response.ok) {
      throw new Error(`Failed to scan directory: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error scanning directory:', error);
    // Fallback to simulated structure for development
    return getSimulatedDirectoryStructure(directoryPath);
  }
};

// Function to get configuration files from a directory structure
export const getConfigurationFiles = async (basePath: string): Promise<ConfigFile[]> => {
  const configs: ConfigFile[] = [];
  
  try {
    const items = await scanDirectory(basePath);
    await processDirectoryItems(items, basePath, configs);
  } catch (error) {
    console.error('Error getting configuration files:', error);
    // Fallback to simulated structure
    return getSimulatedConfigFiles();
  }
  
  return configs;
};

// Recursive function to process directory items
const processDirectoryItems = async (
  items: FileSystemItem[], 
  currentPath: string, 
  configs: ConfigFile[]
): Promise<void> => {
  for (const item of items) {
    if (item.type === 'directory') {
      // Recursively scan subdirectories
      const subItems = await scanDirectory(item.path);
      await processDirectoryItems(subItems, item.path, configs);
    } else if (item.type === 'file' && item.isConfig) {
      // Process configuration files
      const configFile = createConfigFileEntry(item, currentPath);
      if (configFile) {
        configs.push(configFile);
      }
    }
  }
};

// Create a configuration file entry from a file system item
const createConfigFileEntry = (item: FileSystemItem, basePath: string): ConfigFile | null => {
  if (!item.name.endsWith('.json') && !item.name.endsWith('.config')) {
    return null;
  }

  // Parse path to extract customer and environment information
  const pathParts = item.path.replace(basePath, '').split('/').filter(part => part.length > 0);
  
  let customer = '';
  let environment = '';
  let label = item.name;

  if (pathParts.length >= 3 && pathParts[0] === 'customers') {
    customer = pathParts[1];
    environment = pathParts[2];
    label = `${formatCustomerName(customer)} - ${formatEnvironmentName(environment)}`;
  }

  return {
    value: item.path,
    label: `${getCustomerIcon(customer)} ${label}`,
    path: item.path,
    customer,
    environment
  };
};

// Helper functions for formatting
const formatCustomerName = (customer: string): string => {
  return customer
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatEnvironmentName = (environment: string): string => {
  return environment.charAt(0).toUpperCase() + environment.slice(1);
};

const getCustomerIcon = (customer: string): string => {
  const icons: Record<string, string> = {
    'nexus-bank': '🏦',
    'quantum-pay': '💰',
    'stellar-finance': '📈',
    'crypto-vault': '🔐',
    'bank-sacho': '🏛️',
  };
  return icons[customer] || '📄';
};

// Simulated directory structure for development/fallback
const getSimulatedDirectoryStructure = (path: string): FileSystemItem[] => {
  const structures: Record<string, FileSystemItem[]> = {
    '/Users/sachinkumar/Documents/config-ninja/src/config': [
      { name: 'customers', path: '/Users/sachinkumar/Documents/config-ninja/src/config/customers', type: 'directory' },
      { name: 'tenant-config.json', path: '/Users/sachinkumar/Documents/config-ninja/src/config/tenant-config.json', type: 'file', isConfig: true },
      { name: 'tenant-config.schema.json', path: '/Users/sachinkumar/Documents/config-ninja/src/config/tenant-config.schema.json', type: 'file' }
    ],
    '/Users/sachinkumar/Documents/config-ninja/src/config/customers': [
      { name: 'nexus-bank', path: '/Users/sachinkumar/Documents/config-ninja/src/config/customers/nexus-bank', type: 'directory' },
      { name: 'quantum-pay', path: '/Users/sachinkumar/Documents/config-ninja/src/config/customers/quantum-pay', type: 'directory' },
      { name: 'stellar-finance', path: '/Users/sachinkumar/Documents/config-ninja/src/config/customers/stellar-finance', type: 'directory' },
      { name: 'crypto-vault', path: '/Users/sachinkumar/Documents/config-ninja/src/config/customers/crypto-vault', type: 'directory' },
      { name: 'bank-sacho', path: '/Users/sachinkumar/Documents/config-ninja/src/config/customers/bank-sacho', type: 'directory' }
    ]
  };

  // Add customer subdirectories
  const customers = ['nexus-bank', 'quantum-pay', 'stellar-finance', 'crypto-vault', 'bank-sacho'];
  const environments = ['development', 'staging', 'production'];

  customers.forEach(customer => {
    const customerPath = `/Users/sachinkumar/Documents/config-ninja/src/config/customers/${customer}`;
    structures[customerPath] = environments.map(env => ({
      name: env,
      path: `${customerPath}/${env}`,
      type: 'directory'
    }));

    environments.forEach(env => {
      const envPath = `${customerPath}/${env}`;
      structures[envPath] = [
        {
          name: 'config.json',
          path: `${envPath}/config.json`,
          type: 'file',
          isConfig: true
        }
      ];
    });
  });

  return structures[path] || [];
};

// Simulated configuration files for fallback
const getSimulatedConfigFiles = (): ConfigFile[] => {
  return [
    { value: 'main-config', label: '📄 Main Configuration (tenant-config.json)', path: '/Users/sachinkumar/Documents/config-ninja/src/config/tenant-config.json' },
    { value: 'nexus-bank-development', label: '🏦 Nexus Bank - Development', path: '/Users/sachinkumar/Documents/config-ninja/src/config/customers/nexus-bank/development/config.json', customer: 'nexus-bank', environment: 'development' },
    { value: 'nexus-bank-staging', label: '🏦 Nexus Bank - Staging', path: '/Users/sachinkumar/Documents/config-ninja/src/config/customers/nexus-bank/staging/config.json', customer: 'nexus-bank', environment: 'staging' },
    { value: 'nexus-bank-production', label: '🏦 Nexus Bank - Production', path: '/Users/sachinkumar/Documents/config-ninja/src/config/customers/nexus-bank/production/config.json', customer: 'nexus-bank', environment: 'production' },
    { value: 'quantum-pay-development', label: '💰 Quantum Pay - Development', path: '/Users/sachinkumar/Documents/config-ninja/src/config/customers/quantum-pay/development/config.json', customer: 'quantum-pay', environment: 'development' },
    { value: 'quantum-pay-staging', label: '💰 Quantum Pay - Staging', path: '/Users/sachinkumar/Documents/config-ninja/src/config/customers/quantum-pay/staging/config.json', customer: 'quantum-pay', environment: 'staging' },
    { value: 'quantum-pay-production', label: '💰 Quantum Pay - Production', path: '/Users/sachinkumar/Documents/config-ninja/src/config/customers/quantum-pay/production/config.json', customer: 'quantum-pay', environment: 'production' },
    { value: 'stellar-finance-development', label: '📈 Stellar Finance - Development', path: '/Users/sachinkumar/Documents/config-ninja/src/config/customers/stellar-finance/development/config.json', customer: 'stellar-finance', environment: 'development' },
    { value: 'stellar-finance-production', label: '📈 Stellar Finance - Production', path: '/Users/sachinkumar/Documents/config-ninja/src/config/customers/stellar-finance/production/config.json', customer: 'stellar-finance', environment: 'production' },
    { value: 'crypto-vault-development', label: '🔐 Crypto Vault - Development', path: '/Users/sachinkumar/Documents/config-ninja/src/config/customers/crypto-vault/development/config.json', customer: 'crypto-vault', environment: 'development' },
    { value: 'crypto-vault-staging', label: '🔐 Crypto Vault - Staging', path: '/Users/sachinkumar/Documents/config-ninja/src/config/customers/crypto-vault/staging/config.json', customer: 'crypto-vault', environment: 'staging' },
    { value: 'crypto-vault-production', label: '🔐 Crypto Vault - Production', path: '/Users/sachinkumar/Documents/config-ninja/src/config/customers/crypto-vault/production/config.json', customer: 'crypto-vault', environment: 'production' }
  ];
};

// Function to read a configuration file
export const readConfigFile = async (filePath: string): Promise<any> => {
  try {
    const response = await fetch(`/api/read-file?path=${encodeURIComponent(filePath)}`);
    if (!response.ok) {
      throw new Error(`Failed to read file: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error reading config file:', error);
    throw error;
  }
};

// Function to validate if a path exists and is accessible
export const validatePath = async (path: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/validate-path?path=${encodeURIComponent(path)}`);
    return response.ok;
  } catch (error) {
    console.error('Error validating path:', error);
    return false;
  }
};
