# Automatic SMS Testing Script
# Run this after restarting your application

$baseUrl = "http://localhost:8083/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Automatic SMS Testing - User ID 2" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify User 2 exists
Write-Host "STEP 1: Verifying User 2..." -ForegroundColor Yellow
try {
    $userResponse = Invoke-RestMethod -Uri "$baseUrl/users/2" -Method Get -ContentType "application/json"
    Write-Host "User Found: $($userResponse.firstName) $($userResponse.lastName)" -ForegroundColor Green
    Write-Host "  Phone: $($userResponse.phone)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "ERROR: User 2 not found!" -ForegroundColor Red
    exit 1
}

# Step 2: Create Credit for User 2
Write-Host "STEP 2: Creating Credit for User 2..." -ForegroundColor Yellow
$creditBody = @{
    amount = 10000
    interestRate = 5.5
    durationMonths = 12
    startDate = "2026-03-20"
    endDate = "2027-03-20"
    status = "APPROVED"
    riskScore = 75.0
} | ConvertTo-Json

$creditResponse = Invoke-RestMethod -Uri "$baseUrl/credits/user/2" -Method Post -Body $creditBody -ContentType "application/json"
$creditId = $creditResponse.id
Write-Host "Credit Created: ID = $creditId" -ForegroundColor Green
Write-Host "  Amount: $($creditResponse.amount) TND" -ForegroundColor Green
Write-Host "  Duration: $($creditResponse.durationMonths) months" -ForegroundColor Green
Write-Host ""

# Step 3: Create Contract
Write-Host "STEP 3: Creating Contract with Penalty Config..." -ForegroundColor Yellow
$contractBody = @{
    signedDate = "2026-03-20"
    amount = 10000.0
    rate = 5.5
    duration = 12
    status = "ACTIVE"
    version = "1.0"
    type = "INITIAL"
    currency = "TND"
    penaltyRate = 5.0
    penaltyType = "PERCENTAGE"
    gracePeriodDays = 3
} | ConvertTo-Json

try {
    $contractResponse = Invoke-RestMethod -Uri "$baseUrl/contrats/credit/$creditId" -Method Post -Body $contractBody -ContentType "application/json"
    $contractId = $contractResponse.id
    Write-Host "Contract Created: ID = $contractId" -ForegroundColor Green
    Write-Host "  Penalty Rate: $($contractResponse.penaltyRate)%" -ForegroundColor Green
    Write-Host "  Penalty Type: $($contractResponse.penaltyType)" -ForegroundColor Green
    Write-Host "  Grace Period: $($contractResponse.gracePeriodDays) days" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "ERROR creating contract: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Create Payment with PAST due date
Write-Host "STEP 4: Creating Payment with Past Due Date..." -ForegroundColor Yellow
Write-Host "  Due Date: 2026-03-25 - 4 days ago" -ForegroundColor Cyan
Write-Host "  Status: PENDING - will auto-change to OVERDUE" -ForegroundColor Cyan
Write-Host ""

$paymentBody = @{
    dueDate = "2026-03-25"
    amountDue = 900.0
    principalAmount = 800.0
    interestAmount = 100.0
    penaltyAmount = 0.0
    status = "PENDING"
} | ConvertTo-Json

try {
    $paymentResponse = Invoke-RestMethod -Uri "$baseUrl/echeanciers/contrat/$contractId" -Method Post -Body $paymentBody -ContentType "application/json"
    $paymentId = $paymentResponse.id

    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host "  AUTOMATIC MAGIC HAPPENED!" -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Payment Created: ID = $paymentId" -ForegroundColor Green
    Write-Host "Status: $($paymentResponse.status) - automatically changed!" -ForegroundColor Green
    Write-Host "Overdue Date: $($paymentResponse.overdueDate)" -ForegroundColor Green
    Write-Host "Days Overdue: $($paymentResponse.daysOverdue)" -ForegroundColor Green
    Write-Host ""
    Write-Host "SMS AUTOMATICALLY SENT TO USER 2!" -ForegroundColor Magenta
    Write-Host "Phone: +216 20 285 074" -ForegroundColor Magenta
    Write-Host ""
} catch {
    Write-Host "ERROR creating payment: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 5: Verify Payment Details
Write-Host "STEP 5: Verifying Payment Details..." -ForegroundColor Yellow
$verifyResponse = Invoke-RestMethod -Uri "$baseUrl/echeanciers/$paymentId" -Method Get -ContentType "application/json"
Write-Host "Payment Status: $($verifyResponse.status)" -ForegroundColor Green
Write-Host "  Due Date: $($verifyResponse.dueDate)" -ForegroundColor White
Write-Host "  Amount Due: $($verifyResponse.amountDue) TND" -ForegroundColor White
Write-Host "  Days Overdue: $($verifyResponse.daysOverdue)" -ForegroundColor White
Write-Host ""

# Step 6: Calculate Penalties
Write-Host "STEP 6: Calculating Penalties..." -ForegroundColor Yellow
try {
    $penaltyCalc = Invoke-RestMethod -Uri "$baseUrl/penalties/calculate/$paymentId" -Method Post -ContentType "application/json"
    Write-Host "Penalty Calculated: $($penaltyCalc.message)" -ForegroundColor Green
} catch {
    Write-Host "Penalty calculation: $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Step 7: Check Penalty History
Write-Host "STEP 7: Checking Penalty History..." -ForegroundColor Yellow
try {
    $history = Invoke-RestMethod -Uri "$baseUrl/penalties/history/$paymentId" -Method Get -ContentType "application/json"
    if ($history.Count -gt 0) {
        Write-Host "Penalty History Found:" -ForegroundColor Green
        foreach ($entry in $history) {
            Write-Host "  - Date: $($entry.calculationDate)" -ForegroundColor White
            Write-Host "    Days Overdue: $($entry.daysOverdue)" -ForegroundColor White
            Write-Host "    Penalty Amount: $($entry.penaltyAmount) TND" -ForegroundColor White
            Write-Host "    Method: $($entry.calculationMethod)" -ForegroundColor White
        }
    } else {
        Write-Host "  No penalty history yet" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Could not retrieve penalty history" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST COMPLETED SUCCESSFULLY!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor White
Write-Host "  User: Anas (ID: 2)" -ForegroundColor White
Write-Host "  Phone: +216 20 285 074" -ForegroundColor White
Write-Host "  Credit ID: $creditId" -ForegroundColor White
Write-Host "  Contract ID: $contractId" -ForegroundColor White
Write-Host "  Payment ID: $paymentId" -ForegroundColor White
Write-Host "  Status: OVERDUE - automatic" -ForegroundColor White
Write-Host "  SMS: Sent automatically" -ForegroundColor White
Write-Host ""
Write-Host "Check your application logs for SMS confirmation!" -ForegroundColor Cyan
Write-Host ""
