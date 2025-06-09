#!/bin/bash

# Automated Code Signing and Notarization Script
# Reads all credentials from .env file in script directory
# Usage: ./sign_and_notarize.sh <dmg-file>

# Enable strict error checking
set -euo pipefail

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Verify parameters
if [ $# -ne 1 ]; then
    echo "Usage: $0 <dmg-file>"
    exit 1
fi

DMG_FILE="$1"

# Load environment variables from script directory
ENV_FILE="$SCRIPT_DIR/.env"
if [ -f "$ENV_FILE" ]; then
    # Source the .env file to preserve quoted values
    set -a  # Automatically export all variables
    source "$ENV_FILE"
    set +a
    echo "✅ Loaded environment variables from $ENV_FILE"
else
    echo "❌ Error: .env file not found in $SCRIPT_DIR"
    exit 1
fi

# Validate required variables
REQUIRED_VARS=("APPLE_ID" "TEAM_ID" "APPLE_ID_PASSWORD" "SIGNING_CERTIFICATE")
MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var:-}" ]; then
        MISSING_VARS+=("$var")
    fi
done

# Get absolute path to DMG file
if [[ "$DMG_FILE" != /* ]]; then
    DMG_FILE="$(pwd)/$DMG_FILE"
fi

# Validate file exists
if [ ! -f "$DMG_FILE" ]; then
    echo "❌ Error: DMG file $DMG_FILE not found"
    exit 1
fi

# Code signing
echo "🔏 Signing $DMG_FILE with certificate: $SIGNING_CERTIFICATE"
codesign --force --verify --verbose --sign "$SIGNING_CERTIFICATE" "$DMG_FILE"

# Verify signing
echo "🔍 Verifying code signature..."
VERIFY_OUTPUT=$(codesign -vvv "$DMG_FILE" 2>&1)
if grep -q "valid on disk" <<< "$VERIFY_OUTPUT" && \
   grep -q "satisfies its Designated Requirement" <<< "$VERIFY_OUTPUT"; then
    echo "✅ Code signature valid"
else
    echo "❌ Code signature verification failed"
    echo "$VERIFY_OUTPUT"
    exit 1
fi

# Notarization
echo "🚀 Submitting $DMG_FILE for notarization (this may take several minutes)..."
SUBMISSION_OUTPUT=$(xcrun notarytool submit "$DMG_FILE" \
    --apple-id "$APPLE_ID" \
    --password "$APPLE_ID_PASSWORD" \
    --team-id "$TEAM_ID" \
    --wait 2>&1)

echo "$SUBMISSION_OUTPUT"

# Check notarization status
if ! grep -q "status: Accepted" <<< "$SUBMISSION_OUTPUT"; then
    echo "❌ Notarization failed"
    exit 1
fi

# Staple ticket
echo "📎 Stapling notarization ticket..."
STAPLE_OUTPUT=$(xcrun stapler staple "$DMG_FILE" 2>&1)
echo "$STAPLE_OUTPUT"

if grep -q "The staple and validate action worked" <<< "$STAPLE_OUTPUT"; then
    echo "✅ Notarization ticket stapled successfully"
else
    echo "❌ Stapling failed"
    exit 1
fi

echo "🎉 Process completed! $DMG_FILE is ready for distribution."