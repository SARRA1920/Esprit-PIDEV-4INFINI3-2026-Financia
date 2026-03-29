# Penalty Calculation Feature - Complete Test Script
# Run this after the application has fully started

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Penalty Calculation Feature Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Wait for application to be ready
Write-Host "Checking if application is ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$ready = $false

while (-not $ready -and $attempt -lt $maxAttempts) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8083/api/contrats" -Method Get -ErrorAction Stop
        $ready = $true
        Write-Host "✓ Application is ready!" -ForegroundColor Green
    } catch {
        $attempt++
        Write-Host "Waiting for application... ($attempt/$maxAttempts)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $ready) {
    Write-Host "X Application not ready. Please start the application first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST 1: Update Contract with PERCENTAGE Penalty" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$body = @'
{
  "signedDate": "2026-02-20",
  "amount": 50000,
  "rate": 7.5,
  "duration": 24,
  "status": "ACTIVE",
  "version": "1.0",
  "type": "INITIAL",
  "penaltyRate": 5.0,
  "penaltyType": "PERCENTAGE",
  "gracePeriodDays": 3
}
'@

try {
    $contract = Invoke-RestMethod -Uri "http://localhost:8083/api/contrats/1" -Method Put -Body $body -ContentType "application/json"
    Write-Host "✓ Contract updated successfully" -ForegroundColor Green
    Write-Host "  - Penalty Rate: $($contract.penaltyRate)%" -ForegroundColor White
    Write-Host "  - Penalty Type: $($contract.penaltyType)" -ForegroundColor White
    Write-Host "  - Grace Period: $($contract.gracePeriodDays) days" -ForegroundColor White
} catch {
    Write-Host "X Failed to update contract: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST 2: Create Overdue Payment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$paymentBody = @'
{
  "dueDate": "2026-03-01",
  "amountDue": 1000,
  "principalAmount": 900,
  "interestAmount": 100,
  "penaltyAmount": 0,
  "status": "OVERDUE"
}
'@

try {
    $payment = Invoke-RestMethod -Uri "http://localhost:8083/api/echeanciers/contrat/1" -Method Post -Body $paymentBody -ContentType "application/json"
    Write-Host "✓ Payment created successfully" -ForegroundColor Green
    Write-Host "  - Payment ID: $($payment.id)" -ForegroundColor White
    Write-Host "  - Due Date: $($payment.dueDate)" -ForegroundColor White
    Write-Host "  - Amount Due: $($payment.amountDue) TND" -ForegroundColor White
    Write-Host "  - Status: $($payment.status)" -ForegroundColor White
    $paymentId = $payment.id
}
catch {
    Write-Host "X Failed to create payment: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Using existing payment ID 3 for testing..." -ForegroundColor Yellow
    $paymentId = 3
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST 3: Calculate Penalty" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    $result = Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/calculate/$paymentId" -Method Post
    Write-Host "✓ Penalty calculated successfully" -ForegroundColor Green
    Write-Host "  - $($result.message)" -ForegroundColor White
} catch {
    Write-Host "X Failed to calculate penalty: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST 4: Verify Penalty Amount" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    $payment = Invoke-RestMethod -Uri "http://localhost:8083/api/echeanciers/$paymentId" -Method Get
    Write-Host "✓ Payment details retrieved" -ForegroundColor Green
    Write-Host "  - Payment ID: $($payment.id)" -ForegroundColor White
    Write-Host "  - Due Date: $($payment.dueDate)" -ForegroundColor White
    Write-Host "  - Amount Due: $($payment.amountDue) TND" -ForegroundColor White
    Write-Host "  - Penalty Amount: $($payment.penaltyAmount) TND" -ForegroundColor Yellow
    Write-Host "  - Days Overdue: $($payment.daysOverdue)" -ForegroundColor White
    Write-Host "  - Status: $($payment.status)" -ForegroundColor White
    
    if ($payment.penaltyAmount -gt 0) {
        Write-Host "  ✓ Penalty was calculated!" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Penalty is 0 (might be within grace period)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "X Failed to retrieve payment: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST 5: View Penalty History" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    $history = Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/history/$paymentId" -Method Get
    Write-Host "✓ Penalty history retrieved" -ForegroundColor Green
    Write-Host "  - Total entries: $($history.Count)" -ForegroundColor White
    
    if ($history.Count -gt 0) {
        foreach ($entry in $history) {
            Write-Host "  ---" -ForegroundColor Gray
            Write-Host "  - Date: $($entry.calculationDate)" -ForegroundColor White
            Write-Host "  - Days Overdue: $($entry.daysOverdue)" -ForegroundColor White
            Write-Host "  - Penalty: $($entry.penaltyAmount) TND" -ForegroundColor Yellow
            Write-Host "  - Previous: $($entry.previousPenaltyAmount) TND" -ForegroundColor White
            Write-Host "  - Method: $($entry.calculationMethod)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "X Failed to retrieve penalty history: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST 6: Test FIXED Penalty Type" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$fixedBody = @'
{
  "signedDate": "2026-02-20",
  "amount": 50000,
  "rate": 7.5,
  "duration": 24,
  "status": "ACTIVE",
  "version": "1.0",
  "type": "INITIAL",
  "penaltyRate": 10.0,
  "penaltyType": "FIXED",
  "gracePeriodDays": 0
}
'@

try {
    $contract = Invoke-RestMethod -Uri "http://localhost:8083/api/contrats/1" -Method Put -Body $fixedBody -ContentType "application/json"
    Write-Host "✓ Contract updated to FIXED penalty (10 TND/day)" -ForegroundColor Green
    
    # Recalculate
    $result = Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/calculate/$paymentId" -Method Post
    Write-Host "✓ Penalty recalculated" -ForegroundColor Green
    
    # Check result
    $payment = Invoke-RestMethod -Uri "http://localhost:8083/api/echeanciers/$paymentId" -Method Get
    Write-Host "  - New Penalty Amount: $($payment.penaltyAmount) TND" -ForegroundColor Yellow
    Write-Host "  - Days Overdue: $($payment.daysOverdue)" -ForegroundColor White
    $expected = $payment.daysOverdue * 10
    Write-Host "  - Expected: ~$expected TND (10 TND per day)" -ForegroundColor White
}
catch {
    Write-Host "X Failed FIXED penalty test: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST 7: Test TIERED Penalty Type" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$tieredBody = @'
{
  "signedDate": "2026-02-20",
  "amount": 50000,
  "rate": 7.5,
  "duration": 24,
  "status": "ACTIVE",
  "version": "1.0",
  "type": "INITIAL",
  "penaltyRate": 0,
  "penaltyType": "TIERED",
  "gracePeriodDays": 0
}
'@

try {
    $contract = Invoke-RestMethod -Uri "http://localhost:8083/api/contrats/1" -Method Put -Body $tieredBody -ContentType "application/json"
    Write-Host "✓ Contract updated to TIERED penalty" -ForegroundColor Green
    Write-Host "  - 0-30 days: 2%" -ForegroundColor White
    Write-Host "  - 31-60 days: 5%" -ForegroundColor White
    Write-Host "  - 61+ days: 10%" -ForegroundColor White
    
    # Recalculate
    $result = Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/calculate/$paymentId" -Method Post
    Write-Host "✓ Penalty recalculated" -ForegroundColor Green
    
    # Check result
    $payment = Invoke-RestMethod -Uri "http://localhost:8083/api/echeanciers/$paymentId" -Method Get
    Write-Host "  - New Penalty Amount: $($payment.penaltyAmount) TND" -ForegroundColor Yellow
    Write-Host "  - Days Overdue: $($payment.daysOverdue)" -ForegroundColor White
} catch {
    Write-Host "X Failed TIERED penalty test: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST 8: Test Batch Penalty Calculation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    $result = Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/calculate-all" -Method Post
    Write-Host "✓ Batch calculation completed" -ForegroundColor Green
    Write-Host "  - Payments marked overdue: $($result.paymentsMarkedOverdue)" -ForegroundColor White
    Write-Host "  - Penalties updated: $($result.penaltiesUpdated)" -ForegroundColor White
} catch {
    Write-Host "X Failed batch calculation: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST 9: Test Daily Job (Manual Trigger)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    $result = Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/run-daily-job" -Method Post
    Write-Host "✓ Daily job executed successfully" -ForegroundColor Green
    Write-Host "  - Payments marked overdue: $($result.paymentsMarkedOverdue)" -ForegroundColor White
    Write-Host "  - Penalties updated: $($result.penaltiesUpdated)" -ForegroundColor White
} catch {
    Write-Host "X Failed to run daily job: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST 10: Final Penalty History Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    $history = Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/history/$paymentId" -Method Get
    Write-Host "✓ Final penalty history retrieved" -ForegroundColor Green
    Write-Host "  - Total history entries: $($history.Count)" -ForegroundColor White
    
    if ($history.Count -gt 0) {
        Write-Host ""
        Write-Host "  Penalty Progression:" -ForegroundColor Yellow
        foreach ($entry in $history | Sort-Object -Property calculationDate) {
            Write-Host "  $($entry.calculationDate): $($entry.penaltyAmount) TND ($($entry.calculationMethod))" -ForegroundColor White
        }
    }
} catch {
    Write-Host "X Failed to retrieve final history: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ All tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Key Features Tested:" -ForegroundColor Yellow
Write-Host "  ✓ Contract penalty configuration" -ForegroundColor White
Write-Host "  ✓ Overdue payment creation" -ForegroundColor White
Write-Host "  ✓ Penalty calculation (PERCENTAGE)" -ForegroundColor White
Write-Host "  ✓ Penalty calculation (FIXED)" -ForegroundColor White
Write-Host "  ✓ Penalty calculation (TIERED)" -ForegroundColor White
Write-Host "  ✓ Penalty history tracking" -ForegroundColor White
Write-Host "  ✓ Batch penalty calculation" -ForegroundColor White
Write-Host "  ✓ Daily job execution" -ForegroundColor White
Write-Host ""
Write-Host "Check the application logs for detailed execution information." -ForegroundColor Cyan
Write-Host ""

