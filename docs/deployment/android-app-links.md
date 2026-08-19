# Android App Links

La app usa React Navigation y conserva el esquema existente `cuentasclaras://` como fallback. Los enlaces HTTPS verificados son:

- `https://cuentas-claras-app.com/verify-email?token=TOKEN`
- `https://cuentas-claras-app.com/reset-password?token=TOKEN`

El package Android configurado en `app.json` es `com.cuentasclaras.app`.

## Configurar `assetlinks.json`

El archivo debe publicarse en el dominio web (no en la API) exactamente en:

```text
https://cuentas-claras-app.com/.well-known/assetlinks.json
```

`docs/deployment/assetlinks.json` contiene la configuración real para la APK local generada en esta sesión. `docs/deployment/assetlinks.json.template` sirve como plantilla para otras firmas. Si se genera otra APK con un certificado diferente, hay que agregar su huella real; no usar una huella inventada.

### Obtener la huella de EAS

1. Ejecutar `pnpm dlx eas-cli@latest credentials --platform android` y consultar las credenciales Android del perfil que firma la build, o revisar **Expo Dashboard → Project → Credentials → Android**.
2. Copiar la huella SHA-256 del certificado de firma en formato hexadecimal separado por dos puntos. La APK local actual fue firmada con `0F:1F:EE:EC:9F:0F:62:E4:EB:FF:43:33:2C:D0:8C:C3:BE:C0:E1:F6:2D:33:74:1F:76:70:BA:72:2D:CB:24:99`.
3. Si se usa una keystore local, obtenerla con:

```bash
keytool -list -v -keystore /ruta/al/keystore.jks -alias ALIAS \
  | grep 'SHA256:'
```

Si la APK se distribuye mediante Google Play, verificar también el certificado de **App signing** en Play Console. El fingerprint debe corresponder al certificado que realmente firma la APK que se instala en el dispositivo.

### Validar el dominio

Después de publicar el archivo, comprobarlo con:

```bash
curl -fsSL https://cuentas-claras-app.com/.well-known/assetlinks.json
```

Luego instalar una nueva build (los `intentFilters` requieren rebuild nativo) y probar los dos enlaces HTTPS en un dispositivo Android físico.

## API

Configurar `EXPO_PUBLIC_API_URL` en el entorno EAS usado para la build con exactamente:

```text
https://api.cuentas-claras-app.com
```

La app agrega `/api/v1` desde `src/shared/api/client.ts`; por eso no se debe configurar la variable con ese sufijo.

## Builds y pruebas

APK de prueba con el perfil interno:

```bash
pnpm dlx eas-cli@latest build --platform android --profile preview
```

AAB para producción:

```bash
pnpm dlx eas-cli@latest build --platform android --profile production
```

Para probar un build local con una URL explícita sin modificar archivos de configuración:

```bash
EXPO_PUBLIC_API_URL=https://api.cuentas-claras-app.com \
  pnpm dlx eas-cli@latest build --platform android --profile preview --local
```

Abrir en el dispositivo:

```text
https://cuentas-claras-app.com/verify-email?token=TOKEN_REAL
https://cuentas-claras-app.com/reset-password?token=TOKEN_REAL
```

Los tokens reales deben provenir de los emails generados por el backend. La app mostrará un error si faltan, vencieron, fueron consumidos o falla la conexión.
