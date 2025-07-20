import React from 'react';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  label, 
  checked, 
  onChange, 
  description 
}) => (
  <div className="toggle-group">
    <div className="toggle-header">
      <label className="toggle-label">{label}</label>
      <div
        className={`toggle-switch ${checked ? "checked" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <div className="toggle-slider"></div>
      </div>
    </div>
    {description && <p className="field-description">{description}</p>}
  </div>
);

export default ToggleSwitch;
