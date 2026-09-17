# Expo Miami Real Estate

## Overview

Luxury real estate investment website targeting Spanish high-net-worth investors. Built for SIMA Madrid 2026 event promotion.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + TailwindCSS v4 + shadcn/ui
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (3 tables: leads, site_settings, admin_users)
- **Object Storage**: Replit Object Storage for image uploads
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Auth**: JWT (admin panel)
- **Build**: esbuild (API server), Vite (frontend)

## Architecture

### Artifacts
- **expo-miami** (port 5173, path `/`): React+Vite frontend with landing page and admin panel
- **api-server** (port 8080, path `/api`): Express backend with all API routes
- **mockup-sandbox** (port 8081): Design prototyping server

### Database Schema
- `leads` — captured leads (name, email, phone, capitalRange, investmentStage, source)
- `site_settings` — key-value settings with section/type metadata (text + image)
- `admin_users` — admin credentials (bcrypt-hashed passwords)

### API Routes
- `POST /api/auth/login` — admin JWT login
- `GET /api/auth/me` — current user
- `GET /api/settings` — public settings grouped by section
- `GET /api/admin/settings` — all settings with metadata (auth required)
- `PUT /api/admin/settings` — update text setting (auth required)
- `POST /api/admin/settings/image` — upload image for setting (auth required, multipart)
- `POST /api/leads` — create lead (public)
- `GET /api/admin/leads` — list leads with filters (auth required)
- `GET /api/admin/leads/export` — CSV export (auth required)
- `GET /api/admin/stats` — dashboard stats (auth required)
- `POST /api/storage/uploads/request-url` — presigned upload URL
- `GET /api/storage/public-objects/*` — serve public images

### Frontend Pages
- `/` — Public landing page (9 sections: navbar, hero, metrics, neighborhoods, reasons, agency, SIMA banner, lead form, footer)
- `/admin` — Admin login
- `/admin/dashboard` — Stats + recent leads
- `/admin/leads` — Lead management with filters + CSV export
- `/admin/texts` — Edit text settings by section
- `/admin/images` — Upload/manage images by section

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Admin Credentials

- Username: `admin` (from ADMIN_USERNAME env var)
- Password: from ADMIN_PASSWORD env var

## Email — Gmail App Password (Nodemailer SMTP)

Cuando un lead rellena el formulario se envían dos emails automáticos:
1. **Notificación interna** a `contacto@expomiamirealestate.com` con los datos del lead.
2. **Confirmación al cliente** al email del lead (diseño de marca de lujo, en español).

Si las variables de entorno no están configuradas, los emails se saltan sin errores y los leads se siguen guardando con normalidad.

### Variables de entorno requeridas

| Variable | Descripción |
|---|---|
| `GMAIL_USER` | Dirección Gmail/Workspace: `contacto@expomiamirealestate.com` |
| `GMAIL_APP_PASSWORD` | Contraseña de aplicación de 16 caracteres (ver pasos abajo) |

### Pasos para configurar (sin Google Cloud)

1. Iniciar sesión en [myaccount.google.com](https://myaccount.google.com) con `contacto@expomiamirealestate.com`.
2. Ir a **Seguridad → Verificación en dos pasos** y activarla si no lo está.
3. Volver a **Seguridad** y buscar **"Contraseñas de aplicaciones"** (aparece solo si el paso 2 está activo).
4. Seleccionar aplicación: **Correo** / dispositivo: **Otro** → poner un nombre (ej. "Replit").
5. Google genera una clave de 16 caracteres — copiarla.
6. En Replit, guardar las 2 variables en **Secrets**:
   - `GMAIL_USER` = `contacto@expomiamirealestate.com`
   - `GMAIL_APP_PASSWORD` = la clave de 16 caracteres

## Design System — "Refined Coastal Luxury"

### Color Palette
- **Obsidian** (#0D0D0D) — hero bg, navbar, dark sections
- **Ivory** (#F5F0E8) — light sections background
- **Gold** (#C9A84C) — primary accent, CTAs, logo
- **Gold Light** (#E8C97A) — hover states
- **Gold Dark** (#8B6914) — text on light backgrounds
- **Slate Neutrals** — #F8F7F5, #D4CFC6, #8A8680, #4A4540, #1C1A18

### Typography
- **Display/Hero**: Cormorant Garamond (italic, light weight)
- **Headings/Nav**: Montserrat (uppercase, semibold, wide tracking)
- **Body**: Lato (light/regular weight)
- **Labels/Badges**: DM Mono (widest tracking, uppercase)

### CSS Classes (index.css)
- `.eyebrow` / `.eyebrow-dark` — DM Mono uppercase labels (gold / gold-dark)
- `.h1-display` — Hero headline (Cormorant, italic, clamp sizing)
- `.lead-text` — Lead paragraph (Lato, light, slate-300)
- `.btn-ds-primary` / `.btn-ds-outline` — Gold CTA buttons (no border-radius)
- `.nav-link` — Navbar links with gold underline on hover
- `.stat-number` / `.stat-label` — Stats (Cormorant + DM Mono)
- `.section-ivory` / `.section-dark` / `.section-padding` — Section backgrounds
- `.navbar-glass` — Obsidian glassmorphism navbar
- `.heading-section` — Section h2 (Montserrat uppercase)
- `.gold-line` — Animated shimmer divider
- `.hero-overlay` — Hero gradient overlay
- `.gradient-card-overlay` / `.gradient-bottom-overlay` — Card overlays
- `.sima-bg` / `.sima-text-muted` / `.sima-text-body` — SIMA banner styles

### Animations
- `fadeUp` — IntersectionObserver-triggered entrance (0.8s ease)
- `shimmer` — Gold line infinite shimmer (3s linear)

All content in Spanish.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
