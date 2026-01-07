#!/bin/bash

echo "🧪 Testing CORS Configuration for Vercel Backend"
echo "================================================"
echo ""

BACKEND_URL="https://backend-git-main-imshahrukhs-projects.vercel.app"
FRONTEND_ORIGIN="https://traiageaiinc.netlify.app"

echo "1️⃣ Testing Health Endpoint (Simple Request)..."
echo "================================================"
HEALTH_RESPONSE=$(curl -s -w "\nHTTP Status: %{http_code}" \
  -H "Origin: $FRONTEND_ORIGIN" \
  "$BACKEND_URL/health")
echo "$HEALTH_RESPONSE"
echo ""

echo "2️⃣ Testing OPTIONS Preflight (Login Endpoint)..."
echo "================================================"
OPTIONS_RESPONSE=$(curl -s -i -X OPTIONS \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization" \
  "$BACKEND_URL/api/auth/login")
echo "$OPTIONS_RESPONSE"
echo ""

echo "3️⃣ Checking for Required CORS Headers..."
echo "================================================"
if echo "$OPTIONS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
  echo "✅ Access-Control-Allow-Origin header present"
else
  echo "❌ Access-Control-Allow-Origin header MISSING"
fi

if echo "$OPTIONS_RESPONSE" | grep -q "Access-Control-Allow-Methods"; then
  echo "✅ Access-Control-Allow-Methods header present"
else
  echo "❌ Access-Control-Allow-Methods header MISSING"
fi

if echo "$OPTIONS_RESPONSE" | grep -q "Access-Control-Allow-Headers"; then
  echo "✅ Access-Control-Allow-Headers header present"
else
  echo "❌ Access-Control-Allow-Headers header MISSING"
fi

echo ""
echo "4️⃣ Testing Actual POST Request..."
echo "================================================"
POST_RESPONSE=$(curl -s -w "\nHTTP Status: %{http_code}" \
  -X POST \
  -H "Origin: $FRONTEND_ORIGIN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' \
  "$BACKEND_URL/api/auth/login")
echo "$POST_RESPONSE"
echo ""

echo "✅ Test Complete!"
echo ""
echo "💡 If you see Access-Control-Allow-Origin headers in response 2️⃣, CORS is working!"
echo "💡 Wait 2-3 minutes after Vercel deployment completes before running this test."

