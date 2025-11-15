Write-Host "Stopping MTG Bot Services..." -ForegroundColor Red

$processes = @(
    @{Name = "node"; Port = 5173; Service = "Frontend"},
    @{Name = "node"; Port = 3001; Service = "Backend"},
    @{Name = "python"; Port = 8000; Service = "AI"}
)

foreach ($proc in $processes) {
    Write-Host "Stopping $($proc.Service)..." -ForegroundColor Yellow
    
    if ($proc.Name -eq "node") {
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    } elseif ($proc.Name -eq "python") {
        Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "All services stopped!" -ForegroundColor Green
Write-Host "You can now close the PowerShell windows or they will close automatically." -ForegroundColor Cyan
