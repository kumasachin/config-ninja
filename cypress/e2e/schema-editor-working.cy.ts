describe('Schema Editor - Comprehensive Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the main application', () => {
    cy.get('h1').should('contain', 'Config Ninja')
    cy.get('button').should('contain', 'Change Schema')
  })

  it('should open and close schema editor', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Close schema editor
    cy.get('button').contains('Cancel').click()
    cy.get('[role="dialog"]').should('not.exist')
  })

  it('should add a basic string field', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Add a new field
    cy.get('button').contains('Add Field').click()
    
    // Fill field details
    cy.get('input[placeholder="Field name"]').type('testField')
    cy.get('input[placeholder="Field description"]').type('A test string field')
    
    // Select string type (should be default)
    cy.get('div').contains('string').should('be.visible')
    
    // Save the field
    cy.get('button').contains('Add Field').click()
    
    // Verify field appears in the list
    cy.get('div').should('contain', 'testField')
  })

  it('should add an object field and nested properties', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Add object field
    cy.get('button').contains('Add Field').click()
    cy.get('input[placeholder="Field name"]').type('userProfile')
    
    // Select object type
    cy.get('div[role="button"]').contains('string').click()
    cy.get('li[data-value="object"]').click()
    
    // Add the object field
    cy.get('button').contains('Add Field').click()
    
    // Should show nested property section
    cy.get('h6').contains('Object Properties').scrollIntoView().should('be.visible')
    
    // Add nested property
    cy.get('button').contains('Add Property').click()
    cy.get('input[placeholder="Property name"]').last().type('name')
    cy.get('input[placeholder="Property description"]').last().type('User name')
    
    // Save nested property
    cy.get('button').contains('Add Property').last().click()
  })

  it('should add an array field with item structure', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Add array field
    cy.get('button').contains('Add Field').click()
    cy.get('input[placeholder="Field name"]').type('userList')
    
    // Select array type
    cy.get('div[role="button"]').contains('string').click()
    cy.get('li[data-value="array"]').click()
    
    // Add the array field
    cy.get('button').contains('Add Field').click()
    
    // Should show array item fields section
    cy.get('h6').contains('Array Item Fields').scrollIntoView().should('be.visible')
  })

  it('should test Generate from Sample functionality', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Switch to Generate tab
    cy.get('button[role="tab"]').contains('Generate from Sample').click()
    
    // Should see the generate tab content
    cy.get('h4').contains('Generate Schema from Sample Configuration').should('be.visible')
    
    // Enter sample JSON
    const sampleJSON = JSON.stringify({
      name: "John Doe",
      age: 30,
      settings: {
        theme: "dark",
        notifications: true
      }
    }, null, 2)
    
    cy.get('textarea').scrollIntoView().clear({ force: true }).type(sampleJSON, { force: true })
    
    // Generate schema
    cy.get('button').contains('Generate Schema').click()
    
    // Should switch back to edit tab and show generated fields
    cy.get('button[role="tab"]').contains('Edit Schema').click()
    cy.get('div').should('contain', 'name')
    cy.get('div').should('contain', 'age')
    cy.get('div').should('contain', 'settings')
  })

  it('should handle invalid JSON in Generate tab', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Switch to Generate tab
    cy.get('button[role="tab"]').contains('Generate from Sample').click()
    
    // Enter invalid JSON
    cy.get('textarea').scrollIntoView().clear({ force: true }).type('{ invalid json }', { force: true })
    
    // Try to generate schema
    cy.get('button').contains('Generate Schema').click()
    
    // Should show error
    cy.get('div[role="alert"]').should('contain', 'Invalid JSON')
  })

  it('should test save functionality', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Add a simple field first
    cy.get('button').contains('Add Field').click()
    cy.get('input[placeholder="Field name"]').type('saveTest')
    cy.get('button').contains('Add Field').click()
    
    // Try to save
    cy.get('button').contains('Save to Schema File').scrollIntoView().click()
    
    // Should close the dialog
    cy.get('[role="dialog"]').should('not.exist')
  })

  it('should test field deletion', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Add a field first
    cy.get('button').contains('Add Field').click()
    cy.get('input[placeholder="Field name"]').type('fieldToDelete')
    cy.get('button').contains('Add Field').click()
    
    // Verify field exists
    cy.get('div').should('contain', 'fieldToDelete')
    
    // Delete the field
    cy.get('button[aria-label="Delete field"]').click()
    
    // Verify field is removed
    cy.get('div').should('not.contain', 'fieldToDelete')
  })

  it('should test deep nesting (3 levels)', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Add level 1 object
    cy.get('button').contains('Add Field').click()
    cy.get('input[placeholder="Field name"]').type('level1')
    cy.get('div[role="button"]').contains('string').click()
    cy.get('li[data-value="object"]').click()
    cy.get('button').contains('Add Field').click()
    
    // Add level 2 object property
    cy.get('button').contains('Add Property').click()
    cy.get('input[placeholder="Property name"]').last().type('level2')
    cy.get('div[role="button"]').contains('string').last().click()
    cy.get('li[data-value="object"]').click()
    cy.get('button').contains('Add Property').last().click()
    
    // Should show level 2 object properties
    cy.get('h6').contains('Level 2').should('be.visible')
    
    // Add level 3 property
    cy.get('button').contains('Add Property').last().click()
    cy.get('input[placeholder="Property name"]').last().type('level3')
    cy.get('button').contains('Add Property').last().click()
    
    // Verify all levels are visible
    cy.get('input[value="level1"]').should('exist')
    cy.get('input[value="level2"]').should('exist')
    cy.get('input[value="level3"]').should('exist')
  })

  it('should test array with object structure', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Add array field
    cy.get('button').contains('Add Field').click()
    cy.get('input[placeholder="Field name"]').type('objectArray')
    cy.get('div[role="button"]').contains('string').click()
    cy.get('li[data-value="array"]').click()
    cy.get('button').contains('Add Field').click()
    
    // Should show array item fields
    cy.get('h6').contains('Array Item Fields').scrollIntoView().should('be.visible')
    
    // Add object structure to array items
    cy.get('button').contains('Add Field').last().click()
    cy.get('input[placeholder="Field name"]').last().type('itemObject')
    cy.get('div[role="button"]').contains('string').last().click()
    cy.get('li[data-value="object"]').click()
    cy.get('button').contains('Add Field').last().click()
    
    // Add properties to the array item object
    cy.get('button').contains('Add Property').last().click()
    cy.get('input[placeholder="Property name"]').last().type('itemProperty')
    cy.get('button').contains('Add Property').last().click()
    
    // Verify the structure
    cy.get('input[value="objectArray"]').should('exist')
    cy.get('input[value="itemObject"]').should('exist')
    cy.get('input[value="itemProperty"]').should('exist')
  })
})
