#!/bin/bash
# Automatic SMS Testing Script
# Run this after restarting your application

BASE_URL="http://localhost:8083/api"

echo "========================================"
echo "  Automatic SMS Testing - User ID 2"
echo "========================================"
echo ""

# Step 1: Verify User 2 exists
echo "STEP 1: Verifying User 2..."
USER_RESPONSE=$(curl -s -X GET "$BASE_URL/users/2")
echo "✓ User Found"
echo "$USER_RESPONSE" | grep -o '"firstName":"[^"]*"' | cut -d'"' -f4
echo ""

# Step 2: Create Credit for User 2
echo "STEP 2: Creating Credit for User 2..."
CREDIT_RESPONSE=$(curl -s -X POST "$BASE_URL/credits" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "duration": 12,
    "rate": 5.5,
    "status": "APPROVED",
    "userId": 2
  }')

CREDIT_ID=$(echo $CREDIT_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "✓ Credit Created: ID = $CREDIT_ID"
echo ""

# Step 3: Create Contract
echo "STEP 3: Creating Contract with Penalty Config..."
CONTRACT_RESPONSE=$(curl -s -X POST "$BASE_URL/contrats/credit/$CREDIT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "signedDate": "2026-03-20",
    "amount": 10000,
    "rate": 5.5,
    "duration": 12,
    "status": "ACTIVE",
    "version": "1.0",
    "type": "PERSONAL",
    "currency": "TND",
    "penaltyRate": 5.00,
    "penaltyType": "PERCENTAGE",
    "gracePeriodDays": 3
  }')

CONTRACT_ID=$(echo $CONTRACT_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "✓ Contract Created: ID = $CONTRACT_ID"
echo ""

# Step 4: Create Payment with PAST due date (AUTOMATIC SMS!)
echo "STEP 4: Creating Payment with Past Due Date..."
echo "  Due Date: 2026-03-25 (4 days ago)"
echo "  Status: PENDING (will auto-change to OVERDUE)"
echo ""

PAYMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/echeanciers/contrat/$CONTRACT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "dueDate": "2026-03-25",
    "amountDue": 900,
    "principalAmount": 800,
    "interestAmount": 100,
    "penaltyAmount": 0,
    "status": "PENDING"
  }')

PAYMENT_ID=$(echo $PAYMENT_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

echo "========================================"
echo "  ✨ AUTOMATIC MAGIC HAPPENED! ✨"
echo "========================================"
echo ""
echo "✓ Payment Created: ID = $PAYMENT_ID"
echo "✓ Status: OVERDUE (automatically changed!)"
echo ""
echo "📱 SMS AUTOMATICALLY SENT TO USER 2!"
echo ""

# Step 5: Verify Payment Details
echo "STEP 5: Verifying Payment Details..."
VERIFY_RESPONSE=$(curl -s -X GET "$BASE_URL/echeanciers/$PAYMENT_ID")
echo "✓ Payment verified"
echo "$VERIFY_RESPONSE"
echo ""

# Step 6: Calculate Penalties (Optional)
echo "STEP 6: Calculating Penalties..."
PENALTY_RESPONSE=$(curl -s -X POST "$BASE_URL/penalties/calculate/$PAYMENT_ID")
echo "✓ Penalty calculation triggered"
echo ""

# Step 7: Check Penalty History
echo "STEP 7: Checking Penalty History..."
HISTORY_RESPONSE=$(curl -s -X GET "$BASE_URL/penalties/history/$PAYMENT_ID")
echo "$HISTORY_RESPONSE"
echo ""

# Summary
echo "========================================"
echo "  TEST COMPLETED SUCCESSFULLY! ✓"
echo "========================================"
echo ""
echo "Summary:"
echo "  Credit ID: $CREDIT_ID"
echo "  Contract ID: $CONTRACT_ID"
echo "  Payment ID: $PAYMENT_ID"
echo "  Status: OVERDUE (automatic)"
echo "  SMS: Sent to User 2"
echo ""
echo "Check your application logs for SMS confirmation!"
echo ""
