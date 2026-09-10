# REGLAS GENERALES DEL PROYECTO - PREMIUM CAR RENTAL

## 1. CONSERVAR LO QUE FUNCIONA
- Nunca reescribir el proyecto completo para solucionar un problema puntual.
- Antes de modificar un archivo, revisar su contenido y entender cómo funciona.
- No eliminar funcionalidades existentes que ya funcionan.
- Realizar cambios pequeños, controlados y relacionados con la tarea solicitada.

## 2. NO INVENTAR
- No inventar APIs, credenciales, URLs, datos reales, imágenes, videos o configuraciones.
- Si falta información, utilizar placeholders claramente identificados.
- Nunca utilizar credenciales reales directamente en el código.
- Nunca asumir que un servicio externo está configurado si no se ha comprobado.

## 3. ALCANCE
- Implementar únicamente lo solicitado.
- No agregar funcionalidades adicionales "porque podrían ser útiles".
- No crear pagos, IA, GPS, aplicaciones móviles, facturación u otras funcionalidades fuera del MVP sin autorización.
- Si una mejora futura parece necesaria, sugerirla pero no implementarla automáticamente.

## 4. ARQUITECTURA
- Mantener una arquitectura modular y escalable.
- Evitar componentes gigantes.
- Dividir componentes cuando tengan demasiadas responsabilidades.
- Separar interfaz, lógica, servicios y acceso a datos.
- Reutilizar componentes existentes antes de crear nuevos.
- Evitar código duplicado.

## 5. DEPENDENCIAS
- No instalar paquetes innecesarios.
- Antes de instalar una dependencia, comprobar si el proyecto ya tiene una herramienta que pueda resolver el problema.
- Evitar librerías pesadas cuando exista una alternativa sencilla.
- No cambiar versiones de dependencias existentes sin una razón clara.

## 6. DISEÑO
- Mantener una estética premium, elegante y minimalista (Showroom de Lujo).
- Los vehículos son el elemento visual principal.
- Evitar interfaces saturadas.
- Evitar exceso de animaciones.
- Las animaciones deben ser suaves y profesionales.
- Mantener consistencia en colores, tipografía, botones, tarjetas y espaciados.
- No introducir estilos que contradigan el sistema visual existente.

## 7. VEHÍCULOS
- El vehículo debe ser siempre el protagonista.
- Cada vehículo puede tener máximo 12 fotografías.
- Cada vehículo puede tener un video principal.
- El video del vehículo tendrá un máximo recomendado de 15 segundos.
- El video debe ser silencioso y estar preparado para loop.
- Si el video no existe o falla, utilizar automáticamente la imagen principal.
- Nunca mostrar imágenes rotas o espacios vacíos.

## 8. IMÁGENES
- No cargar imágenes innecesariamente en máxima resolución.
- Utilizar lazy loading cuando corresponda.
- Utilizar thumbnails para listados y galerías.
- Optimizar imágenes para web (WebP / AVIF).
- No duplicar archivos innecesariamente.
- No cargar las 12 imágenes de un vehículo en máxima resolución al mismo tiempo.

## 9. VIDEO
- Los videos deben estar optimizados para web.
- Utilizar reproducción silenciosa (muted).
- Utilizar loop cuando corresponda.
- No permitir que un video pesado bloquee la carga de la página.
- Implementar fallback mediante imagen.
- Cargar videos de manera diferida cuando no sean inmediatamente visibles.

## 10. RESPONSIVE
- Toda funcionalidad debe funcionar correctamente en:
  - móvil
  - tablet
  - escritorio
- Diseñar especialmente para pantallas móviles.
- No permitir overflow horizontal.
- Los botones deben ser cómodos de utilizar en pantallas táctiles.

## 11. PERFORMANCE
- Priorizar velocidad de carga.
- Evitar renders innecesarios.
- Utilizar lazy loading.
- Utilizar code splitting cuando aporte valor.
- Optimizar imágenes y videos.
- Evitar dependencias pesadas innecesarias.
- No bloquear la interfaz mientras se cargan recursos multimedia.

