# PRUEBA DIRECTA DE EDGE FUNCTION
# Este script llama DIRECTAMENTE a la edge function para verificar que funciona

$PROJECT_ID = "icszzxkdxatfytpmoviq"
$FUNCTION_NAME = "notify-new-jornal"
$SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljc3p6eGtkeGF0Znl0cG1vdmlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYzOTY2NSwiZXhwIjoyMDc4MjE1NjY1fQ.LnNbC1ndNvSTSlwYYbcZwXM3iF30IqB5m6mII7IA50I"

Write-Host ""
Write-Host "PRUEBA DIRECTA DE EDGE FUNCTION" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Payload de prueba
$payloadObj = @{
    type = "INSERT"
    table = "jornales"
    record = @{
        id = 999999
        chapa = "816"
        fecha = (Get-Date -Format "yyyy-MM-dd")
        jornada = "20 a 02"
        puesto = "Gruista PRUEBA DIRECTA"
        empresa = "MSC"
        buque = "PRUEBA CURL DIRECTA"
        parte = "999"
        origen = "https://test.com"
    }
}

$payload = $payloadObj | ConvertTo-Json -Depth 10

Write-Host "Payload:" -ForegroundColor Yellow
Write-Host $payload
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
    $response = Invoke-WebRequest -Uri $url -Method Post -Headers $headers -Body $payload -UseBasicParsing

    Write-Host "RESPUESTA RECIBIDA:" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Body:"
    Write-Host $response.Content
    Write-Host ""

    if ($response.StatusCode -eq 200) {
        Write-Host "LA EDGE FUNCTION FUNCIONA CORRECTAMENTE" -ForegroundColor Green
        Write-Host "Deberias haber recibido la notificacion AHORA MISMO" -ForegroundColor Green
        Write-Host ""
        Write-Host "Si NO recibiste notificacion, el problema esta en:" -ForegroundColor Yellow
        Write-Host "  1. La suscripcion de push (revisar push_subscriptions)" -ForegroundColor Yellow
        Write-Host "  2. El backend de Vercel" -ForegroundColor Yellow
        Write-Host "  3. FCM (Firebase Cloud Messaging)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR:" -ForegroundColor Red
    Write-Host $_.Exception.Message
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
Write-Host "Ver logs de la edge function:" -ForegroundColor Cyan
Write-Host "https://supabase.com/dashboard/project/$PROJECT_ID/functions/notify-new-jornal/logs"
Write-Host ""
Write-Host "Ver logs del backend Vercel:" -ForegroundColor Cyan
Write-Host "https://vercel.com/portalestiba-push-backend-one/deployments"
Write-Host ""
