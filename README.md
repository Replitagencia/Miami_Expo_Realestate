# Migración de Expo Miami Real Estate a DigitalOcean

Guía para llevar el proyecto desde Replit a DigitalOcean usando:

- DigitalOcean App Platform para el frontend y el API.
- DigitalOcean Managed PostgreSQL para la base de datos.
- DigitalOcean Spaces para imágenes y archivos.
- Un dominio propio opcional.

La aplicación actual es un monorepo PNPM con dos servicios principales:

```text
artifacts/expo-miami/  → frontend React + Vite
artifacts/api-server/  → API Express
lib/db/                → esquema y conexión PostgreSQL
attached_assets/       → assets incluidos en el código
```

## Inicio local

Requisitos ya previstos en este proyecto: Node.js 24 o superior, PNPM y
PostgreSQL. El comando local utiliza por defecto la base de datos
`expo_miami_local` en `127.0.0.1:5432`.

```bash
pnpm install --frozen-lockfile
createdb expo_miami_local
pnpm run dev:local
```

Abre `http://localhost:5173`. El API se ejecuta en `http://localhost:8080` y
queda disponible mediante el proxy de Vite en `/api`. El arranque crea el
esquema y los datos iniciales. Para el panel, usa `admin` y la contraseña local
`local-admin` (puedes reemplazarla con `ADMIN_PASSWORD` antes de ejecutar el
comando).

Las ediciones de textos, los leads y el panel funcionan localmente. Las subidas
de imágenes todavía requieren sustituir `objectStorage.ts`, que depende del
servicio de Object Storage de Replit; esa adaptación será necesaria tanto en
local como antes de desplegar en DigitalOcean.

## 1. Qué se conserva y qué cambia

### Se conserva

- El frontend y sus rutas.
- El panel `/admin`.
- El API y sus endpoints.
- El esquema Drizzle de PostgreSQL.
- Los assets dentro de `attached_assets/`.
- El login del administrador.
- El formulario de leads.
- Los emails de Gmail, después de configurar sus Secrets.

### Se reemplaza

- Workflows de Replit por servicios de DigitalOcean.
- Replit PostgreSQL por Managed PostgreSQL.
- Replit Object Storage por DigitalOcean Spaces.
- `.replit` y los archivos `artifact.toml` dejan de ser necesarios para el despliegue.

## 2. Advertencia importante sobre Object Storage

El archivo actual:

```text
artifacts/api-server/src/lib/objectStorage.ts
```

utiliza el servicio lateral de Object Storage de Replit mediante `127.0.0.1:1106`.
Ese servicio no existe en DigitalOcean.

Antes de publicar en DigitalOcean, hay que reemplazar esa implementación por una
integración con DigitalOcean Spaces, que es compatible con S3. El código debe:

1. Subir imágenes a Spaces.
2. Generar URLs firmadas para las subidas del panel.
3. Servir o devolver las URLs públicas de las imágenes.
4. Mantener las rutas que actualmente usa el panel de administración.

Las imágenes que estaban almacenadas en Replit Object Storage también deben copiarse
a Spaces. No viajan dentro del ZIP del código.

## 3. Preparar el código

Sube el proyecto a un repositorio privado de GitHub o GitLab. También puedes usar el
ZIP de exportación, descomprimirlo localmente y subir su contenido a un repositorio.

No subas:

- Secrets.
- Archivos `.env`.
- `node_modules`.
- El directorio `.git` del Replit original.
- Credenciales de DigitalOcean Spaces.

