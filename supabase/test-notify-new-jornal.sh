#!/bin/bash

# ============================================================================
# SCRIPT DE PRUEBA PARA EDGE FUNCTION notify-new-jornal
# ============================================================================
# Este script prueba la edge function enviándole un payload correcto
# con datos de un jornal de prueba
#
# REQUISITOS:
# - Edge function 'notify-new-jornal' desplegada
# - Tu chapa debe tener suscripción activa en push_subscriptions
# ============================================================================

# Configuración
PROJECT_ID="icszzxkdxatfytpmoviq"
FUNCTION_NAME="notify-new-jornal"
SERVICE_ROLE_KEY="TU_SERVICE_ROLE_KEY_AQUI"  # ⚠️ REEMPLAZA CON TU CLAVE

# Tu chapa para testing (REEMPLAZA CON TU CHAPA REAL)
TEST_CHAPA="816"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Probando Edge Function: notify-new-jornal${NC}"
echo ""

# Payload de prueba con estructura correcta
PAYLOAD=$(cat <<EOF
{
  "type": "INSERT",
  "table": "jornales",
  "record": {
    "id": 999999,
    "chapa": "${TEST_CHAPA}",
    "fecha": "$(date +%Y-%m-%d)",
    "jornada": "08-14",
    "puesto": "Gruista",
    "empresa": "MSC",
    "buque": "BUQUE DE PRUEBA",
    "parte": "1",
    "origen": "importacion"
  }
}
EOF
)

echo -e "${YELLOW}📦 Payload a enviar:${NC}"
echo "$PAYLOAD" | jq '.'
echo ""

echo -e "${YELLOW}📤 Enviando request a edge function...${NC}"
echo ""

# Hacer la petición
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "https://${PROJECT_ID}.supabase.co/functions/v1/${FUNCTION_NAME}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -d "$PAYLOAD")

# Extraer código HTTP y body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo -e "${YELLOW}📥 Respuesta recibida:${NC}"
echo "HTTP Status: $HTTP_CODE"
echo "Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Verificar resultado
if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ Edge function ejecutada exitosamente${NC}"
  echo -e "${GREEN}🔔 Deberías recibir una notificación push en tu dispositivo${NC}"
else
  echo -e "${RED}❌ Error: HTTP $HTTP_CODE${NC}"
  echo -e "${RED}Verifica los logs en: https://supabase.com/dashboard/project/${PROJECT_ID}/functions/${FUNCTION_NAME}/logs${NC}"
fi

echo ""
echo -e "${YELLOW}📊 Para ver los logs detallados:${NC}"
echo "https://supabase.com/dashboard/project/${PROJECT_ID}/functions/${FUNCTION_NAME}/logs"
