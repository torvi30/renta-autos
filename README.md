# 🏎️ ELITE WHEELS - PREMIUM CAR RENTAL SHOWROOM 🚗✨

Plataforma web de última generación para el alquiler y gestión de vehículos de ultra-lujo y superdeportivos (Ferrari, Lamborghini, Porsche, Aston Martin, Rolls-Royce, etc.).

Diseñado bajo la filosofía **Showroom Dark** de alta gama (paleta Jet Black / Carbón / Oro Champán), tipografía automotriz de gran legibilidad y arquitectura desacoplada y resiliente basada en **React 18 + TypeScript + Tailwind CSS + Firebase Spark Cloud ($0)**.

---

## 🌟 Características y Módulos del Sistema

### 1. Experiencia de Usuario & Showroom Público
- **Plataforma Giratoria 360° Showroom (`VehicleTurntable360`)**:
  - Auto-rotación fluida con pedestal circular iluminado en halos dorados.
  - Control gestual interactivo (mouse y táctil) de 0° a 360° con selector de perspectivas (Frente, 3/4, Perfil, Trasera).
- **Showcase con Video Loop y Fallback de 4 Niveles (`VehicleShowcase`)**:
  - Video de showroom silencioso en loop de 15s con detección adaptativa de conexiones móviles (`Save-Data` / 2G).
  - Fallback en cascada: Video ➔ Fotografía HD ➔ Fallback de error con reintento ➔ Placeholder automotriz SVG.
- **Catálogo Inteligente de Flota (`/vehicles`)**:
  - Filtros multifacéticos reactivos en tiempo real (categoría, transmisión, combustible, plazas, rango de precio).
  - Vista dual (cuadrícula y lista), badges de disponibilidad en vivo y tarjetas interactivas con telemetría en hover (0-100 km/h, CV).
- **Ficha Técnica Detallada (`/vehicles/:slug`)**:
  - Especificaciones de telemetría completa: aceleración, potencia máxima, velocidad punta, tracción y caja de cambios.
  - Galería oficial categorizada (Exterior, Interior, Detalles) con visor a pantalla completa (**Lightbox**) con navegación táctil y teclado.
- **Motor de Reservas con Validación Estricta**:
  - Selector de fechas y cálculo dinámico de días, tarifas y depósito reembolsable.
  - **Regla 14 (Anti-solapamiento)**: Bloqueo automático de fechas que colisionen con reservas activas o mantenimientos de taller.
  - Registro de conductor KYC (documento, licencia, edad 25+ verificada).
  - Modalidades de entrega VIP (Showroom Central, Aeropuerto VIP Meet & Greet, Entrega a Domicilio).
  - **Regla 30 (WhatsApp Concierge)**: Generación de voucher oficial y botón para enviar el desglose estructurado directamente al Concierge VIP en WhatsApp sin envíos no deseados.

### 2. Panel de Control y Administración Ejecutiva (`/admin`)
- **Control de Acceso Seguro (`/admin/login`)**:
  - Formulario corporativo con atajo "Modo Demo", visibilidad de contraseña y guardia de rutas `ProtectedRoute`.
- **Panel de Indicadores Clave (KPIs)**:
  - Total de flota, % de ocupación en tiempo real, reservas pendientes, facturación proyectada y depósitos en custodia.
- **Gestión Integral de Flota (CRUD)**:
  - Alta y edición de fichas técnicas completas con modal ejecutivo `AdminVehicleModal`.
  - Gestor multimedia con cumplimiento de límites (hasta 12 fotos y 1 video loop).
  - Conmutador en tiempo real de estado operativo (🟢 Disponible, 🔵 Alquilado, 🟠 Mantenimiento, ⚫ Inactivo).
- **Gestión y Ciclo de Vida de Reservas**:
  - Filtrado y búsqueda instantánea por cliente, vehículo o código oficial (`RES-2026-XXXX`).
  - Transición de estados: `PENDING` ➔ `CONFIRMED` ➔ `ACTIVE` ➔ `COMPLETED` ➔ `CANCELLED`.
  - **Edición Completa y Eliminación Segura**: Modal `AdminReservationEditModal` para modificar fechas, importes, estado o cancelar/eliminar reservas con diálogo de confirmación de seguridad.
- **Directorio de Clientes KYC**:
  - Historial de alquileres, verificación de licencias de conducir y cálculo de valor de vida del cliente (LTV).
