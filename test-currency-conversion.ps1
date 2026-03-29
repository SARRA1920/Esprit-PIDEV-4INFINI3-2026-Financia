# Test Currency Conversion in Email
# Creates a contract with USD currency to show conversion

$baseUrl = "http://localhost:8083/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Currency Conversion Email Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create Credit for User 2
Write-Host "STEP 1: Creating Credit for User 2..." -ForegroundColor Yellow
$creditBody = @{
    amount = 5000.0
    interestRate = 6.5
    durationMonths = 24
    startDate = "2026-03-29"
    endDate = "2028-03-29"
    status = "APPROVED"
    riskScore = 80.0
} | ConvertTo-Json

$creditResponse = Invoke-RestMethod -Uri "$baseUrl/credits/user/2" -Method Post -Body $creditBody -ContentType "application/json"
$creditId = $creditResponse.id
Write-Host "Credit Created: ID = $creditId" -ForegroundColor Green
Write-Host ""

# Step 2: Create Contract with USD currency
Write-Host "STEP 2: Creating Contract with USD Currency..." -ForegroundColor Yellow
Write-Host "  Currency: USD (will be converted to TND)" -ForegroundColor Cyan
Write-Host ""

$contractBody = @{
    signedDate = "2026-03-29"
    amount = 5000.0
    rate = 6.5
    duration = 24
    status = "ACTIVE"
    version = "2.0"
    type = "INITIAL"
    currency = "USD"
    penaltyRate = 3.0
    penaltyType = "PERCENTAGE"
    gracePeriodDays = 5
} | ConvertTo-Json

try {
    $contractResponse = Invoke-RestMethod -Uri "$baseUrl/contrats/credit/$creditId" -Method Post -Body $contractBody -ContentType "application/json"
    $contractId = $contractResponse.id
    
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  CONTRACT CREATED WITH CONVERSION!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Contract ID: $contractId" -ForegroundColor Green
    Write-Host "Original Amount: $($contractResponse.originalAmount) USD" -ForegroundColor Cyan
    Write-Host "Converted Amount: $($contractResponse.amountInTND) TND" -ForegroundColor Cyan
    Write-Host "Exchange Rate: 1 USD = $($contractResponse.exchangeRateUsed) TND" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "EMAIL SENT TO: arifaanas83@gmail.com" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Check your email inbox!" -ForegroundColor Yellow
    Write-Host "You should see the currency conversion section showing:" -ForegroundColor White
    Write-Host "  5000 USD = [amount] TND" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host "ERROR creating contract: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Try another currency - EUR
Write-Host "STEP 3: Creating Another Contract with EUR Currency..." -ForegroundColor Yellow

$creditBody2 = @{
    amount = 3000.0
    interestRate = 5.0
    durationMonths = 18
    startDate = "2026-03-29"
    endDate = "2027-09-29"
    status = "APPROVED"
    riskScore = 85.0
} | ConvertTo-Json

$creditResponse2 = Invoke-RestMethod -Uri "$baseUrl/credits/user/2" -Method Post -Body $creditBody2 -ContentType "application/json"
$creditId2 = $creditResponse2.id

$contractBody2 = @{
    signedDate = "2026-03-29"
    amount = 3000.0
    rate = 5.0
    duration = 18
    status = "ACTIVE"
    version = "1.0"
    type = "RENEWAL"
    currency = "EUR"
    penaltyRate = 4.0
    penaltyType = "PERCENTAGE"
    gracePeriodDays = 7
} | ConvertTo-Json

try {
    $contractResponse2 = Invoke-RestMethod -Uri "$baseUrl/contrats/credit/$creditId2" -Method Post -Body $contractBody2 -ContentType "application/json"
    $contractId2 = $contractResponse2.id
    
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SECOND CONTRACT CREATED!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Contract ID: $contractId2" -ForegroundColor Green
    Write-Host "Original Amount: $($contractResponse2.originalAmount) EUR" -ForegroundColor Cyan
    Write-Host "Converted Amount: $($contractResponse2.amountInTND) TND" -ForegroundColor Cyan
    Write-Host "Exchange Rate: 1 EUR = $($contractResponse2.exchangeRateUsed) TND" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "ANOTHER EMAIL SENT!" -ForegroundColor Magenta
    Write-Host ""
    
} catch {
    Write-Host "ERROR creating second contract: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST COMPLETED!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor White
Write-Host "  2 contracts created with currency conversion" -ForegroundColor White
Write-Host "  Contract 1: USD -> TND" -ForegroundColor White
Write-Host "  Contract 2: EUR -> TND" -ForegroundColor White
Write-Host ""
Write-Host "Check your email (arifaanas83@gmail.com) for both contracts!" -ForegroundColor Yellow
Write-Host "Both emails should show the currency conversion section." -ForegroundColor Yellow
Write-Host ""
