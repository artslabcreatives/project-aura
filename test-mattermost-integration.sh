#!/bin/bash

echo "🔍 Testing Mattermost Integration..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables directly from Laravel config
MATTERMOST_URL=$(php artisan tinker --execute='echo config("services.mattermost.url");' 2>&1 | tail -1)
MATTERMOST_TOKEN=$(php artisan tinker --execute='echo config("services.mattermost.token");' 2>&1 | tail -1)
MATTERMOST_JWT_SECRET=$(php artisan tinker --execute='echo config("services.mattermost.jwt_secret");' 2>&1 | tail -1)
MATTERMOST_PLUGIN_ID=$(php artisan tinker --execute='echo config("services.mattermost.plugin_id");' 2>&1 | tail -1)

echo "1. Testing Mattermost Admin Token..."
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer ${MATTERMOST_TOKEN}" "${MATTERMOST_URL}/api/v4/users/me")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "   ${GREEN}✓ Token is valid${NC}"
    USERNAME=$(echo "$BODY" | grep -o '"username":"[^"]*' | cut -d'"' -f4)
    echo "   Admin user: $USERNAME"
else
    echo -e "   ${RED}✗ Token is invalid or expired${NC}"
    echo "   HTTP Status: $HTTP_CODE"
    echo "   Please generate a new token in Mattermost"
    exit 1
fi

echo ""
echo "2. Testing JWT Secret..."
if [ -z "$MATTERMOST_JWT_SECRET" ] || [ "$MATTERMOST_JWT_SECRET" = "your-shared-secret-key-here" ]; then
    echo -e "   ${RED}✗ JWT Secret not configured${NC}"
    exit 1
else
    SECRET_LENGTH=${#MATTERMOST_JWT_SECRET}
    if [ $SECRET_LENGTH -lt 32 ]; then
        echo -e "   ${YELLOW}⚠ JWT Secret is short (${SECRET_LENGTH} chars, recommend 32+)${NC}"
    else
        echo -e "   ${GREEN}✓ JWT Secret is configured (${SECRET_LENGTH} chars)${NC}"
    fi
fi

echo ""
echo "3. Testing Plugin Configuration..."
if [ -z "$MATTERMOST_PLUGIN_ID" ]; then
    echo -e "   ${RED}✗ Plugin ID not configured${NC}"
else
    echo -e "   ${GREEN}✓ Plugin ID: ${MATTERMOST_PLUGIN_ID}${NC}"
fi

echo ""
echo "4. Testing User Lookup..."
TEST_EMAIL="miyuru@artslabcreatives.com"
USER_RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer ${MATTERMOST_TOKEN}" "${MATTERMOST_URL}/api/v4/users/email/${TEST_EMAIL}")
USER_HTTP_CODE=$(echo "$USER_RESPONSE" | tail -n1)

if [ "$USER_HTTP_CODE" = "200" ]; then
    echo -e "   ${GREEN}✓ Can lookup users by email${NC}"
    USER_ID=$(echo "$USER_RESPONSE" | head -n-1 | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "   Test user ID: $USER_ID"
else
    echo -e "   ${YELLOW}⚠ User ${TEST_EMAIL} not found in Mattermost${NC}"
fi

echo ""
echo "5. Testing JWT Generation..."
JWT_TEST=$(php artisan tinker --execute='
$user = App\Models\User::find(1);
if (!$user) {
    echo "ERROR: No user found";
    exit(1);
}
$service = app(App\Services\MattermostService::class);
$jwt = $service->generatePluginJWT($user);
if ($jwt) {
    echo "SUCCESS";
} else {
    echo "FAILED";
}
' 2>&1)

if echo "$JWT_TEST" | grep -q "SUCCESS"; then
    echo -e "   ${GREEN}✓ JWT generation working${NC}"
elif echo "$JWT_TEST" | grep -q "FAILED"; then
    echo -e "   ${RED}✗ JWT generation failed${NC}"
    echo "   Check storage/logs/laravel.log for details"
else
    echo -e "   ${YELLOW}⚠ Unexpected response: ${JWT_TEST}${NC}"
fi

echo ""
echo "6. Testing Auto-Login URL Generation..."
URL_TEST=$(php artisan tinker --execute='
$user = App\Models\User::find(1);
$service = app(App\Services\MattermostService::class);
$url = $service->generatePluginAutoLoginUrl($user);
echo $url ?? "FAILED";
' 2>&1)

if echo "$URL_TEST" | grep -q "auto-login"; then
    echo -e "   ${GREEN}✓ Auto-login URL generated${NC}"
    echo "   URL: $(echo "$URL_TEST" | grep auto-login | cut -d'?' -f1)..."
else
    echo -e "   ${RED}✗ Auto-login URL generation failed${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$HTTP_CODE" = "200" ] && echo "$JWT_TEST" | grep -q "SUCCESS" && echo "$URL_TEST" | grep -q "auto-login"; then
    echo -e "${GREEN}✓ All tests passed! Mattermost integration is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Configure the JWT secret in your Mattermost plugin:"
    echo "   JWT Secret: $MATTERMOST_JWT_SECRET"
    echo "2. Test the auto-login in your browser"
else
    echo -e "${YELLOW}⚠ Some tests failed. Please review the errors above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "1. Generate new Mattermost token (see URGENT_MATTERMOST_TOKEN_REFRESH.md)"
    echo "2. Ensure users exist in Mattermost with matching emails"
    echo "3. Configure plugin JWT secret in Mattermost"
fi

echo ""
