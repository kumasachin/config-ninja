import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import {
  isGitRepository,
  getGitStatus,
  gitCommit,
  gitPush,
  GitStatus,
  GitCommitOptions,
  GitPushOptions
} from '../utils/gitUtils';

interface GitCommitDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (commitHash: string) => void;
  savedFiles?: string[];
}

const GitCommitDialog: React.FC<GitCommitDialogProps> = ({
  open,
  onClose,
  onSuccess,
  savedFiles = []
}) => {
  const [commitMessage, setCommitMessage] = useState('');
  const [shouldPush, setShouldPush] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [error, setError] = useState<string>('');
  const [isGitRepo, setIsGitRepo] = useState(false);
  const [step, setStep] = useState<'commit' | 'push' | 'complete'>('commit');

  // Check Git repository status when dialog opens
  useEffect(() => {
    if (open) {
      checkGitStatus();
    }
  }, [open]);

  const checkGitStatus = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const isRepo = await isGitRepository();
      setIsGitRepo(isRepo);
      
      if (isRepo) {
        const status = await getGitStatus();
        setGitStatus(status);
        
        // Generate default commit message based on saved files
        if (savedFiles.length > 0) {
          const filesList = savedFiles.join(', ');
          setCommitMessage(`Update configuration files: ${filesList}`);
        } else {
          setCommitMessage('Update configuration');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check Git status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      setError('Commit message is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const commitOptions: GitCommitOptions = {
        message: commitMessage.trim(),
        files: savedFiles.length > 0 ? savedFiles : ['.'],
        addAll: true
      };

      const commitHash = await gitCommit(commitOptions);
      
      if (shouldPush) {
        setStep('push');
        await handlePush();
      } else {
        setStep('complete');
        onSuccess?.(commitHash);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to commit changes');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePush = async () => {
    setIsLoading(true);
    setError('');

    try {
      const pushOptions: GitPushOptions = {
        remote: 'origin',
        branch: gitStatus?.branch || 'main'
      };

      await gitPush(pushOptions);
      setStep('complete');
      onSuccess?.(Math.random().toString(36).substring(2, 9));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to push changes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCommitMessage('');
    setShouldPush(false);
    setError('');
    setStep('commit');
    onClose();
  };

  const renderContent = () => {
    if (!isGitRepo) {
      return (
        <Alert severity="warning" sx={{ mb: 2 }}>
          This directory is not a Git repository. Git operations are not available.
        </Alert>
      );
    }

    if (step === 'complete') {
      return (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="h6" color="success.main" gutterBottom>
            ✅ {shouldPush ? 'Committed and Pushed' : 'Committed'} Successfully!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your configuration changes have been {shouldPush ? 'committed and pushed to the remote repository' : 'committed to the local repository'}.
          </Typography>
        </Box>
      );
    }

    return (
      <>
        {gitStatus && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Repository Status
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={`Branch: ${gitStatus.branch}`} 
                size="small" 
                color="primary" 
              />
              {gitStatus.unstaged.length > 0 && (
                <Chip 
                  label={`${gitStatus.unstaged.length} unstaged`} 
                  size="small" 
                  color="warning" 
                />
              )}
              {gitStatus.staged.length > 0 && (
                <Chip 
                  label={`${gitStatus.staged.length} staged`} 
                  size="small" 
                  color="success" 
                />
              )}
            </Box>
            
            {savedFiles.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Files to commit:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {savedFiles.map((file, index) => (
                    <Chip 
                      key={index}
                      label={file} 
                      size="small" 
                      variant="outlined" 
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
          </Box>
        )}

        <TextField
          fullWidth
          label="Commit Message"
          multiline
          rows={3}
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Describe your changes..."
          disabled={isLoading}
          sx={{ mb: 2 }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={shouldPush}
              onChange={(e) => setShouldPush(e.target.checked)}
              disabled={isLoading}
            />
          }
          label={
            <Box>
              <Typography variant="body2">
                Also push to remote repository
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This will make your changes available to other team members
              </Typography>
            </Box>
          }
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {step === 'push' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2">
                Pushing changes to remote repository...
              </Typography>
            </Box>
          </Alert>
        )}
      </>
    );
  };

  const renderActions = () => {
    if (!isGitRepo) {
      return (
        <Button onClick={handleClose}>
          Close
        </Button>
      );
    }

    if (step === 'complete') {
      return (
        <Button onClick={handleClose} variant="contained">
          Done
        </Button>
      );
    }

    return (
      <>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleCommit}
          variant="contained"
          disabled={isLoading || !commitMessage.trim()}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          {isLoading 
            ? (step === 'push' ? 'Pushing...' : 'Committing...') 
            : (shouldPush ? 'Commit & Push' : 'Commit')
          }
        </Button>
      </>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={isLoading ? undefined : handleClose}
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>
        {step === 'complete' ? 'Git Operation Complete' : 'Commit Changes'}
      </DialogTitle>
      
      <DialogContent>
        {isLoading && step === 'commit' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 3 }}>
            <CircularProgress size={24} />
            <Typography>Checking Git repository status...</Typography>
          </Box>
        ) : (
          renderContent()
        )}
      </DialogContent>

      <DialogActions>
        {renderActions()}
      </DialogActions>
    </Dialog>
  );
};

export default GitCommitDialog;
