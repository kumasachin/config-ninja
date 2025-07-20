import React, { useState } from 'react';

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  description?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ 
  label, 
  options, 
  selected, 
  onChange, 
  description 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  return (
    <div className="form-group">
      <label className="field-label">{label}</label>
      {description && <p className="field-description">{description}</p>}
      <div className="multi-select">
        <div className="multi-select-header" onClick={() => setIsOpen(!isOpen)}>
          <span>
            {selected.length > 0
              ? `${selected.length} selected`
              : "Select options"}
          </span>
          <span className={`arrow ${isOpen ? "open" : ""}`}>▼</span>
        </div>
        {isOpen && (
          <div className="multi-select-dropdown">
            {options.map((option) => (
              <label key={option} className="multi-select-option">
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      {selected.length > 0 && (
        <div className="selected-items">
          {selected.map((item) => (
            <span key={item} className="selected-tag">
              {item}
              <button type="button" onClick={() => toggleOption(item)}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
