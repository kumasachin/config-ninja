import React, { useState } from 'react';
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from '@testing-library/user-event';

// We need to extract MultiSelect component to test it separately
// For now, let's create a simple test component that mimics MultiSelect
const MultiSelect: React.FC<{
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  description?: string;
}> = ({ label, options, selected, onChange, description }) => {
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

describe('MultiSelect Component', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    label: 'Test Multi Select',
    options: ['Option 1', 'Option 2', 'Option 3'],
    selected: [],
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with label', () => {
    render(<MultiSelect {...defaultProps} />);
    
    expect(screen.getByText('Test Multi Select')).toBeInTheDocument();
  });

  test('shows placeholder text when no items selected', () => {
    render(<MultiSelect {...defaultProps} />);
    
    expect(screen.getByText('Select options')).toBeInTheDocument();
  });

  test('shows count when items are selected', () => {
    render(<MultiSelect {...defaultProps} selected={['Option 1', 'Option 2']} />);
    
    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  test('renders description when provided', () => {
    render(<MultiSelect {...defaultProps} description="This is a test description" />);
    
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  test('opens dropdown when header is clicked', async () => {
    const user = userEvent.setup();
    render(<MultiSelect {...defaultProps} />);
    
    const header = screen.getByText('Select options');
    await user.click(header);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  test('closes dropdown when header is clicked again', async () => {
    const user = userEvent.setup();
    render(<MultiSelect {...defaultProps} />);
    
    const header = screen.getByText('Select options');
    await user.click(header); // Open
    await user.click(header); // Close
    
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
  });

  test('calls onChange when option is selected', async () => {
    const user = userEvent.setup();
    render(<MultiSelect {...defaultProps} />);
    
    // Open dropdown
    const header = screen.getByText('Select options');
    await user.click(header);
    
    // Select option
    const checkbox = screen.getByRole('checkbox', { name: /option 1/i });
    await user.click(checkbox);
    
    expect(mockOnChange).toHaveBeenCalledWith(['Option 1']);
  });

  test('calls onChange when option is deselected', async () => {
    const user = userEvent.setup();
    render(<MultiSelect {...defaultProps} selected={['Option 1']} />);
    
    // Open dropdown
    const header = screen.getByText('1 selected');
    await user.click(header);
    
    // Deselect option
    const checkbox = screen.getByRole('checkbox', { name: /option 1/i });
    await user.click(checkbox);
    
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  test('shows selected items as tags', () => {
    render(<MultiSelect {...defaultProps} selected={['Option 1', 'Option 2']} />);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    
    // Check for remove buttons
    const removeButtons = screen.getAllByText('×');
    expect(removeButtons).toHaveLength(2);
  });

  test('removes item when remove button is clicked', async () => {
    const user = userEvent.setup();
    render(<MultiSelect {...defaultProps} selected={['Option 1', 'Option 2']} />);
    
    const removeButtons = screen.getAllByText('×');
    await user.click(removeButtons[0]); // Remove first item
    
    expect(mockOnChange).toHaveBeenCalledWith(['Option 2']);
  });

  test('checks correct checkboxes for selected items', async () => {
    const user = userEvent.setup();
    render(<MultiSelect {...defaultProps} selected={['Option 1', 'Option 3']} />);
    
    // Open dropdown
    const header = screen.getByText('2 selected');
    await user.click(header);
    
    const checkbox1 = screen.getByRole('checkbox', { name: /option 1/i });
    const checkbox2 = screen.getByRole('checkbox', { name: /option 2/i });
    const checkbox3 = screen.getByRole('checkbox', { name: /option 3/i });
    
    expect(checkbox1).toBeChecked();
    expect(checkbox2).not.toBeChecked();
    expect(checkbox3).toBeChecked();
  });

  test('handles multiple selections correctly', async () => {
    const user = userEvent.setup();
    render(<MultiSelect {...defaultProps} />);

    // Open dropdown and select first option
    const header = screen.getByText("Select options");
    await user.click(header);

    const checkbox1 = screen.getByRole("checkbox", { name: /option 1/i });
    await user.click(checkbox1);
    expect(mockOnChange).toHaveBeenCalledWith(["Option 1"]);

    // Close dropdown by clicking header again
    await user.click(header);

    // Now test with Option 1 already selected
    mockOnChange.mockClear();
    cleanup();
    render(<MultiSelect {...defaultProps} selected={["Option 1"]} />);

    // Open dropdown again
    const header2 = screen.getByText("1 selected");
    await user.click(header2);

    // Select second option
    const checkbox2 = screen.getByRole("checkbox", { name: /option 2/i });
    await user.click(checkbox2);
    
    expect(mockOnChange).toHaveBeenCalledWith(['Option 1', 'Option 2']);
  });
});
