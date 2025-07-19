#!/bin/bash

echo "🚀 Basic Functionality Test Suite"
echo "=================================="

# Test Backend API endpoints
echo "1. Backend Health Check:"
curl -s "http://localhost:8002/api/health" | jq '.status'

echo -e "\n2. Schema File Reading:"
curl -s "http://localhost:8002/api/read-file?path=/Users/sachinkumar/Documents/config-ninja/src/config/tenant-config.schema.json" | jq '.content' | head -c 100
echo "..."

echo -e "\n3. Frontend Check:"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001")
echo "Frontend HTTP Status: $FRONTEND_STATUS"

echo -e "\n4. Write Test:"
curl -s -X POST "http://localhost:8002/api/write-file" \
  -H "Content-Type: application/json" \
  -d '{"path": "/Users/sachinkumar/Documents/config-ninja/test-output.json", "content": "test"}' | jq '.success'

# Clean up
rm -f "/Users/sachinkumar/Documents/config-ninja/test-output.json"

echo -e "\n✅ Basic API tests completed!"
echo "🌐 Application ready at: http://localhost:3001"
echo ""
echo "📝 Manual Test Checklist:"
echo "  □ Schema Editor opens correctly"
echo "  □ Existing schema loads from file"
echo "  □ Can add basic fields (string, number, boolean)"
echo "  □ Can add simple arrays with options"
echo "  □ Can add object fields with children"
echo "  □ Can add array fields with object structure"
echo "  □ Can nest up to 3 levels (object → object → object)"
echo "  □ Generate from Sample tab works with complex JSON"
echo "  □ Save functionality works"
echo "  □ Type conversions work properly"
echo "  □ Visual hierarchy is clear (different colors per level)"
echo "  □ Error handling works appropriately"
