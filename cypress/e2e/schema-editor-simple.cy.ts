describe('Schema Editor - Core Functionality Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the main application', () => {
    cy.visit('/')
    cy.get('h1').should('contain', 'Config Ninja')
    cy.get('button').should('contain', 'Change Schema')
  })

  it('should open and close schema editor', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Close schema editor
    cy.get('[aria-label="close"]').click()
    cy.get('[role="dialog"]').should('not.exist')
  })

  it('should load existing schema from file', () => {
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Wait for schema to load and check for existing fields
    cy.get('input[value="features"]', { timeout: 10000 }).should('exist')
    cy.get('button').contains('Add Field').should('be.visible')
  })

  it('should add a basic string field', () => {
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Wait for existing schema to load
    cy.get('button').contains('Add Field', { timeout: 10000 }).should('be.visible')
    
    // Add new field
    cy.get('button').contains('Add Field').click()
    
    // Configure the field (using a more robust selector)
    cy.get('.MuiPaper-root').last().within(() => {
      // Set field name
      cy.get('input[placeholder="field_name"]').clear().type('testField')
      
      // Set field type
      cy.get('[role="combobox"]').click()
    })
    
    // Select String type from dropdown
    cy.get('[role="option"]').contains('String').click()
    
    // Verify field was added
    cy.get('input[value="testField"]').should('exist')
  })

  it('should add an array field with options', () => {
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    cy.get('button').contains('Add Field', { timeout: 10000 }).click()
    
    cy.get('.MuiPaper-root').last().within(() => {
      cy.get('input[placeholder="field_name"]').clear().type('testArray')
      cy.get('[role="combobox"]').click()
    })
    
    cy.get('[role="option"]').contains('Array').click()
    
    // Should see array configuration
    cy.contains('Array Configuration').should('be.visible')
  })

  it('should add an object field and nested properties', () => {
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    cy.get('button').contains('Add Field', { timeout: 10000 }).click()
    
    cy.get('.MuiPaper-root').last().within(() => {
      cy.get('input[placeholder="field_name"]').clear().type('testObject')
      cy.get('[role="combobox"]').click()
    })
    
    cy.get('[role="option"]').contains('Object').click()
    
    // Should see option to add nested fields
    cy.get('button').contains('Add Nested Field').should('be.visible')
    
    // Add nested field
    cy.get('button').contains('Add Nested Field').click()
    
    cy.get('.MuiPaper-root').last().within(() => {
      cy.get('input[placeholder="field_name"]').clear().type('nestedField')
      cy.get('[role="combobox"]').click()
    })
    
    cy.get('[role="option"]').contains('String').click()
    
    // Verify nested structure
    cy.contains('📁 Nested Fields').should('be.visible')
  })

  it('should test Generate from Sample functionality', () => {
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Switch to Generate tab
    cy.get('[role="tab"]').contains('Generate from Sample').click()
    
    // Add sample JSON
    const sampleJson = JSON.stringify({
      name: "Test App",
      version: "1.0.0",
      enabled: true,
      features: ["auth", "logging"]
    }, null, 2)
    
    cy.get('textarea').clear().type(sampleJson, { parseSpecialCharSequences: false })
    
    // Generate schema
    cy.get('button').contains('Generate Schema').click()
    
    // Should switch back to Edit tab and show generated fields
    cy.get('[role="tab"][aria-selected="true"]').should('contain', 'Change Schema')
  })

  it('should handle invalid JSON in Generate tab', () => {
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    cy.get('[role="tab"]').contains('Generate from Sample').click()
    
    // Enter invalid JSON
    cy.get('textarea').clear().type('{ invalid json syntax')
    
    cy.get('button').contains('Generate Schema').click()
    
    // Should show error
    cy.get('.MuiAlert-message').should('be.visible')
  })

  it('should test save functionality', () => {
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Wait for schema to load
    cy.get('button').contains('Add Field', { timeout: 10000 }).should('be.visible')
    
    // Add a test field
    cy.get('button').contains('Add Field').click()
    
    cy.get('.MuiPaper-root').last().within(() => {
      cy.get('input[placeholder="field_name"]').clear().type('saveTestField')
      cy.get('[role="combobox"]').click()
    })
    
    cy.get('[role="option"]').contains('String').click()
    
    // Save schema
    cy.get('button').contains('Save Schema').click()
    
    // Wait for save operation (dialog should close on success)
    cy.get('[role="dialog"]', { timeout: 10000 }).should('not.exist')
  })

  it('should test field deletion', () => {
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    cy.get('button').contains('Add Field', { timeout: 10000 }).click()
    
    cy.get('.MuiPaper-root').last().within(() => {
      cy.get('input[placeholder="field_name"]').clear().type('deleteMe')
      cy.get('[role="combobox"]').click()
    })
    
    cy.get('[role="option"]').contains('String').click()
    
    // Verify field exists
    cy.get('input[value="deleteMe"]').should('exist')
    
    // Delete the field
    cy.get('input[value="deleteMe"]').closest('.MuiPaper-root').within(() => {
      cy.get('[aria-label="Remove field"]').click()
    })
    
    // Verify field is gone
    cy.get('input[value="deleteMe"]').should('not.exist')
  })

  it('should test deep nesting (3 levels)', () => {
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    cy.get('button').contains('Add Field', { timeout: 10000 }).click()
    
    // Level 1: Add object
    cy.get('.MuiPaper-root').last().within(() => {
      cy.get('input[placeholder="field_name"]').clear().type('level1')
      cy.get('[role="combobox"]').click()
    })
    cy.get('[role="option"]').contains('Object').click()
    
    // Level 2: Add nested object
    cy.get('button').contains('Add Nested Field').click()
    cy.get('.MuiPaper-root').last().within(() => {
      cy.get('input[placeholder="field_name"]').clear().type('level2')
      cy.get('[role="combobox"]').click()
    })
    cy.get('[role="option"]').contains('Object').click()
    
    // Level 3: Add deeply nested field
    cy.get('input[value="level2"]').closest('.MuiPaper-root').within(() => {
      cy.get('button').contains('Add Nested Field').click()
      cy.get('.MuiPaper-root').last().within(() => {
        cy.get('input[placeholder="field_name"]').clear().type('level3')
        cy.get('[role="combobox"]').click()
      })
    })
    cy.get('[role="option"]').contains('String').click()
    
    // Verify 3-level structure
    cy.get('input[value="level1"]').should('exist')
    cy.get('input[value="level2"]').should('exist')
    cy.get('input[value="level3"]').should('exist')
    cy.contains('Level 2').should('be.visible')
  })

  it('should test array with object structure', () => {
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    cy.get('button').contains('Add Field', { timeout: 10000 }).click()
    
    // Add array field
    cy.get('.MuiPaper-root').last().within(() => {
      cy.get('input[placeholder="field_name"]').clear().type('objectArray')
      cy.get('[role="combobox"]').click()
    })
    cy.get('[role="option"]').contains('Array').click()
    
    // Add object structure to array
    cy.get('button').contains('Add Array Item Field').click()
    cy.get('.MuiPaper-root').last().within(() => {
      cy.get('input[placeholder="field_name"]').clear().type('itemProperty')
      cy.get('[role="combobox"]').click()
    })
    cy.get('[role="option"]').contains('String').click()
    
    // Verify array with object structure
    cy.contains('🔢 Array Item Fields').should('be.visible')
    cy.get('input[value="itemProperty"]').should('exist')
  })
})
