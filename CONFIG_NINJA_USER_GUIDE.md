# Config Ninja - Complete User Guide

## 📖 Overview

**Config Ninja** is an advanced tenant configuration management tool that transforms complex JSON configurations into user-friendly visual interfaces. It's designed to simplify the process of managing multi-tenant application configurations across different environments.

### 🎯 What Problem Does It Solve?

- **Complex Configuration Management**: Eliminates the need to manually edit complex JSON files
- **Schema Validation**: Ensures configuration integrity through automatic validation
- **Multi-Environment Support**: Manages configurations across development, staging, and production
- **Change Tracking**: Provides clear visibility into configuration modifications
- **Error Prevention**: Reduces configuration errors through guided editing

## 🚀 Key Features

### 1. **Visual Configuration Editor**
- Transform JSON configurations into intuitive forms
- Real-time validation and error checking
- Support for complex nested objects and arrays
- Dynamic form generation based on JSON schemas

### 2. **Smart File Management**
- Automatic configuration file discovery
- File system browser with filtering
- Support for multiple file formats (.json, .config, etc.)
- Directory navigation and file preview

### 3. **Advanced Schema Editor**
- Visual schema creation and modification
- Support for all JSON data types (string, number, boolean, array, object)
- 3-level deep nesting support
- Schema generation from sample JSON configurations

### 4. **Real-time Comparison**
- Side-by-side comparison of original vs modified configurations
- Highlighted changes with add/modify/remove indicators
- Configuration statistics and change metrics
- Visual diff presentation

### 5. **AI-Powered Assistant**
- Context-aware help and guidance
- Multi-provider AI support (Ollama, HuggingFace)
- Repository-specific knowledge base
- Quick answers to common questions

## 📋 Application Workflow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  File Selection │ -> │ Configuration    │ -> │ Schema Editor   │
│                 │    │ Loading          │    │ (Optional)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         v                        v                       v
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Directory       │    │ Form Generation  │    │ Field           │
│ Browser         │    │ & Validation     │    │ Management      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         v                        v                       v
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ File Preview &  │    │ Interactive      │    │ Save Schema     │
│ Selection       │    │ Editing          │    │ Changes         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         v                        v                       v
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Load & Edit     │    │ Real-time        │    │ Export &        │
│ Configuration   │    │ Comparison       │    │ Save Config     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📚 Detailed Usage Guide

### Step 1: File Selection
1. **Choose from Dropdown**: Select from automatically discovered configuration files
2. **Browse File System**: Use the directory browser to navigate and find files
3. **Filter Options**: Toggle to show only configuration files
4. **File Preview**: View file paths and metadata before selection

### Step 2: Configuration Loading
1. **Automatic Schema Detection**: System loads the associated JSON schema
2. **Form Generation**: Dynamic form creation based on schema structure
3. **Data Population**: Configuration values populate the form fields
4. **Validation Setup**: Real-time validation rules are activated

### Step 3: Interactive Editing
1. **Form View**: Edit using user-friendly form controls
   - Text inputs for strings
   - Number inputs with validation
   - Checkboxes for booleans
   - Multi-select for arrays
   - Nested forms for objects

2. **JSON View**: Direct JSON editing with syntax highlighting
   - Real-time JSON validation
   - Error highlighting and reporting
   - Auto-formatting and indentation

### Step 4: Schema Management (Optional)
1. **Schema Editor Access**: Click "Change Schema" to modify the schema
2. **Field Management**:
   - Add new fields with type selection
   - Modify existing field properties
   - Delete unnecessary fields
   - Reorder field structure

3. **Advanced Features**:
   - Nested object creation (up to 3 levels)
   - Array field configuration
   - Required field specification
   - Default value assignment

4. **Schema Generation**: Create schemas from sample JSON configurations

### Step 5: Change Review
1. **Comparison Panel**: Real-time side-by-side comparison
2. **Change Indicators**:
   - 🟢 Green: Added fields/values
   - 🟡 Yellow: Modified fields/values
   - 🔴 Red: Removed fields/values

3. **Statistics Display**:
   - Total changes count
   - Added/Modified/Removed breakdown
   - Validation status

### Step 6: Save and Export
1. **Save to File**: Update the original configuration file
2. **Copy to Clipboard**: Copy JSON for use elsewhere
3. **Validation Check**: Automatic validation before saving
4. **Success Confirmation**: Visual confirmation of successful operations

## 🔧 Technical Architecture

### Frontend Technologies
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety and better development experience
- **Material-UI v7**: Comprehensive component library with modern design
- **Vite**: Fast build tool with hot module replacement

### Data Management
- **JSON Schema**: Industry-standard configuration validation
- **Real-time Validation**: Immediate feedback on data entry
- **State Management**: React hooks for efficient state handling
- **File System Integration**: Direct file operations and directory browsing

