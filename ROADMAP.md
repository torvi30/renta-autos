# ROADMAP DE DESARROLLO - PREMIUM CAR RENTAL

Plan de ejecución estructurado en 12 fases.
Principio rector: **Trabajar fase por fase, verificar completamente y detenerse al finalizar cada una.**

---

### [FASE 1] Arquitectura Base, Sistema Visual & Landing Page 🟢 (COMPLETADA)
- [x] Documentar y fijar las 25 Reglas del Proyecto (`PROJECT_RULES.md`).
- [x] Inicialización del proyecto con React 18, Vite, TypeScript y Tailwind CSS.
- [x] Configuración del sistema de diseño Showroom Dark (Jet Black, Carbón, Acento Dorado Champán, Tipografía automotriz Outfit & Inter).
- [x] Componente reutilizable `VehicleShowcase` con soporte para video 15s en loop silencioso, los 4 fallbacks visuales y lazy loading.
- [x] Hero Section con vehículo protagonista en showroom y tipografía imponente.
- [x] Sección de Flota Destacada con tarjetas interactivas de lujo y filtros de categoría.
- [x] Modal de vista previa rápida de vehículo con galería oficial de hasta 12 fotos.
- [x] Sección de Pilares de Experiencia Showroom (Flota VIP, Cobertura Integral, Asistencia 24/7).
- [x] Sección interactiva "Cómo Funciona" (3 pasos).
- [x] Requisitos y Preguntas Frecuentes.
- [x] Módulo y botón de WhatsApp Concierge según Regla 30 con desglose de días y total.
- [x] Header/Navbar con efecto backdrop blur y Footer corporativo completo.
- [x] Verificación de compilación TypeScript con cero errores y respuesta HTTP 200 en servidor local.

---

### [FASE 2] Catálogo Completo de Vehículos (`/vehicles`) ⚪ (PENDIENTE)
- [ ] Grid de vehículos con filtros (categoría, transmisión, combustible, precio, plazas).
- [ ] Tarjetas interactivas con preview en hover.
- [ ] Badges de estado (🟢 Disponible, 🔵 Alquilado, 🟠 Mantenimiento, ⚫ Inactivo).
- [ ] Estados: Loading, Empty, Error, Success.

---

### [FASE 3] Página de Detalle de Vehículo (`/vehicles/:id`) ⚪ (PENDIENTE)
- [ ] Cabecera con `VehicleShowcase` en gran formato y datos clave.
- [ ] Especificaciones técnicas completas.
- [ ] Galería organizada de máximo 12 fotos (Exterior 1-5, Interior 6-9, Detalles 10-12).
- [ ] Modal/Lightbox de fotos a pantalla completa con navegación por teclado y táctil móvil.
- [ ] Resumen de cotización por día y botón de reserva.

---

### [FASE 4] Flujo de Solicitud de Reserva ⚪ (PENDIENTE)
- [ ] Selector interactivo de fechas (recogida y devolución) y validación de disponibilidad.
- [ ] Formulario de datos del cliente (nombre, documento, teléfono, email, licencia).
- [ ] Desglose de precios: días, tarifa diaria, depósito y total.
- [ ] Enlace directo para enviar resumen estructurado a WhatsApp o registrar en el sistema.

---

### [FASE 5] Autenticación y Roles (Admin / Cliente) ⚪ (PENDIENTE)
- [ ] Pantalla de acceso `/admin/login`.
- [ ] Protección de rutas privadas.
- [ ] Sesiones seguras sin almacenar contraseñas en claro ni secretos en frontend.

---

### [FASE 6] Panel Administrativo - Dashboard (`/admin`) ⚪ (PENDIENTE)
- [ ] Métricas principales: Total de autos, disponibles, alquilados, mantenimiento, reservas pendientes.
- [ ] Navegación lateral: Dashboard, Flota, Reservas, Clientes, Calendario, Configuración.

---

### [FASE 7] Conexión Firebase (Plan Gratuito Spark $0) ⚪ (PENDIENTE)
- [ ] Configuración de variables de entorno `.env`.
- [ ] Conexión a Cloud Firestore para vehículos y reservas.
- [ ] Conexión a Firebase Storage para fotos (WebP) y videos optimizados.
- [ ] Reglas de seguridad con principio de mínimo privilegio.

---

### [FASE 8] Administración de Vehículos (CRUD Completo) ⚪ (PENDIENTE)
- [ ] Crear y editar vehículos con límite estricto de 12 fotos y 1 video.
- [ ] Contador visual de recursos (`Fotos: 8/12`, `Video: ✓ Cargado`).
- [ ] Activación, desactivación y cambio de estado.

---

### [FASE 9] Gestión de Reservas y Clientes ⚪ (PENDIENTE)
- [ ] Listado y detalle de reservas.
- [ ] Cambio de estado: `PENDING` ➔ `CONFIRMED` ➔ `ACTIVE` ➔ `COMPLETED` ➔ `CANCELLED`.
- [ ] Directorio básico de clientes y licencias.

---

### [FASE 10] Calendario Administrativo ⚪ (PENDIENTE)
- [ ] Visualización mensual, semanal y diaria de reservas por vehículo.
- [ ] Detección visual de solapamientos e intervalos de ocupación.

---

### [FASE 11] Optimización Extrema de Rendimiento y Medios ⚪ (PENDIENTE)
- [ ] Compresión WebP en subida.
- [ ] Carga diferida de videos para conexiones móviles lentas.
- [ ] Auditoría Lighthouse / Performance.

---

### [FASE 12] Pruebas Finales, Control de Calidad y Despliegue ⚪ (PENDIENTE)
- [ ] Revisión exhaustiva de consola, responsive y flujos completos.
- [ ] Configuración para despliegue gratuito en Vercel / Netlify / Firebase Hosting.
