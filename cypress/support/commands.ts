// cypress/support/commands.ts

// Simple helper functions instead of custom commands to avoid TypeScript issues

export const openSchemaEditor = () => {
  cy.visit("/");
  cy.get("button").contains("Edit Schema").should("be.visible").click();
  cy.get('[role="dialog"]').should("be.visible");
  cy.get('[role="tablist"]').should("be.visible");
};
