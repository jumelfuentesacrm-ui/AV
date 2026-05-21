# ARCHIVO VIVO

Plataforma digital para Archivo Vivo — proyecto cinematográfico, sartorial y cultural desde Puerto Rico.

## Stack

- **Next.js 14** (App Router + TypeScript)
- **Supabase** (Auth · PostgreSQL · Storage)
- **Tailwind CSS** (con sistema de diseño AV)
- **Stripe** (pagos)
- **dnd-kit** (drag-and-drop en admin)

## Setup rápido

### 1. Clonar e instalar

```bash
git clone <repo>
cd archivo-vivo
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
# Edita .env.local con tus credenciales
```

### 3. Base de datos (Supabase)

Ejecuta las migraciones en orden en el SQL Editor de Supabase:

```
supabase/migrations/20240101000000_initial.sql
supabase/migrations/20240102000000_extend.sql
```

También configura los Storage Buckets:
- `images` — público, para imágenes de productos y films
- `videos` — privado, para videos de episodios

### 4. Autenticación

En Supabase → Auth → URL Configuration:
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/api/auth/callback`

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Roles y acceso

| Rol       | Acceso |
|-----------|--------|
| `customer` | Perfil, historial de pedidos, puntos, tienda |
| `employee` | Panel employee (según permisos configurados por admin) |
| `admin`    | Panel admin completo |

### Crear primer admin

Después de registrarte, ejecuta en Supabase SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'tu@correo.com';
```

---

## Panel Admin (`/admin`)

| Sección | URL |
|---------|-----|
| Dashboard | `/admin` |
| CMS / Editor de página | `/admin/cms` |
| Catálogos | `/admin/catalogs` |
| Productos | `/admin/merch` |
| Cortometrajes | `/admin/films` |
| Pedidos | `/admin/orders` |
| Usuarios | `/admin/users` |
| Empleados | `/admin/employees` |
| Máquinas | `/admin/machines` |
| Analíticas | `/admin/analytics` |
| Configuración del sitio | `/admin/settings` |

---

## Estructura del proyecto

```
app/
  (site)/           # Sitio público
    page.tsx          # Homepage (pixel-perfect copy del HTML original)
    auth/             # Login / Register
    films/            # Cortometrajes
    merch/            # Tienda
    machines/         # Máquinas
    account/          # Perfil del cliente
  admin/            # Panel de administración
    cms/              # Editor visual de secciones de página
    catalogs/         # Gestión de catálogos
    employees/        # Permisos por empleado
    analytics/        # Reportes
    settings/         # Tema, nav, footer
components/
  layout/           # Nav, Footer
  home/             # Secciones del homepage
lib/
  supabase/         # Cliente Supabase (server, client, middleware)
  actions/          # Server actions compartidas
supabase/
  migrations/       # SQL migrations
types/
  index.ts          # TypeScript types
```

---

## Variables CSS del sistema de diseño

```css
--av-cream:  #f2e7df  /* Fondo principal */
--av-white:  #ffffff
--av-taupe:  #c8bfb9  /* Acentos secundarios */
--av-gray:   #737373  /* Texto terciario */
--av-ink:    #343133  /* Texto principal / fondos oscuros */
--av-black:  #1a1815  /* Fondos más oscuros (episodios, footer) */

--f-display: Anton            /* Titulares grandes */
--f-sans:    DM Sans          /* Cuerpo */
--f-mono:    Fira Code        /* Labels, monoespaciado */
--f-script:  Caveat           /* Firma, elementos cursivos */
```

---

## Stripe (pagos)

1. Crea productos en Stripe Dashboard o usa la API
2. Configura el webhook para `/api/stripe/webhook`
3. Eventos a escuchar: `payment_intent.succeeded`, `payment_intent.payment_failed`

---

## Supabase Storage

Buckets requeridos:
- `images` (público) — sube imágenes en `/admin/merch` y `/admin/films`
- `videos` (privado) — videos de episodios

Configuración RLS en Storage:
- `images`: SELECT para todos, INSERT/UPDATE/DELETE solo para admins/employees con permiso
- `videos`: SELECT solo para usuarios autenticados, resto solo admins

