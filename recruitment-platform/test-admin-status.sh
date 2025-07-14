#!/bin/bash

echo "🧪 Testing Admin Dashboard Status Update Feature"
echo "================================================"

# Test Backend API
echo "📡 Testing Backend API endpoints..."

# Check if backend is running
echo "🔍 Checking backend health..."
curl -s http://localhost:5000/api/users > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running. Please start it first with: npm run dev"
    exit 1
fi

# Test getting users
echo "👥 Testing GET /api/users..."
curl -s -H "Content-Type: application/json" http://localhost:5000/api/users | jq -r '.data[0] | "User: \(.email), Active: \(.isActive)"'

# Instructions for manual testing
echo ""
echo "🔧 Manual Testing Steps:"
echo "1. Open Admin Dashboard in browser"
echo "2. Go to Users tab"
echo "3. Click three dots menu on any user"
echo "4. Click 'Khóa tài khoản' or 'Kích hoạt'"
echo "5. Verify status changes immediately"
echo "6. Refresh page (F5)"
echo "7. Verify status persists after refresh"
echo ""
echo "🔍 Check these points:"
echo "- Status changes immediately in UI"
echo "- Database is updated (check console logs)"
echo "- Status persists after page refresh"
echo "- No console errors in browser"
echo ""
echo "📋 Key Fixes Applied:"
echo "✅ Backend returns isActive field in users API"
echo "✅ Frontend uses real status from database"
echo "✅ Status change triggers data reload"
echo "✅ Removed hardcoded 'ACTIVE' status"
echo "✅ Fixed API response mapping"
