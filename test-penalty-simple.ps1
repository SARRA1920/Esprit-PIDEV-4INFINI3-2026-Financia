# Simple Penalty Test Script
Write-Host "========================================"
Write-Host "Penalty Calculation Feature Test"
Write-Host "========================================"
Write-Host ""

# Test 1: Update Contract with Penalty
Write-Host "TEST 1: Update Contract with PERCENTAGE Penalty"
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

$contract = Invoke-RestMethod -Uri "http://localhost:8083/api/contrats/1" -Method Put -Body $body -ContentType "application/json"
Write-Host "Contract updated: Penalty Rate = $($contract.penaltyRate)%, Type = $($contract.penaltyType), Grace = $($contract.gracePeriodDays) days"
Write-Host ""

# Test 2: Create Overdue Payment
Write-Host "TEST 2: Create Overdue Payment"
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
    Write-Host "Payment created: ID = $($payment.id), Due Date = $($payment.dueDate), Amount = $($payment.amountDue) TND"
    $paymentId = $payment.id
}
catch {
    Write-Host "Using existing payment for testing..."
    $paymentId = 3
}
Write-Host ""

# Test 3: Calculate Penalty
Write-Host "TEST 3: Calculate Penalty for Payment ID $paymentId"
$result = Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/calculate/$paymentId" -Method Post
Write-Host $result.message
Write-Host ""

# Test 4: Verify Penalty
Write-Host "TEST 4: Verify Penalty Amount"
$payment = Invoke-RestMethod -Uri "http://localhost:8083/api/echeanciers/$paymentId" -Method Get
Write-Host "Payment ID: $($payment.id)"
Write-Host "Due Date: $($payment.dueDate)"
Write-Host "Amount Due: $($payment.amountDue) TND"
Write-Host "Penalty Amount: $($payment.penaltyAmount) TND"
Write-Host "Days Overdue: $($payment.daysOverdue)"
Write-Host "Status: $($payment.status)"
Write-Host ""

# Test 5: Penalty History
Write-Host "TEST 5: View Penalty History"
$history = Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/history/$paymentId" -Method Get
Write-Host "Total history entries: $($history.Count)"
foreach ($entry in $history) {
    Write-Host "  Date: $($entry.calculationDate), Penalty: $($entry.penaltyAmount) TND, Days: $($entry.daysOverdue), Method: $($entry.calculationMethod)"
}
Write-Host ""

# Test 6: FIXED Penalty
Write-Host "TEST 6: Test FIXED Penalty (10 TND per day)"
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

$contract = Invoke-RestMethod -Uri "http://localhost:8083/api/contrats/1" -Method Put -Body $fixedBody -ContentType "application/json"
Write-Host "Contract updated to FIXED penalty"
$result = Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/calculate/$paymentId" -Method Post
$payment = Invoke-RestMethod -Uri "http://localhost:8083/api/echeanciers/$paymentId" -Method Get
Write-Host "New Penalty: $($payment.penaltyAmount) TND (Days: $($payment.daysOverdue))"
Write-Host ""

# Test 7: TIERED Penalty
Write-Host "TEST 7: Test TIERED Penalty"
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

$contract = Invoke-RestMethod -Uri "http://localhost:8083/api/contrats/1" -Method Put -Body $tieredBody -ContentType "application/json"
Write-Host "Contract updated to TIERED penalty (0-30d: 2%, 31-60d: 5%, 61+d: 10%)"
$result = Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/calculate/$paymentId" -Method Post
$payment = Invoke-RestMethod -Uri "http://localhost:8083/api/echeanciers/$paymentId" -Method Get
Write-Host "New Penalty: $($payment.penaltyAmount) TND (Days: $($payment.daysOverdue))"
Write-Host ""

# Test 8: Batch Calculation
Write-Host "TEST 8: Batch Penalty Calculation"
$result = Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/calculate-all" -Method Post
Write-Host "Payments marked overdue: $($result.paymentsMarkedOverdue)"
Write-Host "Penalties updated: $($result.penaltiesUpdated)"
Write-Host ""

# Test 9: Daily Job
Write-Host "TEST 9: Manual Daily Job Trigger"
$result = Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/run-daily-job" -Method Post
Write-Host "Payments marked overdue: $($result.paymentsMarkedOverdue)"
Write-Host "Penalties updated: $($result.penaltiesUpdated)"
Write-Host ""

# Final History
Write-Host "TEST 10: Final Penalty History"
$history = Invoke-RestMethod -Uri "http://localhost:8083/api/penalties/history/$paymentId" -Method Get
Write-Host "Total history entries: $($history.Count)"
Write-Host "Penalty Progression:"
foreach ($entry in $history | Sort-Object -Property calculationDate) {
    Write-Host "  $($entry.calculationDate): $($entry.penaltyAmount) TND ($($entry.calculationMethod))"
}
Write-Host ""

Write-Host "========================================"
Write-Host "All Tests Completed!"
Write-Host "========================================"
