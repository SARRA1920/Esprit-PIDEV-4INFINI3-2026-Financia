# Apply Database Fix for Penalty Feature
# This script will fix the status column size issue

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database Fix for Penalty Feature" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Database connection details
$dbHost = "localhost"
$dbPort = "3306"
$dbName = "Financia"
$dbUser = "root"
$dbPassword = ""

Write-Host "Attempting to fix the status column size..." -ForegroundColor Yellow
Write-Host ""

# SQL to fix the column
$sql = @"
ALTER TABLE echeancier_payement MODIFY COLUMN status VARCHAR(20) NOT NULL;
"@

Write-Host "SQL Command to execute:" -ForegroundColor White
Write-Host $sql -ForegroundColor Gray
Write-Host ""

# Try to execute using mysql command line
$mysqlPath = "mysql"

try {
    if ($dbPassword -eq "") {
        $command = "echo `"$sql`" | $mysqlPath -h $dbHost -P $dbPort -u $dbUser $dbName"
    } else {
        $command = "echo `"$sql`" | $mysqlPath -h $dbHost -P $dbPort -u $dbUser -p$dbPassword $dbName"
    }
    
    Write-Host "Executing SQL fix..." -ForegroundColor Yellow
    Invoke-Expression $command
    
    Write-Host ""
    Write-Host "✓ Database fix applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Restart your Spring Boot application" -ForegroundColor White
    Write-Host "2. Test in Swagger: http://localhost:8083/swagger-ui.html" -ForegroundColor White
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "✗ Could not execute SQL automatically" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please execute this SQL manually in your database tool:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host $sql -ForegroundColor White
    Write-Host ""
    Write-Host "You can use:" -ForegroundColor Cyan
    Write-Host "- MySQL Workbench" -ForegroundColor White
    Write-Host "- phpMyAdmin" -ForegroundColor White
    Write-Host "- DBeaver" -ForegroundColor White
    Write-Host "- Command line: mysql -u root Financia" -ForegroundColor White
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