## 12. FIREBASE
- Utilizar Firebase siguiendo buenas prácticas y el Plan Gratuito (Spark $0).
- No colocar secretos en el frontend.
- Utilizar variables de entorno.
- Utilizar Firestore para datos.
- Utilizar Firebase Storage para fotografías y videos.
- Utilizar Firebase Authentication para autenticación.
- Las reglas de Firebase deben seguir el principio de mínimo privilegio.
- Nunca utilizar reglas abiertas de producción como: `allow read, write: if true;`
- Los clientes no deben poder modificar datos administrativos ni reservas ajenas.

## 13. SEGURIDAD
- Nunca confiar únicamente en validaciones del frontend.
- Validar permisos mediante reglas/backend.
- No exponer información privada innecesariamente.
- No almacenar contraseñas manualmente.
- No incluir tokens, claves privadas o secretos en Git.
- Revisar archivos .env y .gitignore.
- No permitir acceso administrativo a usuarios no autorizados.

## 14. RESERVAS
- Validar disponibilidad antes de confirmar una reserva.
- Evitar reservas duplicadas para el mismo vehículo y periodo.
- No permitir fechas inválidas.
- Mantener estados de reserva claros:
  - `PENDING`
  - `CONFIRMED`
  - `ACTIVE`
  - `COMPLETED`
  - `CANCELLED`

## 15. ERRORES
- Toda funcionalidad debe tener estados:
  - `loading`
  - `success`
  - `error`
  - `empty`
- Mostrar mensajes de error comprensibles para el usuario.
- No mostrar errores técnicos innecesarios al cliente.
- Revisar errores de consola después de implementar cambios.

## 16. ACCESIBILIDAD
- Utilizar textos alternativos en imágenes.
- Utilizar labels en formularios.
- Mantener contraste adecuado.
- Los botones deben ser accesibles.
- Las galerías deben poder utilizarse con teclado.
- Respetar `prefers-reduced-motion` cuando corresponda.

## 17. SEO
- Las páginas públicas deben tener títulos adecuados.
- Utilizar URLs amigables (ej: `/vehicles/porsche-911-gt3`).
- Cada vehículo debe poder tener información SEO propia.
- No utilizar URLs innecesariamente complejas.

## 18. CÓDIGO
- Utilizar nombres claros y descriptivos.
- Mantener funciones pequeñas cuando sea posible.
- Evitar lógica duplicada.
- Evitar comentarios innecesarios (explicar el "por qué", no lo obvio).
- Mantener formato consistente.
- No dejar código muerto ni imports sin utilizar.

## 19. CAMBIOS
Antes de realizar un cambio importante:
1. Analizar la estructura existente.
2. Identificar los archivos afectados.
3. Determinar el cambio mínimo necesario.
4. Implementar.
5. Ejecutar/verificar el proyecto.
6. Revisar errores.
7. Confirmar que las funcionalidades existentes continúan funcionando.

## 20. NO REHACER TODO
- Si existe un componente funcional, reutilizarlo.
- Si existe una función funcional, modificarla solamente si es necesario.
- No reemplazar una arquitectura funcional por otra sin autorización.
- No migrar tecnologías durante una tarea funcional.

## 21. TESTING
Después de cada funcionalidad importante:
- verificar compilación
- verificar consola
- verificar navegación
- verificar responsive
- verificar estados de error
- verificar que no se hayan roto funcionalidades existentes

## 22. CONTROL DE CALIDAD
No considerar una tarea terminada solamente porque el código fue generado.
Una tarea está terminada cuando:
- compila correctamente
- no existen errores críticos
- la funcionalidad funciona
- funciona en móvil y escritorio
- no rompe funcionalidades existentes
- no genera errores en consola

## 23. PROCESO DE DESARROLLO
Trabajar por fases.
No implementar varias fases simultáneamente.
Cuando se solicite una fase:
- trabajar únicamente en esa fase
- verificarla
- detenerse al finalizar
- esperar instrucciones para continuar

## 24. PRIORIDAD
Cuando existan conflictos entre funcionalidades, priorizar en este orden:
1. Seguridad
2. Funcionalidad
3. Performance
4. Responsive
5. Accesibilidad
6. Diseño visual
7. Animaciones

Nunca sacrificar seguridad o funcionalidad por efectos visuales.

## 25. PRINCIPIO FINAL
"HAZ EL CAMBIO MÍNIMO NECESARIO, MANTÉN LO QUE FUNCIONA Y NO IMPLEMENTES LO QUE NO SE HA SOLICITADO."
