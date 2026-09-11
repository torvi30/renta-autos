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

### [FASE 2] Catálogo Completo de Vehículos (`/vehicles`) 🟢 (COMPLETADA)
- [x] Enrutamiento SPA nativo para `/vehicles` con sincronización de URL (`pushState`, `popstate`, search params) sin sobrecarga de dependencias.
- [x] Grid y vista de lista interactiva de vehículos con panel de filtros de precisión (categoría, disponibilidad, transmisión, combustible, plazas, rango de tarifa).
- [x] Custom Hook `useVehicleFilters` desacoplado con conteos reactivos por faceta y reseteo en 1 clic.
- [x] Tarjetas de vehículos enriquecidas con preview en hover (micro-especificaciones de aceleración y potencia CV).
- [x] Badges de estado operativo en tiempo real (🟢 Disponible, 🔵 Alquilado, 🟠 Mantenimiento, ⚫ Inactivo) con acciones contextuales de reserva y consulta.
- [x] Manejo de estados de UI: Skeletons Showroom con efecto shimmer, estado vacío (Empty State) con restauración rápida, y catálogo dinámico con métricas.
- [x] Integración de navegación en Navbar y CTA en sección de Flota Destacada.
- [x] Verificación de compilación TypeScript con cero errores y respuesta HTTP 200 en servidor local.

---

### [FASE 3] Página de Detalle de Vehículo (`/vehicles/:slug`) 🟢 (COMPLETADA)
- [x] Enrutamiento dinámico `/vehicles/:slug` y actualización automática de `document.title` y breadcrumbs para SEO (Regla 17).
- [x] Cabecera en gran formato con `VehicleShowcase` en alta fidelidad (loop de video silencioso y fotos principales).
- [x] Barra de telemetría y desempeño: Potencia (CV), aceleración 0-100 km/h, velocidad punta y configuración de asientos/puertas.
- [x] Ficha técnica completa de fabricante: motor, transmisión, tracción, combustible, comodidades y equipamiento VIP.
- [x] Galería oficial categorizada (Exterior 1-5, Interior 6-9, Detalles 10-12) con límite estricto de 12 fotos (Regla 8).
- [x] Modal `VehicleLightbox` a pantalla completa con navegación accesible por teclado (`←`, `→`, `Esc`), controles táctiles y carrusel de miniaturas (Regla 16).
- [x] Sidebar interactiva de cotización en vivo con selector de fechas (recogida/devolución), desglose de días, depósito de garantía reembolsable y botones directos de Reserva y WhatsApp Concierge (Regla 30).
- [x] Sección de modelos recomendados / vehículos similares de la misma categoría.
- [x] Verificación de compilación TypeScript con cero errores y respuesta HTTP 200 en servidor local.

---

### [FASE 4] Flujo de Solicitud de Reserva 🟢 (COMPLETADA)
- [x] Selector interactivo de fechas (recogida y devolución) y horarios con validación en tiempo real.
- [x] Regla 14: Verificación estricta de disponibilidad operativa y prevención de solapamientos contra reservas existentes activas.
- [x] Formulario de registro y KYC de conductor de ultra-lujo (nombre completo, documento/pasaporte, licencia de conducir, edad 25+ verificada, teléfono móvil y email).
- [x] Modalidad de entrega VIP seleccionable (Showroom Central, Aeropuerto VIP Meet & Greet, Hotel / Residencia privada).
- [x] Desglose financiero completo: tarifa diaria, días, subtotal renta, depósito de garantía reembolsable y cobertura VIP $0.
- [x] Generación de código único de seguimiento oficial (`RES-2026-XXXX`) y persistencia local para sincronización con panel administrativo.
- [x] Regla 30: Voucher formal de confirmación y botón directo a WhatsApp Concierge con formato estructurado de reserva.
- [x] Verificación de compilación TypeScript con cero errores y respuesta HTTP 200 en servidor local.

---

### [FASE 5] Autenticación y Roles (Admin / Cliente) 🟢 (COMPLETADA)
- [x] Modelos y tipado estricto de roles (`ADMIN`, `CONCIERGE`, `CLIENT`) y sesiones (`AuthUser`, `AuthState`).
- [x] Servicio desacoplado `authService.ts` con patrón Observer/Adapter (`onAuthStateChanged`) preparado para Firebase Auth en Fase 7.
- [x] Pantalla de acceso corporativo de alta gama `/admin/login` con visibilidad de contraseña, validación, feedback de errores y botón de atajo demo.
- [x] Guardia de protección de rutas privadas `ProtectedRoute` con redirección automática y pantalla de carga Showroom.
- [x] Persistencia de sesión segura (`localStorage` / `sessionStorage`) y destrucción de sesión en logout.
- [x] Enlace corporativo integrado en Footer y vista preliminar de bienvenida con métricas en `/admin`.
- [x] Verificación de compilación TypeScript con cero errores y respuesta HTTP 200 en servidor local.

---