Instala las dependencias localmente para comprobar que el código está completo:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run typecheck
```

El proyecto usa actualmente PNPM `10.26.1` y Node.js 24.

## 4. Crear PostgreSQL en DigitalOcean

1. En DigitalOcean, crea un clúster de **Managed PostgreSQL**.
2. Elige la región más cercana a los usuarios y a los servicios de App Platform.
3. Crea una base de datos para la aplicación.
4. Copia la cadena de conexión privada que entrega DigitalOcean.
5. Configúrala como `DATABASE_URL` en los servicios de App Platform.

No uses la URL pública si el API y la base de datos están en la misma región de
DigitalOcean.

Después de crear el servicio del API, ejecuta una vez:

```bash
pnpm install --frozen-lockfile
pnpm --filter @workspace/db run push
```

El servidor ejecuta `seedDatabase()` al arrancar. Esto crea:

- El usuario administrador.
- Los textos iniciales del sitio.
- Los valores iniciales de las secciones editables.

Los leads y personalizaciones de la base de datos anterior no se copian solos.

## 5. Crear DigitalOcean Spaces

1. Crea un Space en DigitalOcean.
2. Elige la misma región que PostgreSQL y App Platform si es posible.
3. Crea una clave de Spaces con permisos limitados al bucket.
4. Configura el bucket según la visibilidad que necesite cada archivo.
5. Copia las credenciales solo a los Secrets de DigitalOcean.

Variables recomendadas:

| Variable | Descripción |
|---|---|
| `SPACES_ENDPOINT` | Endpoint S3 de la región, por ejemplo `https://nyc3.digitaloceanspaces.com`. |
| `SPACES_REGION` | Región de Spaces, por ejemplo `nyc3`. |
| `SPACES_BUCKET` | Nombre del Space. |
| `SPACES_ACCESS_KEY` | Access key de Spaces. |
| `SPACES_SECRET_KEY` | Secret key de Spaces. |
| `PUBLIC_OBJECT_SEARCH_PATHS` | Rutas públicas usadas por el sitio, si se conserva ese concepto. |
| `PRIVATE_OBJECT_DIR` | Directorio privado usado para imágenes del panel, si se conserva ese concepto. |

Los nombres exactos pueden cambiar al implementar el adaptador S3. Lo importante es
no reutilizar el endpoint ni las credenciales internas de Replit.

## 6. Crear el servicio del API en App Platform

Configura un componente de tipo **Web Service** conectado al mismo repositorio.

### Directorio fuente

```text
/
```

El servicio necesita acceso al monorepo completo porque usa paquetes dentro de `lib/`.

### Comando de build

```bash
corepack enable && pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build
```

### Comando de ejecución

```bash
node --enable-source-maps artifacts/api-server/dist/index.mjs
```

### Puerto

Usa el puerto entregado por la variable `PORT` de App Platform.
El código actual ya exige que `PORT` esté definido.

### Health check

```text
/api/healthz
```

### Variables no secretas

```text
NODE_ENV=production
ADMIN_USERNAME=admin
```

### Secrets del API

Configura estos valores desde el panel de App Platform, nunca dentro del repositorio:

```text
DATABASE_URL
ADMIN_PASSWORD
JWT_SECRET
GMAIL_USER
GMAIL_APP_PASSWORD
SPACES_ENDPOINT
SPACES_REGION
SPACES_BUCKET
SPACES_ACCESS_KEY
SPACES_SECRET_KEY
PUBLIC_OBJECT_SEARCH_PATHS
PRIVATE_OBJECT_DIR
```

`GMAIL_USER` y `GMAIL_APP_PASSWORD` son opcionales. Sin ellos, los leads se guardan,
pero no se envían emails.

## 7. Crear el frontend en App Platform

Configura un componente de tipo **Static Site** conectado al mismo repositorio.

### Directorio fuente

```text
/
```

### Comando de build

```bash
corepack enable && pnpm install --frozen-lockfile && pnpm --filter @workspace/expo-miami run build
```

### Directorio de publicación

```text
artifacts/expo-miami/dist/public
```

### Variable de build

```text
BASE_PATH=/
```

### Enrutamiento SPA

Configura una regla para que las rutas que no correspondan a un archivo estático
devuelvan:

```text
/index.html
```

Esto es necesario para que funcionen `/admin`, `/admin/dashboard`, `/admin/leads`
y las demás rutas al recargar la página.

## 8. Conectar el frontend con el API

La configuración actual usa rutas relativas como `/api/...`. La opción recomendada es
publicar ambos servicios bajo el mismo dominio:

```text
https://www.expomiamirealestate.com/       → frontend
https://www.expomiamirealestate.com/api/   → API
```

Si se usa un dominio separado para el API, hay que configurar una URL base en el
cliente React y permitir explícitamente ese origen en CORS. En ese caso, no dejes
`cors()` abierto para producción.

