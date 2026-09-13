<<<<<<< HEAD
# webapis
proyecto de web apis y microservicios
=======
# BonosVerde - Plataforma de Bonos Intangibles

Sistema completo de venta de bonos intangibles (Oxígeno, Fauna, Carbono24, Hidrógeno Verde) con arquitectura de microservicios.

## Arquitectura

```
bonos/
├── frontend/                    # React + Vite + Tailwind
├── microservices/
│   ├── auth-service/            # Autenticación (puerto 3001)
│   ├── bonds-service/           # Bonos y códigos (puerto 3002)
│   ├── payment-service/         # Pagos PayPal/ePayco (puerto 3003)
│   └── referral-service/        # Referidos CURV (puerto 3004)
├── database/
│   └── schema.sql               # Schema MySQL
└── shared/                      # Tipos compartidos
```

## Requisitos Previos

- **Node.js** v18 o superior
- **MySQL** instalado y corriendo
- **npm** o **yarn**

## Instalación Rápida

### Windows
```bash
# 1. Ejecutar instalador (crea DB, instala dependencias, genera Prisma)
install-all.bat

# 2. Iniciar todos los servicios
start-all.bat

# 3. Detener servicios
stop-all.bat
```

### Manual (Linux/Mac/Windows)

```bash
# 1. Crear base de datos
mysql -u root -e "CREATE DATABASE IF NOT EXISTS bonos_db;"

# 2. Importar schema
mysql -u root bonos_db < database/schema.sql

# 3. Instalar Auth Service
cd microservices/auth-service
npm install
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
cd ../..

# 4. Instalar Bonds Service
cd microservices/bonds-service
npm install
npx prisma generate
cd ../..

# 5. Instalar Payment Service
cd microservices/payment-service
npm install
npx prisma generate
cd ../..

# 6. Instalar Referral Service
cd microservices/referral-service
npm install
npx prisma generate
cd ../..

# 7. Instalar Frontend
cd frontend
npm install
cd ..
```

## Iniciar el Sistema

```bash
# Terminal 1 - Auth Service
cd microservices/auth-service && npm run dev

# Terminal 2 - Bonds Service
cd microservices/bonds-service && npm run dev

# Terminal 3 - Payment Service
cd microservices/payment-service && npm run dev

# Terminal 4 - Referral Service
cd microservices/referral-service && npm run dev

# Terminal 5 - Frontend
cd frontend && npm run dev
```

## URLs del Sistema

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Auth API | http://localhost:3001 |
| Bonds API | http://localhost:3002 |
| Payments API | http://localhost:3003 |
| Referrals API | http://localhost:3004 |

## Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@bonosverde.com | admin123 | ADMIN |
| inversor@bonosverde.com | inversor123 | INVESTOR |
| premium@bonosverde.com | inversor123 | PREMIUM |

## Funcionalidades

### Implementadas
- [x] Registro de usuarios
- [x] Inicio de sesión con JWT
- [x] Dashboard de usuario
- [x] Catálogo de 4 bonos intangibles
- [x] Simulación de compra de bonos
- [x] Generación de código alfanumérico único
- [x] Generación de código QR
- [x] Sistema de referidos con código CURV
- [x] Comisiones de referidos (8% normal, 10% premium)
- [x] Conversión automática a Premium al gastar $1,000+
- [x] Página de perfil y cambio de contraseña
- [x] 2FA visual (sin backend)

### Pendientes (Backlog)
- [ ] Integración real con PayPal
- [ ] Integración real con ePayco
- [ ] 2FA con SendGrid
- [ ] Generación de certificados PDF
- [ ] Sistema de notificaciones
- [ ] Panel de administración completo

## Stack Tecnológico

**Frontend:**
- React 18
- Vite 6
- Tailwind CSS 4
- React Router 6
- Axios
- QRCode.react

**Backend:**
- Node.js
- Express
- Prisma ORM
- MySQL
- JWT (jsonwebtoken)
- bcrypt
- Zod (validación)

## Variables de Entorno

Cada microservicio tiene su archivo `.env`:

```env
DATABASE_URL="mysql://root:@localhost:3306/bonos_db"
JWT_SECRET="tu_secreto_jwt"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

## Estructura de Base de Datos

- **users** - Usuarios del sistema
- **bonds** - Bonos adquiridos
- **transactions** - Transacciones de pago
- **referrals** - Referidos y comisiones
- **verification_codes** - Códigos 2FA

## Licencia

Proyecto privado - Todos los derechos reservados.
>>>>>>> miguel
