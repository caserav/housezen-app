# Housezen Admin - Aplicación del Casero

Esta es la aplicación de gestión de propiedades para caseros, complementaria a la app de inquilinos.

## Archivos de la Aplicación del Casero

### HTML
- `landlord-index.html` - Archivo principal de la aplicación

### CSS
- `landlord-styles.css` - Estilos con tema teal (verde azulado)

### JavaScript
Todos los archivos JS están en la carpeta `landlord-js/`:
- `config.js` - Configuración de Supabase
- `auth.js` - Autenticación con Google
- `ui.js` - Funciones de interfaz (sidebar, toasts, navegación)
- `dashboard.js` - Dashboard con estadísticas
- `incidents.js` - Gestión y trazabilidad de incidencias
- `properties.js` - Gestión de propiedades
- `tecnicos.js` - Gestión de técnicos (manitas)
- `profile.js` - Perfil del casero
- `app.js` - Inicialización principal

### Otros
- `landlord-manifest.json` - Configuración PWA

## Características Principales

### 1. Dashboard
- Tarjetas con métricas: Urgentes, Pendientes, En Proceso
- Lista de incidencias recientes
- Vista rápida del estado general

### 2. Logística de Incidencias
- Sistema de trazabilidad tipo Amazon con stepper visual
- Estados: Reportada → Asignación de Pago → En manos del Técnico → Reparación en Curso → Presupuesto Pendiente → Solucionado
- Filtros por estado y urgencia
- Vista detallada con historial completo

### 3. Gestión de Incidencias
- Asignar responsable de pago (Casero, Inquilino, Seguro)
- Asignar técnico a la incidencia
- Enviar presupuestos
- Aceptar/Rechazar presupuestos
- Marcar como solucionado
- Notas internas del casero

### 4. Mis Propiedades
- Registrar propiedades con dirección y referencia
- Vincular inquilinos (nombre, email, teléfono)
- Fecha de inicio de alquiler
- Estado activo/inactivo

### 5. Técnicos (Manitas)
- Base de datos de técnicos disponibles
- Especialidades (fontanería, electricidad, etc.)
- Datos de contacto
- Estado disponible/no disponible

### 6. Mi Perfil
- Datos del casero: nombre, DNI/CIF
- Teléfonos (principal y emergencia)
- Dirección

## Base de Datos Compartida

Ambas aplicaciones (inquilino y casero) comparten la misma base de datos Supabase:

### Tablas Principales
- `incidencias` - Incidencias reportadas
- `propiedades` - Propiedades del casero
- `caseros` - Perfil del casero
- `tecnicos` - Base de datos de técnicos
- `historial_estados` - Trazabilidad de cambios

### Políticas RLS
- Los caseros solo ven incidencias de sus propiedades vinculadas
- Los inquilinos solo ven sus propias incidencias
- Seguridad completa con Row Level Security

## Colores del Sistema

### Estados de Incidencia
- **Reportada**: Azul (#3B82F6)
- **Asignación de Pago**: Morado (#8B5CF6)
- **En manos del Técnico**: Amarillo (#F59E0B) - indica que el técnico ya tiene el aviso
- **Reparación en Curso**: Teal (#14B8A6) - reparación activa
- **Presupuesto Pendiente**: Rosa (#EC4899)
- **Solucionado**: Verde (#10B981)

### Urgencia
- **Alta**: Rojo (#EF4444)
- **Media**: Amarillo (#F59E0B)
- **Baja**: Verde (#10B981)

## Instalación

1. Sube todos los archivos `landlord-*` a tu nuevo repositorio
2. Sube la carpeta `landlord-js/` completa
3. La base de datos ya está configurada y lista para usar
4. Accede a `landlord-index.html` para usar la aplicación

## Autenticación

- Login con Google (mismo sistema que la app de inquilinos)
- Sesión persistente
- Logout desde el menú lateral

## Notas Técnicas

- Aplicación SPA (Single Page Application)
- Vanilla JavaScript (sin frameworks)
- Supabase para backend y autenticación
- RLS para seguridad a nivel de base de datos
- Responsive design (móvil y desktop)
- PWA (Progressive Web App)

## Flujo de Trabajo Típico

1. El casero añade sus propiedades en "Mis Propiedades"
2. Vincula los emails de los inquilinos a cada propiedad
3. Los inquilinos reportan incidencias desde su app
4. El casero ve las incidencias en el Dashboard
5. Asigna responsable de pago (Casero/Inquilino/Seguro)
6. Asigna un técnico de su base de datos
7. El técnico realiza la reparación
8. Se envía presupuesto si es necesario
9. Se acepta/rechaza el presupuesto
10. Se marca como solucionado

## Sistema de Trazabilidad

Cada cambio de estado queda registrado en `historial_estados` con:
- Estado anterior y nuevo
- Fecha y hora exacta
- Usuario que realizó el cambio
- Notas adicionales

Esto permite una trazabilidad completa estilo Amazon Logistics.