La opción de mismo dominio requiere menos cambios y evita problemas con cookies,
tokens y CORS.

## 9. Migrar el dominio

Cuando ambos servicios funcionen en sus dominios temporales:

1. Añade el dominio en DigitalOcean App Platform.
2. Configura los registros DNS que indique DigitalOcean.
3. Espera a que el certificado HTTPS quede activo.
4. Comprueba que estas URLs responden:

```text
https://tudominio.com/
https://tudominio.com/admin
https://tudominio.com/api/healthz
```

Después, actualiza desde el panel la URL canónica del sitio si sigue apuntando a la
URL anterior.

## 10. Migrar los datos actuales

El código no contiene los datos actuales de Replit. Antes de apagar el proyecto
original:

### Leads

1. Entra a `/admin/leads`.
2. Usa la opción de exportar CSV.
3. Importa los leads en PostgreSQL de DigitalOcean mediante un script de migración o
   una importación controlada.

### Textos y configuración

1. Entra a `/admin/texts`.
2. Copia los textos personalizados.
3. Después del primer arranque, vuelve a guardarlos en el panel nuevo.

### Imágenes

1. Descarga las imágenes desde `/admin/images` o desde el bucket original.
2. Súbelas al nuevo Space.
3. Comprueba que cada imagen aparece en el sitio público.

### Usuario administrador

El usuario inicial será:

```text
Usuario: admin
Contraseña: valor de ADMIN_PASSWORD
```

Usa una contraseña nueva y segura en DigitalOcean. No la pongas en este archivo ni
en el repositorio.

## 11. Configuración del cron de emails

El API actual programa una comprobación diaria a las 09:00 de Nueva York.

Si App Platform ejecuta una sola instancia del API, puede mantenerse así.
Si se habilitan varias instancias, cada instancia podría ejecutar el mismo cron y
enviar emails duplicados.

En ese caso, usa una de estas opciones:

- Mantener una sola instancia del API.
- Mover el cron a DigitalOcean Functions o a un cron externo.
- Añadir un mecanismo de bloqueo distribuido en PostgreSQL.

## 12. Comprobación final

Antes de cambiar el DNS, valida:

- [ ] La página principal carga correctamente.
- [ ] Las rutas del frontend funcionan al recargar.
- [ ] `/api/healthz` responde correctamente.
- [ ] El login de `/admin` funciona.
- [ ] Cerrar sesión elimina el acceso al panel.
- [ ] Al cerrar y volver a abrir el navegador, se solicita login.
- [ ] El formulario público guarda un lead.
- [ ] Los emails de Gmail llegan correctamente, si están configurados.
- [ ] El dashboard muestra estadísticas.
- [ ] La exportación CSV funciona.
- [ ] Las imágenes del panel se pueden subir.
- [ ] Las imágenes aparecen en el sitio público.
- [ ] PostgreSQL tiene los datos esperados.
- [ ] HTTPS está activo.
- [ ] No hay Secrets dentro del repositorio.

## 13. Alternativa: DigitalOcean Droplet

También es posible usar un Droplet, pero requiere más mantenimiento:

- Instalar Node.js, PNPM y Nginx.
- Ejecutar el API con PM2 o systemd.
- Servir el frontend compilado con Nginx.
- Configurar Nginx para enviar `/api` al proceso Node.
- Configurar HTTPS con Let's Encrypt.
- Configurar backups de PostgreSQL y monitoreo.

Para este proyecto, App Platform es la opción más sencilla porque evita administrar
manualmente el servidor, los procesos y los certificados.

## 14. Archivos específicos de Replit

Estos archivos pueden permanecer en el repositorio si se quiere conservar la
posibilidad de volver a ejecutar el proyecto en Replit:

```text
.replit
.replitignore
artifacts/api-server/.replit-artifact/artifact.toml
artifacts/expo-miami/.replit-artifact/artifact.toml
artifacts/mockup-sandbox/.replit-artifact/artifact.toml
```

DigitalOcean no los utiliza. No deben usarse para configurar PostgreSQL, Spaces,
dominios o procesos en producción.