### Testing & Quality
- **Cypress**: End-to-end testing with comprehensive test coverage
- **TypeScript Compiler**: Compile-time error checking
- **ESLint**: Code quality and consistency enforcement

## 🛠 Advanced Features

### Schema Field Types

#### String Fields
- Basic text input
- Multi-line text areas
- Pattern validation (regex)
- Length constraints
- Default values

#### Number Fields
- Integer and float support
- Min/max value constraints
- Step increments
- Number formatting

#### Boolean Fields
- Checkbox controls
- Toggle switches
- Default state configuration

#### Array Fields
- Dynamic array management
- Add/remove items
- Array item validation
- Minimum/maximum length
- Array of objects support

#### Object Fields
- Nested property management
- Required property specification
- Object validation
- Deep nesting (up to 3 levels)

### Multi-Environment Support
- Development configurations
- Staging environment settings
- Production environment management
- Environment-specific overrides
- Configuration inheritance

### Validation Rules
- Required field validation
- Data type enforcement
- Pattern matching (regex)
- Custom validation messages
- Cross-field validation

## 🚨 Troubleshooting Guide

### Common Issues and Solutions

#### 1. Configuration File Loading Issues
**Problem**: Cannot load configuration file
**Solutions**:
- Verify file exists and is accessible
- Check file permissions (read access required)
- Validate JSON syntax using online JSON validator
- Ensure file encoding is UTF-8

#### 2. Schema Validation Errors
**Problem**: Form shows validation errors
**Solutions**:
- Check required fields are filled
- Verify data types match schema expectations
- Review array and object structure requirements
- Use schema editor to adjust validation rules

#### 3. Save Operation Failures
**Problem**: Cannot save configuration changes
**Solutions**:
- Verify write permissions for target directory
- Check available disk space
- Ensure file is not locked by another application
- Validate all form fields pass validation

#### 4. Schema Editor Issues
**Problem**: Schema editor not working properly
**Solutions**:
- Refresh the page and try again
- Check browser console for error messages
- Verify schema file permissions
- Try creating a new schema from sample

#### 5. Performance Issues
**Problem**: Application runs slowly with large configurations
**Solutions**:
- Break large configurations into smaller modules
- Use pagination for large arrays
- Optimize browser performance (close unnecessary tabs)
- Consider using JSON view for large files

### Browser Compatibility
- **Chrome**: Fully supported (recommended)
- **Firefox**: Fully supported
- **Safari**: Supported with minor limitations
- **Edge**: Fully supported

## 📈 Best Practices

### Configuration Management
1. **Regular Backups**: Always backup configurations before major changes
2. **Version Control**: Use Git or similar for configuration versioning
3. **Environment Separation**: Maintain separate configs for each environment
4. **Documentation**: Document configuration changes and their purposes
5. **Testing**: Test configurations in non-production environments first

### Schema Design
1. **Clear Naming**: Use descriptive field names and descriptions
2. **Appropriate Types**: Choose the most specific data type for each field
3. **Validation**: Add appropriate validation rules to prevent errors
4. **Documentation**: Include help text and examples for complex fields
5. **Evolution**: Plan for schema changes and backward compatibility

### Performance Optimization
1. **Efficient Schemas**: Design schemas to minimize unnecessary complexity
2. **Modular Configs**: Break large configurations into logical modules
3. **Caching**: Leverage browser caching for frequently accessed files
4. **Validation**: Use client-side validation to reduce server round trips

## 🔮 Future Enhancements

### Planned Features
- **Configuration Templates**: Pre-built templates for common scenarios
- **Batch Operations**: Edit multiple configurations simultaneously
- **Configuration Diffing**: Compare configurations across environments
- **Integration APIs**: REST APIs for programmatic configuration management
- **Advanced Validation**: Custom validation rule engine
- **Audit Trail**: Complete history of configuration changes
- **Role-based Access**: User permissions and access control
- **Configuration Migration**: Tools for migrating between schema versions

### Community Contributions
- **Feature Requests**: Submit ideas through GitHub issues
- **Bug Reports**: Report issues with detailed reproduction steps
- **Documentation**: Help improve documentation and examples
- **Testing**: Contribute test cases and scenarios
- **Translations**: Help localize the interface for different languages

## 📞 Support and Resources

### Getting Help
1. **Built-in AI Assistant**: Use the AI assistant for immediate help
2. **Help Documentation**: Comprehensive help pages within the application
3. **GitHub Issues**: Report bugs and request features
4. **Community Discussions**: Join community discussions for tips and tricks

### External Resources
- **JSON Schema Documentation**: https://json-schema.org/
- **React Documentation**: https://react.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Material-UI Documentation**: https://mui.com/

---

**Config Ninja** - Simplifying configuration management, one tenant at a time. 🥷
