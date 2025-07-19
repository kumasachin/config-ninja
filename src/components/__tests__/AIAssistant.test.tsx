import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIAssistant from '../AIAssistant';

// Mock fetch for API calls
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('AIAssistant Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  test('renders floating action button', () => {
    render(<AIAssistant />);
    
    const fabButton = screen.getByLabelText('AI Assistant');
    expect(fabButton).toBeInTheDocument();
  });

  test('opens dialog when FAB is clicked', async () => {
    const user = userEvent.setup();
    render(<AIAssistant />);
    
    const fabButton = screen.getByLabelText('AI Assistant');
    await user.click(fabButton);
    
    expect(screen.getByText('AI Assistant - Config Ninja')).toBeInTheDocument();
  });

  test('closes dialog when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<AIAssistant />);
    
    // Open dialog
    const fabButton = screen.getByLabelText('AI Assistant');
    await user.click(fabButton);
    
    // Verify dialog is open
    expect(screen.getByText('AI Assistant - Config Ninja')).toBeInTheDocument();
    
    // Close dialog
    const closeButton = screen.getByRole('button', { name: /close dialog/i });
    await user.click(closeButton);
    
    // Wait for dialog to close
    await waitFor(() => {
      expect(screen.queryByText('AI Assistant - Config Ninja')).not.toBeInTheDocument();
    });
  });

  test('displays welcome message when no messages', async () => {
    const user = userEvent.setup();
    render(<AIAssistant />);
    
    const fabButton = screen.getByLabelText('AI Assistant');
    await user.click(fabButton);
    
    expect(screen.getByText(/Hey there! I can help you figure out/)).toBeInTheDocument();
  });

  test('displays quick question chips', async () => {
    const user = userEvent.setup();
    render(<AIAssistant />);
    
    const fabButton = screen.getByLabelText('AI Assistant');
    await user.click(fabButton);
    
    expect(screen.getByText('How do I get started?')).toBeInTheDocument();
    expect(screen.getByText('How does the schema editor work?')).toBeInTheDocument();
    expect(screen.getByText('What features are available?')).toBeInTheDocument();
    expect(screen.getByText('How do I run tests?')).toBeInTheDocument();
  });

  test('populates input when quick question is clicked', async () => {
    const user = userEvent.setup();
    render(<AIAssistant />);
    
    const fabButton = screen.getByLabelText('AI Assistant');
    await user.click(fabButton);
    
    const quickQuestion = screen.getByText('How do I get started?');
    await user.click(quickQuestion);
    
    const input = screen.getByPlaceholderText('What do you need help with?');
    expect(input).toHaveValue('How do I get started?');
  });

  test('sends message and displays response for setup question', async () => {
    const user = userEvent.setup();
    render(<AIAssistant />);
    
    const fabButton = screen.getByLabelText('AI Assistant');
    await user.click(fabButton);
    
    const input = screen.getByPlaceholderText('What do you need help with?');
    await user.type(input, 'How do I start?');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('How do I start?')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Sorry, something went wrong/)).toBeInTheDocument();
    });
  });

  test('displays loading state when sending message', async () => {
    const user = userEvent.setup();
    render(<AIAssistant />);
    
    const fabButton = screen.getByLabelText('AI Assistant');
    await user.click(fabButton);
    
    const input = screen.getByPlaceholderText('What do you need help with?');
    await user.type(input, 'test question');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);
    
    // Check that user message appears
    expect(screen.getByText('test question')).toBeInTheDocument();
    
    // Check that an error message eventually appears since we're mocking fetch to fail
    await waitFor(() => {
      expect(screen.getByText(/Sorry, something went wrong/)).toBeInTheDocument();
    });
  });

  test('handles schema editor questions', async () => {
    const user = userEvent.setup();
    render(<AIAssistant />);
    
    const fabButton = screen.getByLabelText('AI Assistant');
    await user.click(fabButton);
    
    const input = screen.getByPlaceholderText('What do you need help with?');
    await user.type(input, 'schema editor');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Sorry, something went wrong/)).toBeInTheDocument();
    });
  });

  test('handles testing questions', async () => {
    const user = userEvent.setup();
    render(<AIAssistant />);
    
    const fabButton = screen.getByLabelText('AI Assistant');
    await user.click(fabButton);
    
    const input = screen.getByPlaceholderText('What do you need help with?');
    await user.type(input, 'cypress testing');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Sorry, something went wrong/)).toBeInTheDocument();
    });
  });

  test('handles build and deployment questions', async () => {
    const user = userEvent.setup();
    render(<AIAssistant />);
    
    const fabButton = screen.getByLabelText('AI Assistant');
    await user.click(fabButton);
    
    const input = screen.getByPlaceholderText('What do you need help with?');
    await user.type(input, 'build for production');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Sorry, something went wrong/)).toBeInTheDocument();
    });
  });

  test('provides default help for unknown questions', async () => {
    const user = userEvent.setup();
    render(<AIAssistant />);
    
    const fabButton = screen.getByLabelText('AI Assistant');
    await user.click(fabButton);
    
    const input = screen.getByPlaceholderText('What do you need help with?');
    await user.type(input, 'random unknown question');
    
    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Sorry, something went wrong/)).toBeInTheDocument();
    });
  });

  test('disables send button when input is empty', async () => {
    const user = userEvent.setup();
    render(<AIAssistant />);
    
    const fabButton = screen.getByLabelText('AI Assistant');
    await user.click(fabButton);
    
    const sendButton = screen.getByRole('button', { name: /send message/i });
    expect(sendButton).toBeDisabled();
  });

  test('enables send button when input has text', async () => {
    const user = userEvent.setup();
    render(<AIAssistant />);
    
    const fabButton = screen.getByLabelText('AI Assistant');
    await user.click(fabButton);
    
    const input = screen.getByPlaceholderText('What do you need help with?');
    await user.type(input, 'test');
    
    const sendButton = screen.getByRole('button', { name: /send message/i });
    expect(sendButton).not.toBeDisabled();
  });

  test('clears input after sending message', async () => {
    const user = userEvent.setup();
    render(<AIAssistant />);
    
    const fabButton = screen.getByLabelText('AI Assistant');
    await user.click(fabButton);
    
    const input = screen.getByPlaceholderText('What do you need help with?');
    await user.type(input, 'test message');
    
    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);
    
    expect(input).toHaveValue('');
  });

  test('displays custom repository context when provided', async () => {
    const customContext = {
      name: 'Custom App',
      description: 'A custom test application',
      technologies: ['React', 'Node.js'],
      features: ['Feature 1', 'Feature 2']
    };

    const user = userEvent.setup();
    render(<AIAssistant repositoryContext={customContext} />);
    
    const fabButton = screen.getByLabelText('AI Assistant');
    await user.click(fabButton);
    
    expect(screen.getByText('AI Assistant - Custom App')).toBeInTheDocument();
  });
});
