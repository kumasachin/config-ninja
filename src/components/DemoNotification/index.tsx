import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

const DemoNotification: React.FC = () => {
  return (
    <Box sx={{ mx: 2, mt: 2, mb: 3 }}>
      <Alert
        severity="warning"
        sx={{
          backgroundColor: "#fff3cd",
          borderColor: "#ffeaa7",
          color: "#856404",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(255, 193, 7, 0.2)",
          border: "1px solid #ffeaa7",
          "& .MuiAlert-icon": {
            color: "#f39c12",
          },
        }}
      >
        <AlertTitle
          sx={{
            fontWeight: 600,
            color: "#856404",
            mb: 1,
            fontSize: "1.1rem",
          }}
        >
          ⚠️ Demo Version - Local Installation Required
        </AlertTitle>
        <Box sx={{ lineHeight: 1.6 }}>
          <strong>
            This is a demonstration of Config Ninja deployed online.
          </strong>
          <br />
          To use this application with full functionality including{" "}
          <em>file system access</em>,
          <em> configuration management</em>, and{" "}
          <em>Git integration</em>, please{" "}
          <strong>install it locally as a React application</strong>.
          <br />
          <Box
            sx={{
              fontSize: "0.9em",
              mt: 1,
              p: 1,
              backgroundColor: "rgba(255, 193, 7, 0.1)",
              borderRadius: 1,
              fontFamily: "monospace",
            }}
          >
            💻 <strong>Steps:</strong>{" "}
            <a
              href="https://github.com/kumasachin/config-ninja"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#856404",
                textDecoration: "none",
                fontWeight: "bold",
                borderBottom: "1px solid #856404",
              }}
            >
              Clone from GitHub
            </a>
            → npm install → npm start → Full features available
          </Box>
        </Box>
      </Alert>
    </Box>
  );
};

export default DemoNotification;
