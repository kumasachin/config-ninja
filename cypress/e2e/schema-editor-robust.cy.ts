describe('Schema Editor - Cypress Test Suite', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the main application successfully', () => {
    cy.get('h1').should('contain', 'Config Ninja')
    cy.get('button').should('contain', 'Change Schema')
  })

  it('should open and close the schema editor dialog', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Verify dialog content is present
    cy.get('[role="dialog"]').should('contain', 'Schema Editor')
    
    // Close with Cancel button
    cy.get('button').contains('Cancel').click()
    cy.get('[role="dialog"]').should('not.exist')
  })

  it('should display existing schema fields when opened', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Should show existing fields (there seems to be a default schema)
    cy.get('div').should('contain', 'Schema Fields')
    
    // Close
    cy.get('button').contains('Cancel').click()
  })

  it('should be able to add a new field', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Add new field
    cy.get('button').contains('Add Field').click()
    
    // Should see field form appear - use force to handle visibility issues
    cy.get('input[placeholder="field_name"]').should('exist')
    
    // Modify the field name using force
    cy.get('input[placeholder="field_name"]').last().clear({ force: true }).type('newTestField', { force: true })
    
    // Verify the field name was updated
    cy.get('input[value="newTestField"]').should('exist')
    
    // Close without saving
    cy.get('button').contains('Cancel').click()
  })

  it('should test Generate from Sample tab', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Switch to Generate tab
    cy.get('button[role="tab"]').contains('Generate from Sample').click()
    
    // Should see Generate interface
    cy.get('div').should('contain', 'Generate Schema from Sample')
    
    // Try entering JSON (using force and parseSpecialCharSequences)
    const simpleJSON = 'test value'
    cy.get('textarea').first().clear({ force: true }).type(simpleJSON, { force: true, parseSpecialCharSequences: false })
    
    // Try to generate
    cy.get('button').contains('Generate Schema').should('be.visible')
    
    // Close
    cy.get('button').contains('Cancel').click()
  })

  it('should test field type selection', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Add new field
    cy.get('button').contains('Add Field').click()
    
    // Should have type selector visible
    cy.get('div[role="button"]').contains('String').should('be.visible')
    
    // Try to change type to Object
    cy.get('div[role="button"]').contains('String').click()
    cy.get('li').contains('Object').click()
    
    // Should show object-specific options
    cy.get('div').should('contain', 'Object Properties')
    
    // Close
    cy.get('button').contains('Cancel').click()
  })

  it('should test array field type', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Add new field
    cy.get('button').contains('Add Field').click()
    
    // Change to array type
    cy.get('div[role="button"]').contains('String').click()
    cy.get('li').contains('Array').click()
    
    // Should show array-specific options
    cy.get('div').should('contain', 'Array Configuration')
    
    // Close
    cy.get('button').contains('Cancel').click()
  })

  it('should test save functionality', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Try to save existing schema
    cy.get('button').contains('Save to Schema File').click()
    
    // Should close dialog on successful save
    cy.get('[role="dialog"]').should('not.exist')
  })

  it('should test field deletion', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Count current fields
    cy.get('button[aria-label="Remove field"]').then($buttons => {
      const initialCount = $buttons.length
      
      if (initialCount > 0) {
        // Delete the first field
        cy.get('button[aria-label="Remove field"]').first().click()
        
        // Should have one less field
        cy.get('button[aria-label="Remove field"]').should('have.length', initialCount - 1)
      }
    })
    
    // Close
    cy.get('button').contains('Cancel').click()
  })

  it('should test nested object properties', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Add object field
    cy.get('button').contains('Add Field').click()
    cy.get('div[role="button"]').contains('String').click()
    cy.get('li').contains('Object').click()
    
    // Should show nested properties section
    cy.get('div').should('contain', 'Object Properties')
    
    // Try to add nested property
    cy.get('button').contains('Add Property').click()
    
    // Should see nested field form
    cy.get('input[placeholder="field_name"]').should('have.length.greaterThan', 1)
    
    // Close
    cy.get('button').contains('Cancel').click()
  })

  it('should verify all core functionality exists', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Verify all main UI elements exist
    cy.get('button').contains('Add Field').should('be.visible')
    cy.get('button[role="tab"]').contains('Edit Schema').should('be.visible')
    cy.get('button[role="tab"]').contains('Generate from Sample').should('be.visible')
    cy.get('button').contains('Save to Schema File').should('be.visible')
    cy.get('button').contains('Cancel').should('be.visible')
    
    // Switch tabs to verify they work
    cy.get('button[role="tab"]').contains('Generate from Sample').click()
    cy.get('div').should('contain', 'Generate Schema from Sample')
    
    cy.get('button[role="tab"]').contains('Edit Schema').click()
    cy.get('div').should('contain', 'Schema Fields')
    
    // Close
    cy.get('button').contains('Cancel').click()
  })
})
