@echo off
REM Demo Script for Verifiable Credentials Issuer Service
REM
REM This script demonstrates the full VC lifecycle:
REM 1. Generate DID
REM 2. Issue credential
REM 3. Verify credential (should be valid)
REM 4. Revoke credential
REM 5. Verify again (should be invalid/revoked)
REM
REM Note: Make sure the server is running before executing this script
REM Or uncomment the server startup commands below

echo ==========================================
echo Verifiable Credentials Demo Script
echo ==========================================
echo.

REM Set base URL (change if your server is on a different port)
set BASE_URL=http://localhost:3000
set API_KEY=demo-issuer-api-key-change-in-production

REM Check if server is running
echo Checking if server is running...
curl -s %BASE_URL%/health >nul 2>&1
if errorlevel 1 (
    echo Server is not running. Please start the server first:
    echo   npm start
    echo.
    echo Or uncomment the server startup commands below
    REM echo Starting server in background...
    REM start /B node server.js
    REM timeout /t 3 /nobreak >nul
    pause
    exit /b 1
)

echo Server is running!
echo.

REM Step 1: Generate DID
echo ==========================================
echo Step 1: Generating DID...
echo ==========================================
curl -X POST %BASE_URL%/generate-did -H "Content-Type: application/json" -s > demo_did_response.json
type demo_did_response.json
echo.
echo.

REM Extract DID from response (requires jq or manual extraction)
REM For Windows, we'll parse it manually or use PowerShell
for /f "tokens=*" %%i in ('powershell -Command "(Get-Content demo_did_response.json | ConvertFrom-Json).did"') do set HOLDER_DID=%%i
echo Extracted HOLDER_DID: %HOLDER_DID%
echo.

REM Step 2: Issue Credential
echo ==========================================
echo Step 2: Issuing Verifiable Credential...
echo ==========================================
curl -X POST %BASE_URL%/issue -H "Content-Type: application/json" -d "{\"holderDid\":\"%HOLDER_DID%\",\"type\":\"UniversityDegree\",\"claims\":{\"degree\":\"Bachelor of Science\",\"university\":\"Demo University\",\"graduationDate\":\"2023-05-15\"}}" -s > demo_issue_response.json
type demo_issue_response.json
echo.
echo.

REM Extract credential ID
for /f "tokens=*" %%i in ('powershell -Command "(Get-Content demo_issue_response.json | ConvertFrom-Json).credentialId"') do set CREDENTIAL_ID=%%i
echo Extracted CREDENTIAL_ID: %CREDENTIAL_ID%
echo.

REM Step 3: Verify Credential (should be valid)
echo ==========================================
echo Step 3: Verifying Credential (should be VALID)...
echo ==========================================
curl -X POST %BASE_URL%/verify -H "Content-Type: application/json" -d "@demo_issue_response.json" -s > demo_verify_valid_response.json
type demo_verify_valid_response.json
echo.
echo.

REM Step 4: Revoke Credential
echo ==========================================
echo Step 4: Revoking Credential...
echo ==========================================
curl -X POST %BASE_URL%/revoke -H "Content-Type: application/json" -H "X-API-Key: %API_KEY%" -d "{\"credentialId\":\"%CREDENTIAL_ID%\",\"reason\":\"Demo revocation\"}" -s > demo_revoke_response.json
type demo_revoke_response.json
echo.
echo.

REM Step 5: Check Status
echo ==========================================
echo Step 5: Checking Credential Status...
echo ==========================================
REM Extract UUID from credential ID
set CREDENTIAL_UUID=%CREDENTIAL_ID%
set CREDENTIAL_UUID=%CREDENTIAL_UUID:urn:uuid:=%
curl -X GET %BASE_URL%/status/%CREDENTIAL_UUID% -s > demo_status_response.json
type demo_status_response.json
echo.
echo.

REM Step 6: Verify Credential Again (should be invalid/revoked)
echo ==========================================
echo Step 6: Verifying Credential Again (should be INVALID/REVOKED)...
echo ==========================================
curl -X POST %BASE_URL%/verify -H "Content-Type: application/json" -d "@demo_issue_response.json" -s > demo_verify_revoked_response.json
type demo_verify_revoked_response.json
echo.
echo.

REM Cleanup
echo ==========================================
echo Cleaning up temporary files...
echo ==========================================
del demo_*.json
echo Done!
echo.

echo ==========================================
echo Demo Complete!
echo ==========================================
echo.
echo Summary:
echo - Generated DID: %HOLDER_DID%
echo - Issued Credential: %CREDENTIAL_ID%
echo - Verified credential (before revocation): Check demo_verify_valid_response.json
echo - Revoked credential
echo - Verified credential (after revocation): Check demo_verify_revoked_response.json
echo.
pause

