describe('Schema Editor - Working Tests', () => {
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
    cy.get('h4').should('contain', 'Schema Editor')
    
    // Close schema editor
    cy.get('button').contains('Cancel').click()
    cy.get('[role="dialog"]').should('not.exist')
  })

  it('should add and configure a basic string field', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Add a new field
    cy.get('button').contains('Add Field').click()
    
    // Should see the field editing form appear
    cy.get('input[placeholder="field_name"]').should('be.visible')
    cy.get('input[placeholder="field_name"]').clear().type('testStringField')
    
    // Check that string type is selected by default
    cy.get('div[role="button"]').contains('String').should('be.visible')
    
    // Add description
    cy.get('input[placeholder="Describe this field"]').type('A test string field')
    
    // Verify field is in the list
    cy.get('div').should('contain', 'testStringField')
  })

  it('should add an object field and manage nested properties', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Add a new field
    cy.get('button').contains('Add Field').click()
    
    // Configure as object field
    cy.get('input[placeholder="field_name"]').clear().type('userProfile')
    
    // Change type to object
    cy.get('div[role="button"]').contains('String').click()
    cy.get('li').contains('Object').click()
    
    // Add description
    cy.get('input[placeholder="Describe this field"]').type('User profile information')
    
    // Should show nested object structure
    cy.get('div').should('contain', 'Object Properties')
  })

  it('should test Generate from Sample functionality', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Switch to Generate tab
    cy.get('button[role="tab"]').contains('Generate from Sample').click()
    
    // Should see the generate interface
    cy.get('div').should('contain', 'Generate Schema from Sample Configuration')
    
    // Enter sample JSON
    const sampleJSON = '{"name": "John Doe", "age": 30}'
    
    cy.get('textarea').first().clear().type(sampleJSON)
    
    // Generate schema
    cy.get('button').contains('Generate Schema').click()
    
    // Should switch to edit tab and show generated fields
    cy.wait(1000) // Wait for generation to complete
    cy.get('button[role="tab"]').contains('Edit Schema').click()
    
    // Should have generated fields
    cy.get('div').should('contain', 'name')
    cy.get('div').should('contain', 'age')
  })

  it('should test save functionality', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Add a simple field first
    cy.get('button').contains('Add Field').click()
    cy.get('input[placeholder="field_name"]').clear().type('saveTestField')
    
    // Save the schema
    cy.get('button').contains('Save to Schema File').click()
    
    // Should close the dialog on successful save
    cy.get('[role="dialog"]').should('not.exist')
  })

  it('should test field deletion', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Add a field
    cy.get('button').contains('Add Field').click()
    cy.get('input[placeholder="field_name"]').clear().type('fieldToDelete')
    
    // Verify field exists
    cy.get('input[value="fieldToDelete"]').should('exist')
    
    // Delete the field using the delete icon
    cy.get('button[aria-label="Remove field"]').click()
    
    // Verify field is removed
    cy.get('input[value="fieldToDelete"]').should('not.exist')
  })

  it('should handle array fields', () => {
    // Open schema editor  
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Add array field
    cy.get('button').contains('Add Field').click()
    cy.get('input[placeholder="field_name"]').clear().type('userList')
    
    // Change type to array
    cy.get('div[role="button"]').contains('String').click()
    cy.get('li').contains('Array').click()
    
    // Should show array configuration options
    cy.get('div').should('contain', 'Array Configuration')
  })

  it('should support nested object properties', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Add object field
    cy.get('button').contains('Add Field').click()
    cy.get('input[placeholder="field_name"]').clear().type('config')
    
    // Change to object type
    cy.get('div[role="button"]').contains('String').click()
    cy.get('li').contains('Object').click()
    
    // Should see object properties section
    cy.get('div').should('contain', 'Object Properties')
    
    // Add a nested property
    cy.get('button').contains('Add Property').click()
    
    // Should see nested field form
    cy.get('input[placeholder="field_name"]').last().should('be.visible')
    cy.get('input[placeholder="field_name"]').last().clear().type('nestedProp')
  })

  it('should handle deep nesting levels', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Add first level object
    cy.get('button').contains('Add Field').click()
    cy.get('input[placeholder="field_name"]').clear().type('level1')
    cy.get('div[role="button"]').contains('String').click()
    cy.get('li').contains('Object').click()
    
    // Add level 2 property
    cy.get('button').contains('Add Property').click()
    cy.get('input[placeholder="field_name"]').last().clear().type('level2')
    cy.get('div[role="button"]').last().contains('String').click()
    cy.get('li').contains('Object').click()
    
    // Should show Level 2 indicator
    cy.get('div').should('contain', 'Level 2')
    
    // Add level 3 property
    cy.get('button').contains('Add Property').last().click()
    cy.get('input[placeholder="field_name"]').last().clear().type('level3')
    
    // Verify all levels exist
    cy.get('input[value="level1"]').should('exist')
    cy.get('input[value="level2"]').should('exist')  
    cy.get('input[value="level3"]').should('exist')
  })

  it('should support array with object structure', () => {
    // Open schema editor
    cy.get('button').contains('Change Schema').click()
    cy.get('[role="dialog"]').should('be.visible')
    
    // Add array field
    cy.get('button').contains('Add Field').click()
    cy.get('input[placeholder="field_name"]').clear().type('arrayOfObjects')
    cy.get('div[role="button"]').contains('String').click()
    cy.get('li').contains('Array').click()
    
    // Should show array configuration
    cy.get('div').should('contain', 'Array Configuration')
    
    // Add object structure to array items
    cy.get('div').should('contain', 'Array Item Fields')
    cy.get('button').contains('Add Field').last().click()
    
    // Configure the array item as object
    cy.get('input[placeholder="field_name"]').last().clear().type('arrayItem')
    cy.get('div[role="button"]').last().contains('String').click()
    cy.get('li').contains('Object').click()
    
    // Should show nested object properties for array items
    cy.get('div').should('contain', 'Object Properties')
  })
})
