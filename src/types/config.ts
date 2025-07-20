export interface TenantConfig {
  features: {
    enabledModules: string[];
    betaFeatures: string[];
    roles: string[];
    enableAdvancedReporting: boolean;
    useAIInsights: boolean;
  };
  api: {
    baseUrl: string;
    authUrl?: string;
    timeout?: number;
    retryAttempts?: number;
  };
  auth: {
    clientId: string;
    scopes: string[];
    tokenLifetime?: number;
  };
  branding: {
    favicon?: string;
    title: string;
    logo?: string;
    theme?: {
      primaryColor?: string;
      secondaryColor?: string;
    };
  };
  tenants: Array<{
    tenantId: string;
    tenantName: string;
    tenantImage?: string;
    customer: string;
    environment: string;
    theme?: {
      primaryColor?: string;
      secondaryColor?: string;
      fontFamily?: string;
    };
    features?: {
      enabledModules?: string[];
      customSettings?: Record<string, any>;
    };
  }>;
}

export interface ConfigFile {
  value: string;
  label: string;
  path: string;
}