- **Cronograma de Ocupación & Gantt Timeline VIP (`AdminCalendarView`)**:
  - **Timeline Gantt**: Filas de vehículos con columna fija *sticky* de alta legibilidad y barras de reserva codificadas por color.
  - **Cuadrícula Mensual**: Vista calendario de 7 columnas con indicadores de eventos por día.
  - **Agenda VIP**: Lista táctil optimizada para teléfonos móviles y tablets.
  - **Bloqueo Manual de Fechas (`AdminDateBlockModal`)**: Bloqueo de unidades por taller, mantenimiento o eventos privados.

---

## ⚡ Rendimiento y Arquitectura Extrema

- **Code-Splitting Dinámico**: Vistas cargadas bajo demanda con `React.lazy` y `Suspense`, reduciendo el bundle inicial en más de un **77%** (de 1.24 MB a 277 KB).
- **Compresión WebP en el Cliente**: Redimensionamiento y conversión a WebP mediante Canvas en el navegador (`storageService.ts`) previa subida a la nube, reduciendo el tamaño de archivos en un 80-90% y garantizando consumo $0 en el plan Firebase Spark.
- **Rollup Vendor Chunking**: Separación limpia de dependencias en `react-vendor` y `firebase-vendor`.
- **Persistencia Híbrida Resiliente**: Arquitectura con fallback automático a almacenamiento local (`localStorage`) ante cualquier interrupción de red o cuando no se configuran claves de Firebase.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Frontend Framework** | React 18 (Hooks, Suspense, Lazy) |
| **Herramienta de Construcción** | Vite 5 + Rollup |
| **Lenguaje** | TypeScript (Modo estricto, 0 errores de compilación) |
| **Estilos & UI** | Tailwind CSS (Paleta Showroom Dark personalizada) |
| **Iconografía** | Lucide React |
| **Backend & Cloud (Spark $0)** | Cloud Firestore + Firebase Storage + Firebase Auth |
| **Enrutamiento** | Enrutador SPA nativo de cero dependencias con History API |

---

## 🚀 Puesta en Marcha Local

### 1. Clonar el Repositorio
```bash
git clone https://github.com/torvi30/renta-autos.git
cd renta-autos
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Copia el archivo `.env.example` como `.env`:
```bash
cp .env.example .env
```
Edita `.env` con tus credenciales de Firebase (o déjalo vacío para usar automáticamente el modo local offline/mock):
```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

VITE_WHATSAPP_PHONE=5215512345678
VITE_BUSINESS_EMAIL=concierge@elitewheels.com
```

### 4. Servidor de Desarrollo
```bash
npm run dev
```
Abre en tu navegador `http://localhost:5173`.

### 5. Compilar para Producción
```bash
npm run build
```

---

## 🌐 Despliegue en Producción (100% Gratuito)

El proyecto incluye todas las configuraciones de redirección SPA listas para producción:

### Opción A: Vercel (Recomendada)
1. Sube tu repositorio a GitHub.
2. Inicia sesión en [Vercel](https://vercel.com) y selecciona **Add New Project**.
3. Importa el repositorio `renta-autos`.
4. En **Environment Variables**, agrega las variables de tu archivo `.env`.
5. Haz clic en **Deploy**. El archivo [`vercel.json`](./vercel.json) configurará automáticamente las redirecciones SPA.

### Opción B: Netlify / Cloudflare Pages
1. Conecta tu repositorio en [Netlify](https://www.netlify.com).
2. Comando de construcción: `npm run build`.
3. Directorio de publicación: `dist`.
4. El archivo [`public/_redirects`](./public/_redirects) gestionará el enrutamiento sin errores 404 al recargar páginas.

### Opción C: Firebase Hosting
1. Instala Firebase CLI: `npm install -g firebase-tools`.
2. Inicia sesión: `firebase login`.
3. Despliega con:
```bash
npm run build
firebase deploy --only hosting
```
*(El archivo [`firebase.json`](./firebase.json) ya está configurado con destino en `dist` y reglas de seguridad).*

---

## 🔒 Reglas de Seguridad en Cloud

- **Firestore**: Consulta [`firestore.rules`](./firestore.rules) para ver las reglas de lectura pública y escritura autenticada.
- **Cloud Storage**: Consulta [`storage.rules`](./storage.rules) para ver las validaciones de tamaño y formato multimedia.

---

## 📜 Documentación del Proyecto

- [ROADMAP.md](./ROADMAP.md): Registro cronológico y detallado de las 12 Fases de desarrollo completadas.
- [PROJECT_RULES.md](./PROJECT_RULES.md): Las 25 Reglas de Oro que rigen el proyecto.
- [walkthrough.md](./walkthrough.md): Recorrido visual, capturas y manual técnico.

---

*Desarrollado con dedicación para una experiencia automotriz sin precedentes.*
