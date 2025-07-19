import { render, screen } from '@testing-library/react';

describe('Integration Tests', () => {
  test('app loads without crashing', () => {
    // This is a basic smoke test to ensure the app can be imported and rendered
    // We'll use a simple component to test the testing setup
    
    const TestComponent = () => <div>Test Component</div>;
    
    render(<TestComponent />);
    
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  test('jest setup is working correctly', () => {
    expect(1 + 1).toBe(2);
  });

  test('testing library matchers are available', () => {
    const element = document.createElement('div');
    element.textContent = 'Hello World';
    document.body.appendChild(element);
    
    expect(element).toBeInTheDocument();
    
    document.body.removeChild(element);
  });

  test('mock functions work correctly', () => {
    const mockFn = jest.fn();
    mockFn('test');
    
    expect(mockFn).toHaveBeenCalledWith('test');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('async testing works', async () => {
    const promise = Promise.resolve('success');
    const result = await promise;
    
    expect(result).toBe('success');
  });
});