### [FASE 6] Panel Administrativo - Dashboard (`/admin`) 🟢 (COMPLETADA)
- [x] Barra lateral ejecutiva `AdminSidebar` con navegación por pestañas (*Dashboard, Flota, Reservas, Clientes*), drawer responsive táctil para móvil y perfil de administrador.
- [x] Panel de métricas e indicadores clave `AdminMetricsGrid`: total flota, porcentaje de disponibilidad, conteo de reservas pendientes, ingresos proyectados y depósitos en custodia.
- [x] Gestor interactivo de reservas `AdminReservationsView`: buscador dinámico, filtros por estado (`PENDING`, `CONFIRMED`, `ACTIVE`, `COMPLETED`, `CANCELLED`), cambio de estado en 1 clic y botón directo para abrir chat de WhatsApp con el cliente.
- [x] Control operativo de flota `AdminFleetView`: cambio en vivo de estado del vehículo (🟢 Disponible, 🔵 Alquilado, 🟠 Mantenimiento, ⚫ Inactivo) sincronizado con el motor de reservas de la aplicación.
- [x] Directorio de clientes KYC `AdminClientsView`: consulta de conductores, licencias, documentos, teléfonos, emails y gasto acumulado.
- [x] Vista orquestadora `AdminDashboardPage` con alertas automáticas de solicitudes pendientes y notificaciones toast.
- [x] Verificación de compilación TypeScript con cero errores y respuesta HTTP 200 en servidor local.

---

### [FASE 7] Conexión Firebase (Plan Gratuito Spark $0) 🟢 (COMPLETADA)
- [x] Configuración y validación de variables de entorno `.env` para Firebase Cloud Spark ($0).
- [x] Servicio desacoplado `vehicleService.ts` con suscripción reactiva en tiempo real (`onSnapshot`), sincronización de estado y fallback local automático resiliente.
- [x] Sincronización en tiempo real de `reservationService.ts` con Cloud Firestore (`reservations`) y persistencia dual sin latencia.
- [x] Servicio `storageService.ts` para carga de fotografías (límite estricto de 12 fotos WebP/JPG/PNG, máx 5MB) y video de showroom (máx 25MB, loop silencioso) con URLs públicas optimizadas.
- [x] Reglas de seguridad `firestore.rules` y `storage.rules` implementadas bajo el principio de mínimo privilegio (lectura pública, creación controlada y escritura exclusiva para administradores).
- [x] Indicador de estado de conexión en vivo a Cloud Firestore y botón de sincronización/sembrado inicial en el Panel de Administración.
- [x] Verificación de compilación TypeScript con cero errores y respuesta HTTP 200 en servidor local.

---

### [FASE 8] Administración de Vehículos (CRUD Completo) 🟢 (COMPLETADA)
- [x] Modal ejecutivo Showroom Dark `AdminVehicleModal.tsx` para Crear y Editar vehículos con validación estricta.
- [x] Gestor multimedia con cumplimiento estricto de las Reglas 7, 8 y 9 (límite de 12 fotos y 1 video de showroom máx 15s).
- [x] Contador dinámico de recursos en vivo (`Fotos: X/12`, `Video: [✓ Configurado / ✕ Sin Video]`).
- [x] Métodos de mutación en `vehicleService.ts` (`createVehicle`, `updateVehicle`, `deleteVehicle`) con sincronización en Firestore y local cache.
- [x] Botones de acción en `AdminFleetView.tsx` ("Nuevo Vehículo", "Editar Ficha", "Eliminar" con modal de confirmación y selector de estado).
- [x] Verificación de compilación TypeScript con cero errores y respuesta HTTP 200 en servidor local.

---

### [FASE 9] Gestión de Reservas y Clientes 🟢 (COMPLETADA)
- [x] Listado y detalle exhaustivo de reservas en `AdminReservationsView.tsx`.
- [x] Ciclo de vida completo: `PENDING` ➔ `CONFIRMED` ➔ `ACTIVE` ➔ `COMPLETED` ➔ `CANCELLED`.
- [x] Sincronización bidireccional en tiempo real con Cloud Firestore.
- [x] Directorio KYC de clientes y verificación de licencias en `AdminClientsView.tsx` con cálculo de LTV.
- [x] Integración de WhatsApp Concierge con plantillas dinámicas por reserva.

---

### [FASE 10] Calendario Administrativo & Cronograma de Ocupación 🟢 (COMPLETADA)
- [x] Pestaña `Cronograma & Ocupación` integrada en `AdminSidebar` y `AdminDashboardPage`.
- [x] Cronograma Gantt interactivo (`AdminCalendarView.tsx`) con vehículos en filas y días del mes en columnas.
- [x] Vista dual conmutador: Timeline Gantt vs. Cuadrícula Mensual Tradicional (7 columnas).
- [x] KPIs ejecutivos: % Ocupación Mensual de Flota, Días Contratados, Despachos Inminentes (<48h) y Detector de Conflictos.
- [x] Detector automático de solapamientos con alerta visual prominente.
- [x] Modal de Bloqueo Manual de Fechas (`AdminDateBlockModal.tsx`) para Taller, Mantenimiento preventivo y Eventos VIP.
- [x] Modal de Inspección Rápida de Reserva con enlace a WhatsApp Concierge y cambio de estado directo.
- [x] Motor de disponibilidad (`checkAvailability`) actualizado para respetar bloqueos de tipo `MAINTENANCE`.
- [x] Verificación de compilación TypeScript con cero errores y bundle Vite de producción exitoso.

---

### [FASE 11] Optimización Extrema de Rendimiento y Medios ⚪ (PENDIENTE)
- [ ] Compresión WebP en subida.
- [ ] Carga diferida de videos para conexiones móviles lentas.
- [ ] Auditoría Lighthouse / Performance.

---

### [FASE 12] Pruebas Finales, Control de Calidad y Despliegue ⚪ (PENDIENTE)
- [ ] Revisión exhaustiva de consola, responsive y flujos completos.
- [ ] Configuración para despliegue gratuito en Vercel / Netlify / Firebase Hosting.
