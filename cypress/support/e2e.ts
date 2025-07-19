// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
// ***********************************************************

import "./commands";

// Cypress global configuration
Cypress.on("uncaught:exception", (err, runnable) => {
  // Prevent Cypress from failing the test on uncaught exceptions
  // that are not related to our test scenarios
  return false;
});
