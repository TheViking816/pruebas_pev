# ============================================================================
# SCRIPT DE PRUEBA PARA EDGE FUNCTION notify-new-jornal (PowerShell)
# ============================================================================
# Este script prueba la edge function enviándole un payload correcto
# con datos de un jornal de prueba
#
# REQUISITOS:
# - Edge function 'notify-new-jornal' desplegada
# - Tu chapa debe tener suscripción activa en push_subscriptions
# ============================================================================

# Configuración
$PROJECT_ID = "icszzxkdxatfytpmoviq"
$FUNCTION_NAME = "notify-new-jornal"
$SERVICE_ROLE_KEY = "TU_SERVICE_ROLE_KEY_AQUI"  # ⚠️ REEMPLAZA CON TU CLAVE

# Tu chapa para testing (REEMPLAZA CON TU CHAPA REAL)
$TEST_CHAPA = "816"

Write-Host "🧪 Probando Edge Function: notify-new-jornal" -ForegroundColor Yellow
Write-Host ""

# Payload de prueba con estructura correcta
$fecha_hoy = Get-Date -Format "yyyy-MM-dd"
$payload = @{
    type = "INSERT"
    table = "jornales"
    record = @{
        id = 999999
        chapa = $TEST_CHAPA
        fecha = $fecha_hoy
        jornada = "08-14"
        puesto = "Gruista"
        empresa = "MSC"
        buque = "BUQUE DE PRUEBA"
        parte = "1"
        origen = "importacion"
    }
} | ConvertTo-Json -Depth 10

Write-Host "📦 Payload a enviar:" -ForegroundColor Yellow
Write-Host $payload
Write-Host ""

Write-Host "📤 Enviando request a edge function..." -ForegroundColor Yellow
Write-Host ""

# Hacer la petición
$url = "https://$PROJECT_ID.supabase.co/functions/v1/$FUNCTION_NAME"
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $SERVICE_ROLE_KEY"
}

try {
    $response = Invoke-WebRequest -Uri $url -Method Post -Headers $headers -Body $payload

    Write-Host "📥 Respuesta recibida:" -ForegroundColor Yellow
    Write-Host "HTTP Status: $($response.StatusCode)"
    Write-Host "Body:"
    Write-Host $response.Content
    Write-Host ""

    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Edge function ejecutada exitosamente" -ForegroundColor Green
        Write-Host "🔔 Deberías recibir una notificación push en tu dispositivo" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifica los logs en:" -ForegroundColor Red
    Write-Host "https://supabase.com/dashboard/project/$PROJECT_ID/functions/$FUNCTION_NAME/logs"
}

Write-Host ""
Write-Host "📊 Para ver los logs detallados:" -ForegroundColor Yellow
Write-Host "https://supabase.com/dashboard/project/$PROJECT_ID/functions/$FUNCTION_NAME/logs"
