import React from 'react';

interface TenantConfig {
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
      betaFeatures?: string[];
      customRoles?: string[];
    };
  }>;
}

interface ConfigComparisonProps {
  originalConfig: TenantConfig;
  currentConfig: TenantConfig;
}

interface ComparisonItem {
  path: string;
  label: string;
  original: any;
  current: any;
  isChanged: boolean;
  type: 'primitive' | 'array' | 'object';
}

const ConfigComparison: React.FC<ConfigComparisonProps> = ({
  originalConfig,
  currentConfig
}) => {
  const getComparisonItems = (): ComparisonItem[] => {
    const items: ComparisonItem[] = [];
    
    // Helper function to compare values deeply
    const compareValues = (original: any, current: any, path: string, label: string) => {
      let isChanged = false;
      let type: 'primitive' | 'array' | 'object' = 'primitive';
      
      if (Array.isArray(original) && Array.isArray(current)) {
        type = 'array';
        isChanged = JSON.stringify(original.sort()) !== JSON.stringify(current.sort());
      } else if (typeof original === 'object' && typeof current === 'object' && original !== null && current !== null) {
        type = 'object';
        isChanged = JSON.stringify(original) !== JSON.stringify(current);
      } else {
        isChanged = original !== current;
      }
      
      items.push({
        path,
        label,
        original,
        current,
        isChanged,
        type
      });
    };

    // Compare features
    compareValues(originalConfig.features.enabledModules, currentConfig.features.enabledModules, 'features.enabledModules', 'Enabled Modules');
    compareValues(originalConfig.features.betaFeatures, currentConfig.features.betaFeatures, 'features.betaFeatures', 'Beta Features');
    compareValues(originalConfig.features.roles, currentConfig.features.roles, 'features.roles', 'Roles');
    compareValues(originalConfig.features.enableAdvancedReporting, currentConfig.features.enableAdvancedReporting, 'features.enableAdvancedReporting', 'Advanced Reporting');
    compareValues(originalConfig.features.useAIInsights, currentConfig.features.useAIInsights, 'features.useAIInsights', 'AI Insights');

    // Compare API settings
    compareValues(originalConfig.api.baseUrl, currentConfig.api.baseUrl, 'api.baseUrl', 'API Base URL');
    compareValues(originalConfig.api.authUrl, currentConfig.api.authUrl, 'api.authUrl', 'Auth URL');
    compareValues(originalConfig.api.timeout, currentConfig.api.timeout, 'api.timeout', 'Timeout');
    compareValues(originalConfig.api.retryAttempts, currentConfig.api.retryAttempts, 'api.retryAttempts', 'Retry Attempts');

    // Compare auth settings
    compareValues(originalConfig.auth.clientId, currentConfig.auth.clientId, 'auth.clientId', 'Client ID');
    compareValues(originalConfig.auth.scopes, currentConfig.auth.scopes, 'auth.scopes', 'Scopes');
    compareValues(originalConfig.auth.tokenLifetime, currentConfig.auth.tokenLifetime, 'auth.tokenLifetime', 'Token Lifetime');

    // Compare branding
    compareValues(originalConfig.branding.title, currentConfig.branding.title, 'branding.title', 'App Title');
    compareValues(originalConfig.branding.favicon, currentConfig.branding.favicon, 'branding.favicon', 'Favicon');
    compareValues(originalConfig.branding.logo, currentConfig.branding.logo, 'branding.logo', 'Logo');
    compareValues(originalConfig.branding.theme?.primaryColor, currentConfig.branding.theme?.primaryColor, 'branding.theme.primaryColor', 'Primary Color');
    compareValues(originalConfig.branding.theme?.secondaryColor, currentConfig.branding.theme?.secondaryColor, 'branding.theme.secondaryColor', 'Secondary Color');

    // Compare tenants
    compareValues(originalConfig.tenants.length, currentConfig.tenants.length, 'tenants.length', 'Number of Tenants');
    
    return items;
  };

  const formatValue = (value: any, type: 'primitive' | 'array' | 'object'): string => {
    if (value === undefined || value === null) {
      return 'Not set';
    }
    
    if (type === 'array') {
      return Array.isArray(value) ? value.join(', ') : String(value);
    }
    
    if (type === 'object') {
      return JSON.stringify(value, null, 2);
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Enabled' : 'Disabled';
    }
    
    return String(value);
  };

  const comparisonItems = getComparisonItems();
  const changedItems = comparisonItems.filter(item => item.isChanged);
  const unchangedItems = comparisonItems.filter(item => !item.isChanged);

  return (
    <div className="config-comparison">
      <div className="comparison-header">
        <h3>📊 Configuration Changes</h3>
        <div className="comparison-stats">
          <span className="changed-count">{changedItems.length} changed</span>
          <span className="unchanged-count">{unchangedItems.length} unchanged</span>
        </div>
      </div>

      <div className="comparison-content">
        {changedItems.length > 0 && (
          <div className="comparison-section">
            <h4 className="section-title changed-section">🔄 Modified Fields</h4>
            <div className="comparison-items">
              {changedItems.map((item, index) => (
                <div key={index} className="comparison-item changed">
                  <div className="field-label">{item.label}</div>
                  <div className="field-comparison">
                    <div className="original-value">
                      <span className="value-label">Original:</span>
                      <div className="value-content">
                        {formatValue(item.original, item.type)}
                      </div>
                    </div>
                    <div className="current-value">
                      <span className="value-label">Current:</span>
                      <div className="value-content">
                        {formatValue(item.current, item.type)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {changedItems.length === 0 && (
          <div className="no-changes">
            <div className="no-changes-icon">✅</div>
            <div className="no-changes-text">
              <h4>No Changes Detected</h4>
              <p>The current configuration matches the original configuration.</p>
            </div>
          </div>
        )}

        <div className="comparison-section">
          <details className="unchanged-section">
            <summary className="section-title">
              ✅ Unchanged Fields ({unchangedItems.length})
            </summary>
            <div className="comparison-items">
              {unchangedItems.slice(0, 10).map((item, index) => (
                <div key={index} className="comparison-item unchanged">
                  <div className="field-label">{item.label}</div>
                  <div className="field-value">
                    {formatValue(item.current, item.type)}
                  </div>
                </div>
              ))}
              {unchangedItems.length > 10 && (
                <div className="more-items">
                  ... and {unchangedItems.length - 10} more unchanged fields
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ConfigComparison;
