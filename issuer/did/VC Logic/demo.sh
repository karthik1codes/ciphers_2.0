#!/bin/bash
# Demo Script for Verifiable Credentials Issuer Service
#
# This script demonstrates the full VC lifecycle:
# 1. Generate DID
# 2. Issue credential
# 3. Verify credential (should be valid)
# 4. Revoke credential
# 5. Verify again (should be invalid/revoked)
#
# Note: Make sure the server is running before executing this script
# Or uncomment the server startup commands below

echo "=========================================="
echo "Verifiable Credentials Demo Script"
echo "=========================================="
echo ""

# Set base URL (change if your server is on a different port)
BASE_URL="http://localhost:3000"
API_KEY="demo-issuer-api-key-change-in-production"

# Check if server is running
echo "Checking if server is running..."
if ! curl -s "${BASE_URL}/health" > /dev/null 2>&1; then
    echo "Server is not running. Please start the server first:"
    echo "  npm start"
    echo ""
    echo "Or uncomment the server startup commands below"
    # echo "Starting server in background..."
    # node server.js &
    # sleep 3
    exit 1
fi

echo "Server is running!"
echo ""

# Step 1: Generate DID
echo "=========================================="
echo "Step 1: Generating DID..."
echo "=========================================="
HOLDER_DID=$(curl -X POST "${BASE_URL}/generate-did" \
    -H "Content-Type: application/json" \
    -s | jq -r '.did')

echo "Generated HOLDER_DID: ${HOLDER_DID}"
echo ""

# Step 2: Issue Credential
echo "=========================================="
echo "Step 2: Issuing Verifiable Credential..."
echo "=========================================="
ISSUE_RESPONSE=$(curl -X POST "${BASE_URL}/issue" \
    -H "Content-Type: application/json" \
    -d "{
        \"holderDid\": \"${HOLDER_DID}\",
        \"type\": \"UniversityDegree\",
        \"claims\": {
            \"degree\": \"Bachelor of Science\",
            \"university\": \"Demo University\",
            \"graduationDate\": \"2023-05-15\"
        }
    }" \
    -s)

echo "${ISSUE_RESPONSE}" | jq '.'
CREDENTIAL_ID=$(echo "${ISSUE_RESPONSE}" | jq -r '.credentialId')
CREDENTIAL=$(echo "${ISSUE_RESPONSE}" | jq '.credential')
echo ""
echo "Issued Credential ID: ${CREDENTIAL_ID}"
echo ""

# Step 3: Verify Credential (should be valid)
echo "=========================================="
echo "Step 3: Verifying Credential (should be VALID)..."
echo "=========================================="
VERIFY_VALID_RESPONSE=$(curl -X POST "${BASE_URL}/verify" \
    -H "Content-Type: application/json" \
    -d "{
        \"vc\": ${CREDENTIAL}
    }" \
    -s)

echo "${VERIFY_VALID_RESPONSE}" | jq '.'
echo ""

# Step 4: Revoke Credential
echo "=========================================="
echo "Step 4: Revoking Credential..."
echo "=========================================="
# Extract UUID from credential ID
CREDENTIAL_UUID=$(echo "${CREDENTIAL_ID}" | sed 's/urn:uuid://')

REVOKE_RESPONSE=$(curl -X POST "${BASE_URL}/revoke" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: ${API_KEY}" \
    -d "{
        \"credentialId\": \"${CREDENTIAL_UUID}\",
        \"reason\": \"Demo revocation\"
    }" \
    -s)

echo "${REVOKE_RESPONSE}" | jq '.'
echo ""

# Step 5: Check Status
echo "=========================================="
echo "Step 5: Checking Credential Status..."
echo "=========================================="
STATUS_RESPONSE=$(curl -X GET "${BASE_URL}/status/${CREDENTIAL_UUID}" -s)
echo "${STATUS_RESPONSE}" | jq '.'
echo ""

# Step 6: Verify Credential Again (should be invalid/revoked)
echo "=========================================="
echo "Step 6: Verifying Credential Again (should be INVALID/REVOKED)..."
echo "=========================================="
VERIFY_REVOKED_RESPONSE=$(curl -X POST "${BASE_URL}/verify" \
    -H "Content-Type: application/json" \
    -d "{
        \"vc\": ${CREDENTIAL}
    }" \
    -s)

echo "${VERIFY_REVOKED_RESPONSE}" | jq '.'
echo ""

echo "=========================================="
echo "Demo Complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "- Generated DID: ${HOLDER_DID}"
echo "- Issued Credential: ${CREDENTIAL_ID}"
echo "- Verified credential (before revocation): Check response above"
echo "- Revoked credential"
echo "- Verified credential (after revocation): Check response above"
echo ""

