describe('Schema Editor - Comprehensive Test Suite', () => {
  beforeEach(() => {
    // Ensure servers are running and visit the application
    cy.visit('/')
    cy.get('h1').should('contain', 'Config Ninja')
  })

  describe('Basic Functionality', () => {
    it('should open schema editor and load existing schema', () => {
      cy.get('button').contains('Edit Schema').should('be.visible').click()
      
      // Wait for dialog to open
      cy.get('[role="dialog"]').should('be.visible')
      cy.get('[role="tablist"]').should('be.visible')
      
      // Check that schema is loaded (should have some existing fields from tenant-config.schema.json)
      cy.get('button').contains('Add Field').should('be.visible')
      
      // Check for existing schema fields
      cy.get('input[value="features"]').should('exist')
      cy.get('input[value="api"]').should('exist')
    })

    it('should close schema editor', () => {
      cy.get('button').contains('Edit Schema').click()
      cy.get('[role="dialog"]').should('be.visible')
      
      // Close the dialog
      cy.get('[aria-label="close"]').click()
      cy.get('[role="dialog"]').should('not.exist')
    })
  })

  describe('Basic Field Types', () => {
    beforeEach(() => {
      cy.get('button').contains('Edit Schema').click()
      cy.get('[role="dialog"]').should('be.visible')
    })

    it('should add a string field', () => {
      cy.get('button').contains('Add Field').click()
      
      // Configure the new field
      cy.get('.MuiPaper-root').last().within(() => {
        cy.get('input').first().clear().type('testStringField')
        cy.get('[role="combobox"]').click()
      })
      
      cy.get('[role="option"]').contains('String').click()
      
      cy.get('.MuiPaper-root').last().within(() => {
        cy.get('input[type="checkbox"]').check() // Make it required
        cy.get('input').last().type('Test string field description')
      })
      
      // Verify field was added
      cy.get('input[value="testStringField"]').should('exist')
    })

    it('should add a number field', () => {
      cy.get('button').contains('Add Field').click()
      
      cy.get('.MuiPaper-root').last().within(() => {
        cy.get('input').first().clear().type('testNumberField')
        cy.get('[role="combobox"]').click()
      })
      
      cy.get('[role="option"]').contains('Number').click()
      
      cy.get('.MuiPaper-root').last().within(() => {
        cy.get('input').last().type('Test number field description')
      })
      
      cy.get('input[value="testNumberField"]').should('exist')
    })

    it('should add a boolean field', () => {
      cy.get('button').contains('Add Field').click()
      
      cy.get('.MuiPaper-root').last().within(() => {
        cy.get('input').first().clear().type('testBooleanField')
        cy.get('[role="combobox"]').click()
      })
      
      cy.get('[role="option"]').contains('Boolean').click()
      
      cy.get('.MuiPaper-root').last().within(() => {
        cy.get('input').last().type('Test boolean field description')
      })
      
      cy.get('input[value="testBooleanField"]').should('exist')
    })

    it('should delete a field', () => {
      // Add a field first
      cy.get('button').contains('Add Field').click()
      
      cy.get('.MuiPaper-root').last().within(() => {
        cy.get('input').first().clear().type('fieldToDelete')
        cy.get('[role="combobox"]').click()
      })
      
      cy.get('[role="option"]').contains('String').click()
      
      // Verify field exists
      cy.get('input[value="fieldToDelete"]').should('exist')
      
      // Delete the field
      cy.get('input[value="fieldToDelete"]').closest('.MuiPaper-root').within(() => {
        cy.get('[aria-label="Remove field"]').click()
      })
      
      // Verify field is gone
      cy.get('input[value="fieldToDelete"]').should('not.exist')
    })
  })

  describe('Simple Array Fields', () => {
    beforeEach(() => {
      cy.get('button').contains('Edit Schema').click()
      cy.get('[role="dialog"]').should('be.visible')
    })

    it('should add a simple array field with options', () => {
      cy.get('button').contains('Add Field').click()
      
      cy.get('.MuiPaper-root').last().within(() => {
        cy.get('input').first().clear().type('testArrayField')
        cy.get('[role="combobox"]').click()
      })
      
      cy.get('[role="option"]').contains('Array').click()
      
      cy.get('.MuiPaper-root').last().within(() => {
        // Should see array configuration
        cy.contains('Array Configuration').should('be.visible')
        
        // Add array options
        cy.get('input').contains('Simple Array Options').should('be.visible')
        cy.get('input[placeholder*="option1, option2, option3"]').type('red, blue, green, yellow')
        
        cy.get('input[placeholder="Describe this field"]').type('Test array with color options')
      })
      
      cy.get('input[value="testArrayField"]').should('exist')
    })
  })

  describe('Object Fields and Nesting', () => {
    beforeEach(() => {
      cy.get('button').contains('Edit Schema').click()
      cy.get('[role="dialog"]').should('be.visible')
    })

    it('should add an object field', () => {
      cy.get('button').contains('Add Field').click()
      
      cy.get('.MuiPaper-root').last().within(() => {
        cy.get('input').first().clear().type('testObjectField')
        cy.get('[role="combobox"]').click()
      })
      
      cy.get('[role="option"]').contains('Object').click()
      
      cy.get('.MuiPaper-root').last().within(() => {
        cy.get('input[placeholder="Describe this field"]').type('Test object field')
        
        // Should see option to add nested fields
        cy.get('button').contains('Add Nested Field').should('be.visible')
      })
      
      cy.get('input[value="testObjectField"]').should('exist')
    })

    it('should add nested fields to an object', () => {
      // Add object field first
      cy.get('button').contains('Add Field').click()
      
      cy.get('.MuiPaper-root').last().within(() => {
        cy.get('input').first().clear().type('userProfile')
        cy.get('[role="combobox"]').click()
      })
      
      cy.get('[role="option"]').contains('Object').click()
      
      // Add nested field
      cy.get('input[value="userProfile"]').closest('.MuiPaper-root').within(() => {
        cy.get('button').contains('Add Nested Field').click()
        
        // Configure nested field
        cy.get('.MuiPaper-root').last().within(() => {
          cy.get('input').first().clear().type('userName')
          cy.get('[role="combobox"]').click()
        })
      })
      
      cy.get('[role="option"]').contains('String').click()
      
      // Verify nested structure
      cy.get('input[value="userProfile"]').should('exist')
      cy.contains('📁 Nested Fields').should('be.visible')
    })

    it('should support 3-level deep nesting', () => {
      // Add level 1 object
      cy.get('button').contains('Add Field').click()
      cy.get('.MuiPaper-root').last().within(() => {
        cy.get('input').first().clear().type('level1')
        cy.get('[role="combobox"]').click()
      })
      cy.get('[role="option"]').contains('Object').click()
      
      // Add level 2 object
      cy.get('input[value="level1"]').closest('.MuiPaper-root').within(() => {
        cy.get('button').contains('Add Nested Field').click()
        cy.get('.MuiPaper-root').last().within(() => {
          cy.get('input').first().clear().type('level2')
          cy.get('[role="combobox"]').click()
        })
      })
      cy.get('[role="option"]').contains('Object').click()
      
      // Add level 3 field
      cy.get('input[value="level2"]').closest('.MuiPaper-root').within(() => {
        cy.get('button').contains('Add Nested Field').click()
        cy.get('.MuiPaper-root').last().within(() => {
          cy.get('input').first().clear().type('level3Field')
          cy.get('[role="combobox"]').click()
        })
      })
      cy.get('[role="option"]').contains('String').click()
      
      // Verify 3-level structure exists
      cy.get('input[value="level1"]').should('exist')
      cy.get('input[value="level2"]').should('exist')
      cy.get('input[value="level3Field"]').should('exist')
    })
  })

  describe('Array with Object Structure', () => {
    beforeEach(() => {
      cy.get('button').contains('Edit Schema').click()
      cy.get('[role="dialog"]').should('be.visible')
    })

    it('should add array field with object items', () => {
      cy.get('button').contains('Add Field').click()
      
      cy.get('.MuiPaper-root').last().within(() => {
        cy.get('input').first().clear().type('usersArray')
        cy.get('[role="combobox"]').click()
      })
      
      cy.get('[role="option"]').contains('Array').click()
      
      // Add object structure for array items
      cy.get('input[value="usersArray"]').closest('.MuiPaper-root').within(() => {
        cy.get('button').contains('Add Array Item Field').click()
        
        // Add first field to array object
        cy.get('.MuiPaper-root').last().within(() => {
          cy.get('input').first().clear().type('userName')
          cy.get('[role="combobox"]').click()
        })
      })
      
      cy.get('[role="option"]').contains('String').click()
      
      // Add second field to array object
      cy.get('input[value="usersArray"]').closest('.MuiPaper-root').within(() => {
        cy.get('button').contains('Add Array Item Field').click()
        
        cy.get('.MuiPaper-root').last().within(() => {
          cy.get('input').first().clear().type('userAge')
          cy.get('[role="combobox"]').click()
        })
      })
      
      cy.get('[role="option"]').contains('Number').click()
      
      // Verify array with object structure
      cy.get('input[value="usersArray"]').should('exist')
      cy.contains('🔢 Array Item Fields').should('be.visible')
      cy.get('input[value="userName"]').should('exist')
      cy.get('input[value="userAge"]').should('exist')
    })
  })

  describe('Generate from Sample Tab', () => {
    beforeEach(() => {
      cy.get('button').contains('Edit Schema').click()
      cy.get('[role="dialog"]').should('be.visible')
    })

    it('should generate schema from sample JSON', () => {
      // Switch to Generate tab
      cy.get('[role="tab"]').contains('Generate from Sample').click()
      
      // Paste sample JSON
      const sampleJson = JSON.stringify({
        appName: "Test App",
        version: "1.0.0",
        enabled: true,
        features: ["auth", "analytics"],
        database: {
          host: "localhost",
          port: 5432,
          ssl: true
        },
        users: [
          {
            name: "John",
            age: 30,
            active: true
          }
        ]
      }, null, 2)
      
      cy.get('textarea').clear().type(sampleJson, { parseSpecialCharSequences: false })
      
      // Generate schema
      cy.get('button').contains('Generate Schema').click()
      
      // Should switch back to Edit tab
      cy.get('[role="tab"][aria-selected="true"]').should('contain', 'Edit Schema')
      
      // Verify generated fields
      cy.get('input[value="appName"]').should('exist')
      cy.get('input[value="version"]').should('exist')
      cy.get('input[value="enabled"]').should('exist')
      cy.get('input[value="features"]').should('exist')
      cy.get('input[value="database"]').should('exist')
      cy.get('input[value="users"]').should('exist')
    })

    it('should handle invalid JSON gracefully', () => {
      cy.get('[role="tab"]').contains('Generate from Sample').click()
      
      // Enter invalid JSON
      cy.get('textarea').clear().type('{ invalid json }')
      
      // Try to generate
      cy.get('button').contains('Generate Schema').click()
      
      // Should show error
      cy.get('.MuiAlert-message').should('contain', 'Invalid JSON format')
    })
  })

  describe('Save Functionality', () => {
    beforeEach(() => {
      cy.get('button').contains('Edit Schema').click()
      cy.get('[role="dialog"]').should('be.visible')
    })

    it('should save schema successfully', () => {
      // Add a test field
      cy.get('button').contains('Add Field').click()
      
      cy.get('.MuiPaper-root').last().within(() => {
        cy.get('input').first().clear().type('testSaveField')
        cy.get('[role="combobox"]').click()
      })
      
      cy.get('[role="option"]').contains('String').click()
      
      // Save the schema
      cy.get('button').contains('Save Schema').click()
      
      // Wait for save operation
      cy.wait(3000)
      
      // Dialog should close after successful save
      cy.get('[role="dialog"]').should('not.exist')
    })
  })

  describe('Type Conversions', () => {
    beforeEach(() => {
      cy.get('button').contains('Edit Schema').click()
      cy.get('[role="dialog"]').should('be.visible')
    })

    it('should handle type conversions properly', () => {
      // Add an object field
      cy.get('button').contains('Add Field').click()
      
      cy.get('.MuiPaper-root').last().within(() => {
        cy.get('input').first().clear().type('convertibleField')
        cy.get('[role="combobox"]').click()
      })
      
      cy.get('[role="option"]').contains('Object').click()
      
      // Add nested field
      cy.get('input[value="convertibleField"]').closest('.MuiPaper-root').within(() => {
        cy.get('button').contains('Add Nested Field').click()
        
        cy.get('.MuiPaper-root').last().within(() => {
          cy.get('input').first().clear().type('nestedField')
          cy.get('[role="combobox"]').click()
        })
      })
      
      cy.get('[role="option"]').contains('String').click()
      
      // Convert to array - should preserve children
      cy.get('input[value="convertibleField"]').closest('.MuiPaper-root').within(() => {
        cy.get('[role="combobox"]').first().click()
      })
      
      cy.get('[role="option"]').contains('Array').click()
      
      // Should show array item fields instead of nested fields
      cy.contains('🔢 Array Item Fields').should('be.visible')
      cy.get('input[value="nestedField"]').should('exist')
    })
  })

  describe('Visual Hierarchy and UX', () => {
    beforeEach(() => {
      cy.get('button').contains('Edit Schema').click()
      cy.get('[role="dialog"]').should('be.visible')
    })

    it('should display proper visual hierarchy for nested fields', () => {
      // Add object with nested structure
      cy.get('button').contains('Add Field').click()
      
      cy.get('.MuiPaper-root').last().within(() => {
        cy.get('input').first().clear().type('visualTest')
        cy.get('[role="combobox"]').click()
      })
      
      cy.get('[role="option"]').contains('Object').click()
      
      // Add nested field
      cy.get('input[value="visualTest"]').closest('.MuiPaper-root').within(() => {
        cy.get('button').contains('Add Nested Field').click()
        
        cy.get('.MuiPaper-root').last().within(() => {
          cy.get('input').first().clear().type('nested')
          cy.get('[role="combobox"]').click()
        })
      })
      
      cy.get('[role="option"]').contains('Object').click()
      
      // Verify level indicators
      cy.contains('Level 1').should('be.visible')
      cy.contains('📁 Nested Fields').should('be.visible')
      
      // Add deeper nesting
      cy.get('input[value="nested"]').closest('.MuiPaper-root').within(() => {
        cy.get('button').contains('Add Nested Field').click()
        
        cy.get('.MuiPaper-root').last().within(() => {
          cy.get('input').first().clear().type('deepNested')
          cy.get('[role="combobox"]').click()
        })
      })
      
      cy.get('[role="option"]').contains('String').click()
      
      // Verify deeper level indicators
      cy.contains('Level 2').should('be.visible')
    })

    it('should show different icons for arrays vs objects', () => {
      // Add object field
      cy.get('button').contains('Add Field').click()
      
      cy.get('.MuiPaper-root').last().within(() => {
        cy.get('input').first().clear().type('objectField')
        cy.get('[role="combobox"]').click()
      })
      
      cy.get('[role="option"]').contains('Object').click()
      
      cy.get('input[value="objectField"]').closest('.MuiPaper-root').within(() => {
        cy.get('button').contains('Add Nested Field').click()
        
        cy.get('.MuiPaper-root').last().within(() => {
          cy.get('input').first().clear().type('nested')
          cy.get('[role="combobox"]').click()
        })
      })
      
      cy.get('[role="option"]').contains('String').click()
      
      // Should show folder icon for object
      cy.contains('📁 Nested Fields').should('be.visible')
      
      // Add array field
      cy.get('button').contains('Add Field').click()
      
      cy.get('.MuiPaper-root').last().within(() => {
        cy.get('input').first().clear().type('arrayField')
        cy.get('[role="combobox"]').click()
      })
      
      cy.get('[role="option"]').contains('Array').click()
      
      cy.get('input[value="arrayField"]').closest('.MuiPaper-root').within(() => {
        cy.get('button').contains('Add Array Item Field').click()
        
        cy.get('.MuiPaper-root').last().within(() => {
          cy.get('input').first().clear().type('item')
          cy.get('[role="combobox"]').click()
        })
      })
      
      cy.get('[role="option"]').contains('String').click()
      
      // Should show array icon for array
      cy.contains('🔢 Array Item Fields').should('be.visible')
    })
  })
})
