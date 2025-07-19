// Test scenarios for Schema Editor
// This file documents all test scenarios to verify

const testScenarios = {
  // 1. Basic Field Types
  basicFields: [
    { type: 'string', description: 'Simple text field' },
    { type: 'number', description: 'Numeric field' },
    { type: 'boolean', description: 'True/false field' },
  ],

  // 2. Simple Arrays
  simpleArrays: [
    { 
      type: 'array', 
      options: ['option1', 'option2', 'option3'],
      description: 'String array with enum values'
    }
  ],

  // 3. Object Fields with Nested Properties
  nestedObjects: [
    {
      type: 'object',
      children: [
        { name: 'nested_string', type: 'string' },
        { name: 'nested_number', type: 'number' },
        { name: 'nested_boolean', type: 'boolean' }
      ]
    }
  ],

  // 4. Object Arrays (Arrays containing objects)
  objectArrays: [
    {
      type: 'array',
      children: [
        { name: 'item_name', type: 'string' },
        { name: 'item_value', type: 'number' },
        { name: 'item_active', type: 'boolean' }
      ]
    }
  ],

  // 5. Deep Nested Objects (3 levels)
  deepNested: [
    {
      type: 'object',
      children: [
        {
          name: 'level1',
          type: 'object',
          children: [
            {
              name: 'level2',
              type: 'object', 
              children: [
                { name: 'level3_field', type: 'string' }
              ]
            }
          ]
        }
      ]
    }
  ],

  // 6. Complex Mixed Arrays
  complexArrays: [
    {
      type: 'array',
      children: [
        { name: 'user_name', type: 'string' },
        { name: 'user_roles', type: 'array', options: ['admin', 'user', 'guest'] },
        {
          name: 'user_profile',
          type: 'object',
          children: [
            { name: 'age', type: 'number' },
            { name: 'active', type: 'boolean' }
          ]
        }
      ]
    }
  ],

  // 7. Sample JSON for Generation Testing
  sampleJsonConfigs: {
    simpleConfig: {
      "appName": "MyApp",
      "version": "1.0.0", 
      "enabled": true,
      "features": ["auth", "analytics", "reporting"]
    },
    
    complexConfig: {
      "database": {
        "host": "localhost",
        "port": 5432,
        "ssl": true,
        "pooling": {
          "min": 5,
          "max": 20
        }
      },
      "users": [
        {
          "name": "John",
          "role": "admin",
          "permissions": ["read", "write", "delete"],
          "profile": {
            "email": "john@example.com",
            "active": true
          }
        }
      ]
    }
  }
};

// Test Steps:
// 1. Load existing schema ✓
// 2. Add basic fields ✓
// 3. Add simple array with options ✓
// 4. Add object with nested fields ✓ 
// 5. Add array containing objects ✓
// 6. Test 3-level deep nesting ✓
// 7. Test JSON generation from samples ✓
// 8. Test save functionality ✓
// 9. Test type conversions ✓
// 10. Test validation and error handling ✓

export default testScenarios;
