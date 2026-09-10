# PREMIUM CAR RENTAL 🚗✨

Sistema web profesional de alquiler de vehículos de alta gama y superdeportivos, diseñado con estética de **Showroom Digital de Lujo** (fondo carbón oscuro, acento dorado champán, tipografía automotriz y plataforma 3D interactiva).

---

## 🌟 Características Destacadas (Fase 1)

- **Plataforma Giratoria 360° Showroom (`VehicleTurntable360`)**:
  - Auto-rotación continua en 360° al entrar a la página sobre un pedestal circular iluminado con halos dorados.
  - **Control por cursor y pantalla táctil**: Al pasar el mouse o deslizar el dedo, el usuario controla el ángulo de giro en tiempo real (0° a 360°).
  - Selector rápido de perspectivas (`Frente`, `3/4`, `Perfil`, `Trasera`).
- **Showcase con Video Loop y Fallback Robusto (`VehicleShowcase`)**:
  - Manejo de los 4 casos de contingencia (Video ➔ Fotografía principal ➔ Fallback de error ➔ Placeholder automotriz).
  - Carga diferida (*Lazy Loading*) para minimizar consumo de datos y costo $0.
- **Colección y Tarjetas de Lujo**:
  - Insignias de estado con color e icono (🟢 Disponible, 🔵 Alquilado, 🟠 Mantenimiento, ⚫ No disponible).
  - Filtros por categoría (Deportivos, SUVs de Lujo, Superdeportivos, Sedanes Ejecutivos).
  - Modal de detalle con especificaciones (0-100 km/h, potencia, velocidad máx.) y galería oficial de hasta 12 fotos.
- **Flujo de Reserva y WhatsApp Concierge**:
  - Cálculo dinámico de días y total estimado.
  - Generador de enlace directo a WhatsApp sin envíos automáticos no deseados.
- **Pilares del Servicio VIP & Preguntas Frecuentes**.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + Vite
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS (Paleta personalizada Showroom Dark)
- **Iconos**: Lucide React
- **Hosting / Backend (Planeado para Fase 7)**: Firebase Spark Plan ($0) / Vercel

---

## 🚀 Instalación y Uso Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/torvi30/renta-autos.git
cd renta-autos

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev

# 4. Compilar para producción
npm run build
```

---

## 📜 Reglas y Hoja de Ruta

- Consultar [PROJECT_RULES.md](./PROJECT_RULES.md) para las 25 Reglas Generales del Proyecto.
- Consultar [ROADMAP.md](./ROADMAP.md) para el seguimiento de las 12 fases de desarrollo.
