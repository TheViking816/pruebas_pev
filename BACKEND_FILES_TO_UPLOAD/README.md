# 📦 Archivos para subir al Backend.

Estos archivos deben subirse al repositorio: `portalestiba-push-backend-one`

## 📁 Estructura:

```
portalestiba-push-backend-one/
├── api/
│   ├── create-checkout-session.js  ← SUBIR ESTE
│   ├── stripe-webhook.js           ← SUBIR ESTE
│   └── push/
│       └── ... (archivos existentes)
├── package.json                     ← ACTUALIZAR ESTE
└── vercel.json
```

## 🚀 Pasos para subir:

### Opción A: Si tienes el repo clonado localmente

1. Copia los archivos de `BACKEND_FILES_TO_UPLOAD/api/` a `tu-backend/api/`
2. Actualiza `package.json` con las dependencias nuevas:
   ```json
   "dependencies": {
     "stripe": "^14.0.0",
     "@supabase/supabase-js": "^2.38.0"
   }
   ```
3. Commit y push:
   ```bash
   cd portalestiba-push-backend-one
   git add api/create-checkout-session.js api/stripe-webhook.js package.json
   git commit -m "feat: Add Stripe checkout and webhook endpoints"
   git push origin main
   ```

### Opción B: Si NO tienes el repo clonado

1. Ve a GitHub: https://github.com/TheViking816/portalestiba-push-backend-one
2. Navega a la carpeta `api/`
3. Click en "Add file" > "Create new file"
4. Nombre: `create-checkout-session.js`
5. Copia el contenido de `BACKEND_FILES_TO_UPLOAD/api/create-checkout-session.js`
6. Click "Commit changes"
7. Repite con `stripe-webhook.js`

## ⚙️ Variables de entorno en Vercel

Asegúrate de que estas variables estén configuradas:

```env
STRIPE_SECRET_KEY=sk_test_... (o sk_live_... en producción)
STRIPE_PRICE_ID=price_test_... (o price_... en producción)
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
FRONTEND_URL=https://portalestibavlc.netlify.app
```

## ✅ Verificar que funciona:

Después de subir los archivos y hacer deploy:

1. Ir a: https://portalestiba-push-backend-one.vercel.app/api/stripe-webhook
   - Debería devolver: `{"error":"Method not allowed"}` (es correcto, solo acepta POST)

2. Probar un pago en la app con tarjeta de test

3. Ver en Stripe Dashboard > Webhooks que los eventos se reciben con ✅

---

**Creado:** 2025-12-09
