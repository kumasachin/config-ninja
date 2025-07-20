import React from 'react';
import { TenantConfig } from '../../types/config';
import { MultiSelect, ToggleSwitch } from '../FormInputs';
import { moduleOptions, betaFeatureOptions, roleOptions } from '../../constants';

interface FeaturesSectionProps {
  config: TenantConfig;
  updateConfig: (path: string, value: any) => void;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  config,
  updateConfig,
}) => {
  return (
    <div className="form-section">
      <h3>🚀 Features & Capabilities</h3>

      <MultiSelect
        label="Enabled Modules"
        description="Core platform modules available to tenants"
        options={moduleOptions}
        selected={config.features.enabledModules}
        onChange={(selected) => updateConfig("features.enabledModules", selected)}
      />

      <MultiSelect
        label="Beta Features"
        description="Experimental features for early access"
        options={betaFeatureOptions}
        selected={config.features.betaFeatures}
        onChange={(selected) => updateConfig("features.betaFeatures", selected)}
      />

      <MultiSelect
        label="User Roles"
        description="Available user roles in the system"
        options={roleOptions}
        selected={config.features.roles}
        onChange={(selected) => updateConfig("features.roles", selected)}
      />

      <ToggleSwitch
        label="Advanced Reporting"
        description="Enable advanced reporting and analytics features"
        checked={config.features.enableAdvancedReporting}
        onChange={(checked) =>
          updateConfig("features.enableAdvancedReporting", checked)
        }
      />

      <ToggleSwitch
        label="AI Insights"
        description="Enable AI-powered insights and recommendations"
        checked={config.features.useAIInsights}
        onChange={(checked) => updateConfig("features.useAIInsights", checked)}
      />
    </div>
  );
};

export default FeaturesSection;
