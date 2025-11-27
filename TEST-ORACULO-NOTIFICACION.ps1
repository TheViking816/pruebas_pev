# PRUEBA DIRECTA DE NOTIFICACIONES DEL ORACULO
# Este script llama DIRECTAMENTE a la edge function de oracle para verificar que funciona

$PROJECT_ID = "icszzxkdxatfytpmoviq"
$FUNCTION_NAME = "daily-oracle-notifications"
$SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljc3p6eGtkeGF0Znl0cG1vdmlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYzOTY2NSwiZXhwIjoyMDc4MjE1NjY1fQ.LnNbC1ndNvSTSlwYYbcZwXM3iF30IqB5m6mII7IA50I"

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  PRUEBA DE NOTIFICACIONES DIARIAS DEL ORACULO" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Esta funcion:" -ForegroundColor Yellow
Write-Host "  1. Obtiene datos de Noray (scraper)" -ForegroundColor Yellow
Write-Host "  2. Obtiene todos los usuarios suscritos" -ForegroundColor Yellow
Write-Host "  3. Calcula probabilidad para cada usuario" -ForegroundColor Yellow
Write-Host "  4. Envia notificacion a CADA usuario suscrito" -ForegroundColor Yellow
Write-Host ""

$url = "https://$PROJECT_ID.supabase.co/functions/v1/$FUNCTION_NAME"
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $SERVICE_ROLE_KEY"
}

Write-Host "Llamando a edge function..." -ForegroundColor Yellow
Write-Host "URL: $url" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $url -Method Post -Headers $headers -Body '{}' -UseBasicParsing

    Write-Host "=====================================================" -ForegroundColor Green
    Write-Host "  RESPUESTA RECIBIDA" -ForegroundColor Green
    Write-Host "=====================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Body:" -ForegroundColor White
    $responseObj = $response.Content | ConvertFrom-Json
    Write-Host ($responseObj | ConvertTo-Json -Depth 10)
    Write-Host ""

    if ($response.StatusCode -eq 200) {
        Write-Host "=====================================================" -ForegroundColor Green
        Write-Host "  NOTIFICACIONES ENVIADAS CORRECTAMENTE" -ForegroundColor Green
        Write-Host "=====================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Total usuarios: $($responseObj.total)" -ForegroundColor Cyan
        Write-Host "Notificaciones enviadas: $($responseObj.sent)" -ForegroundColor Green
        Write-Host "Notificaciones fallidas: $($responseObj.failed)" -ForegroundColor Red
        Write-Host ""

        if ($responseObj.sent -gt 0) {
            Write-Host "Deberias haber recibido la notificacion AHORA MISMO" -ForegroundColor Green
            Write-Host ""
            Write-Host "Si NO recibiste notificacion, verifica:" -ForegroundColor Yellow
            Write-Host "  1. Que tu chapa (816) este en push_subscriptions" -ForegroundColor Yellow
            Write-Host "  2. Logs del backend Vercel" -ForegroundColor Yellow
            Write-Host "  3. Permisos de notificaciones en tu navegador/dispositivo" -ForegroundColor Yellow
        } else {
            Write-Host "No se enviaron notificaciones." -ForegroundColor Yellow
            Write-Host "Posibles razones:" -ForegroundColor Yellow
            Write-Host "  - No hay usuarios suscritos (push_subscriptions vacia)" -ForegroundColor Yellow
            Write-Host "  - Error obteniendo datos del scraper" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "=====================================================" -ForegroundColor Red
    Write-Host "  ERROR" -ForegroundColor Red
    Write-Host "=====================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""

    if ($_.Exception.Response) {
        try {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            Write-Host "Response Body:" -ForegroundColor Red
            Write-Host $errorBody
        } catch {
            Write-Host "No se pudo leer el error body"
        }
    }
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  ENLACES UTILES" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ver logs de la edge function:" -ForegroundColor White
Write-Host "https://supabase.com/dashboard/project/$PROJECT_ID/functions/daily-oracle-notifications/logs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ver logs del backend Vercel:" -ForegroundColor White
Write-Host "https://vercel.com/portalestiba-push-backend-one/deployments" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ver suscripciones activas (SQL):" -ForegroundColor White
Write-Host "SELECT * FROM push_subscriptions;" -ForegroundColor Gray
Write-Host ""
