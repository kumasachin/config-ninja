#!/bin/bash

echo "🧪 Starting comprehensive Schema Editor tests..."

# Test 1: Backend API Health
echo "1️⃣ Testing backend health..."
HEALTH=$(curl -s "http://localhost:8002/api/health" | jq -r '.status')
if [ "$HEALTH" = "healthy" ]; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Test 2: Schema file read
echo "2️⃣ Testing schema file reading..."
SCHEMA_READ=$(curl -s "http://localhost:8002/api/read-file?path=/Users/sachinkumar/Documents/config-ninja/src/config/tenant-config.schema.json")
if echo "$SCHEMA_READ" | jq -e '.content' > /dev/null 2>&1; then
    echo "✅ Schema file reading works"
else
    echo "❌ Schema file reading failed"
    exit 1
fi

# Test 3: Frontend accessibility
echo "3️⃣ Testing frontend accessibility..."
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001")
if [ "$FRONTEND" = "200" ]; then
    echo "✅ Frontend accessible"
else
    echo "❌ Frontend not accessible"
    exit 1
fi

# Test 4: Write functionality
echo "4️⃣ Testing write functionality..."
WRITE_RESULT=$(curl -s -X POST "http://localhost:8002/api/write-file" \
  -H "Content-Type: application/json" \
  -d '{"path": "/Users/sachinkumar/Documents/config-ninja/test-write.json", "content": "{\"test\": \"data\"}"}')

if echo "$WRITE_RESULT" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Write functionality works"
    # Clean up test file
    rm -f "/Users/sachinkumar/Documents/config-ninja/test-write.json"
else
    echo "❌ Write functionality failed"
    exit 1
fi

# Test 5: TypeScript compilation
echo "5️⃣ Testing TypeScript compilation..."
cd /Users/sachinkumar/Documents/config-ninja
npm run type-check > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation passed"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

echo ""
echo "🎉 All automated tests passed!"
echo ""
echo "📋 Manual tests to perform in browser:"
echo "1. Open http://localhost:3001"
echo "2. Click 'Edit Schema' button"
echo "3. Verify schema loads from tenant-config.schema.json"
echo "4. Test adding basic fields (string, number, boolean)"
echo "5. Test adding simple arrays with comma-separated options"
echo "6. Test adding object fields with nested properties"
echo "7. Test adding array fields with object children"
echo "8. Test 3-level deep nesting (object → object → object)"
echo "9. Test 'Generate from Sample' tab with complex JSON"
echo "10. Test save functionality"
echo "11. Test type conversions (object ↔ array ↔ string)"
echo "12. Test validation and error handling"
echo ""
echo "🔥 Schema Editor is ready for comprehensive testing!"
