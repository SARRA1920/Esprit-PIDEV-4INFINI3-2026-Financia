# Check SMS Service Logs
$baseUrl = "http://localhost:8083/api"

Write-Host "Checking SMS Service Status..." -ForegroundColor Cyan
Write-Host ""

# Check status
$status = Invoke-RestMethod -Uri "$baseUrl/sms/status" -Method Get
Write-Host "SMS Service Enabled: $($status.enabled)" -ForegroundColor $(if($status.enabled){"Green"}else{"Red"})
Write-Host ""

# Try to send a test SMS
Write-Host "Attempting to send test SMS to +216 20 285 074..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$baseUrl/sms/send-custom?phoneNumber=%2B21620285074&message=Test%20from%20Financia" -Method Post
    Write-Host "Result: $($result.message)" -ForegroundColor Green
    Write-Host "Phone: $($result.phone)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "IMPORTANT: Check your application console logs!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Look for one of these messages:" -ForegroundColor White
Write-Host ""
Write-Host "1. If SMS is SIMULATED (not really sent):" -ForegroundColor Yellow
Write-Host "   'SMS sending is disabled. Would have sent SMS to...'" -ForegroundColor Gray
Write-Host "   '=== SIMULATED SMS ==='" -ForegroundColor Gray
Write-Host ""
Write-Host "2. If SMS is REALLY sent:" -ForegroundColor Green
Write-Host "   'Twilio SMS service initialized successfully'" -ForegroundColor Gray
Write-Host "   'SMS sent successfully to +21620285074 - SID: SMXXXXXXXXX'" -ForegroundColor Gray
Write-Host ""
Write-Host "3. If Twilio FAILED to initialize:" -ForegroundColor Red
Write-Host "   'Failed to initialize Twilio: [error message]'" -ForegroundColor Gray
Write-Host ""
Write-Host "Common Twilio Issues:" -ForegroundColor Yellow
Write-Host "- Invalid Account SID or Auth Token" -ForegroundColor White
Write-Host "- Trial account requires phone number verification" -ForegroundColor White
Write-Host "- Twilio phone number not configured correctly" -ForegroundColor White
Write-Host "- Insufficient Twilio account balance" -ForegroundColor White
Write-Host ""
