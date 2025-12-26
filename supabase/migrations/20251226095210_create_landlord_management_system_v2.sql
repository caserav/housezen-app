/*
  # Sistema de Gestión de Propiedades para Caseros

  ## Resumen
  Sistema completo de trazabilidad de incidencias estilo Amazon para gestión de propiedades en alquiler.

  ## Nuevas Tablas
  
  ### 1. `caseros`
  Perfil detallado de cada casero/propietario.
  - `id` (uuid, primary key, referencia a auth.users)
  - `nombre_completo` (text) - Nombre completo
  - `dni_cif` (text) - DNI o CIF
  - `telefono_principal` (text) - Teléfono principal
  - `telefono_emergencia` (text) - Teléfono de emergencias
  - `email` (text) - Email
  - `direccion` (text) - Dirección del casero
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `propiedades`
  Registro de todas las viviendas gestionadas por el casero.
  - `id` (uuid, primary key)
  - `casero_id` (uuid) - ID del casero propietario
  - `direccion_completa` (text) - Dirección completa
  - `referencia` (text) - Referencia interna
  - `inquilino_email` (text) - Email del inquilino actual
  - `inquilino_nombre` (text) - Nombre del inquilino
  - `inquilino_telefono` (text) - Teléfono del inquilino
  - `fecha_inicio_alquiler` (date) - Inicio del contrato
  - `activa` (boolean) - Si está actualmente alquilada
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `tecnicos`
  Base de datos de técnicos (manitas) disponibles.
  - `id` (uuid, primary key)
  - `casero_id` (uuid) - Casero que añadió este técnico
  - `nombre` (text) - Nombre del técnico
  - `especialidad` (text) - Especialidad
  - `telefono` (text) - Teléfono
  - `email` (text) - Email
  - `valoracion` (numeric) - Valoración promedio (1-5)
  - `activo` (boolean) - Si está disponible
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `incidencias`
  Registro de todas las incidencias reportadas.
  - `id` (uuid, primary key)
  - `titulo` (text) - Título de la incidencia
  - `descripcion` (text) - Descripción detallada
  - `categoria` (text) - Categoría
  - `urgencia` (text) - Nivel: baja, media, alta
  - `estado` (text) - Estado actual
  - `direccion` (text) - Dirección de la propiedad
  - `telefono` (text) - Teléfono de contacto
  - `user_id` (uuid) - ID del inquilino
  - `nombre_inquilino` (text) - Nombre del inquilino
  - `email_inquilino` (text) - Email del inquilino
  - `responsable_pago` (text) - Casero, Inquilino, Seguro
  - `propiedad_id` (uuid) - Referencia a propiedad
  - `tecnico_id` (uuid) - Referencia al técnico
  - `presupuesto_monto` (numeric) - Monto del presupuesto
  - `presupuesto_descripcion` (text) - Descripción del presupuesto
  - `presupuesto_estado` (text) - pendiente, aceptado, rechazado
  - `notas_casero` (text) - Notas internas
  - `created_at` (timestamptz) - Fecha de creación
  - `updated_at` (timestamptz) - Última actualización

  ### 5. `historial_estados`
  Registro completo de cambios de estado para trazabilidad.
  - `id` (uuid, primary key)
  - `incidencia_id` (uuid) - Referencia a incidencias
  - `estado_anterior` (text) - Estado previo
  - `estado_nuevo` (text) - Nuevo estado
  - `notas` (text) - Notas sobre el cambio
  - `cambiado_por` (uuid) - Usuario que hizo el cambio
  - `created_at` (timestamptz) - Momento exacto del cambio

  ## Seguridad
  - RLS habilitado en todas las tablas
  - Los caseros solo ven sus propias propiedades e incidencias
  - Los inquilinos solo ven sus incidencias
*/

-- TABLA: caseros
CREATE TABLE IF NOT EXISTS caseros (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo text,
  dni_cif text,
  telefono_principal text,
  telefono_emergencia text,
  email text,
  direccion text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE caseros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caseros pueden ver su propio perfil"
  ON caseros FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Caseros pueden crear su perfil"
  ON caseros FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Caseros pueden actualizar su perfil"
  ON caseros FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- TABLA: propiedades
CREATE TABLE IF NOT EXISTS propiedades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  casero_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  direccion_completa text NOT NULL,
  referencia text,
  inquilino_email text,
  inquilino_nombre text,
  inquilino_telefono text,
  fecha_inicio_alquiler date,
  activa boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caseros pueden ver sus propiedades"
  ON propiedades FOR SELECT
  TO authenticated
  USING (casero_id = auth.uid());

CREATE POLICY "Caseros pueden crear propiedades"
  ON propiedades FOR INSERT
  TO authenticated
  WITH CHECK (casero_id = auth.uid());

CREATE POLICY "Caseros pueden actualizar sus propiedades"
  ON propiedades FOR UPDATE
  TO authenticated
  USING (casero_id = auth.uid())
  WITH CHECK (casero_id = auth.uid());

CREATE POLICY "Caseros pueden eliminar sus propiedades"
  ON propiedades FOR DELETE
  TO authenticated
  USING (casero_id = auth.uid());

-- TABLA: tecnicos
CREATE TABLE IF NOT EXISTS tecnicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  casero_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre text NOT NULL,
  especialidad text,
  telefono text,
  email text,
  valoracion numeric DEFAULT 0,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tecnicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caseros pueden ver sus tecnicos"
  ON tecnicos FOR SELECT
  TO authenticated
  USING (casero_id = auth.uid());

CREATE POLICY "Caseros pueden crear tecnicos"
  ON tecnicos FOR INSERT
  TO authenticated
  WITH CHECK (casero_id = auth.uid());

CREATE POLICY "Caseros pueden actualizar sus tecnicos"
  ON tecnicos FOR UPDATE
  TO authenticated
  USING (casero_id = auth.uid())
  WITH CHECK (casero_id = auth.uid());

CREATE POLICY "Caseros pueden eliminar sus tecnicos"
  ON tecnicos FOR DELETE
  TO authenticated
  USING (casero_id = auth.uid());

-- TABLA: incidencias
CREATE TABLE IF NOT EXISTS incidencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descripcion text NOT NULL,
  categoria text NOT NULL,
  urgencia text NOT NULL DEFAULT 'media',
  estado text DEFAULT 'Reportada',
  direccion text,
  telefono text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_inquilino text,
  email_inquilino text,
  responsable_pago text,
  propiedad_id uuid REFERENCES propiedades(id) ON DELETE SET NULL,
  tecnico_id uuid REFERENCES tecnicos(id) ON DELETE SET NULL,
  presupuesto_monto numeric,
  presupuesto_descripcion text,
  presupuesto_estado text DEFAULT 'pendiente',
  notas_casero text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE incidencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inquilinos pueden crear incidencias"
  ON incidencias FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Inquilinos pueden ver sus incidencias"
  ON incidencias FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Caseros pueden ver incidencias de sus propiedades"
  ON incidencias FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM propiedades p
      WHERE p.casero_id = auth.uid()
      AND p.inquilino_email = incidencias.email_inquilino
    )
  );

CREATE POLICY "Caseros pueden actualizar sus incidencias"
  ON incidencias FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM propiedades p
      WHERE p.casero_id = auth.uid()
      AND p.inquilino_email = incidencias.email_inquilino
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM propiedades p
      WHERE p.casero_id = auth.uid()
      AND p.inquilino_email = incidencias.email_inquilino
    )
  );

-- TABLA: historial_estados
CREATE TABLE IF NOT EXISTS historial_estados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incidencia_id uuid REFERENCES incidencias(id) ON DELETE CASCADE NOT NULL,
  estado_anterior text,
  estado_nuevo text NOT NULL,
  notas text,
  cambiado_por uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE historial_estados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver historial"
  ON historial_estados FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM incidencias
      WHERE incidencias.id = historial_estados.incidencia_id
      AND (
        incidencias.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM propiedades p
          WHERE p.casero_id = auth.uid()
          AND p.inquilino_email = incidencias.email_inquilino
        )
      )
    )
  );

CREATE POLICY "Usuarios autenticados pueden crear historial"
  ON historial_estados FOR INSERT
  TO authenticated
  WITH CHECK (cambiado_por = auth.uid());

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_incidencias_updated_at'
  ) THEN
    CREATE TRIGGER update_incidencias_updated_at
      BEFORE UPDATE ON incidencias
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_propiedades_updated_at'
  ) THEN
    CREATE TRIGGER update_propiedades_updated_at
      BEFORE UPDATE ON propiedades
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_caseros_updated_at'
  ) THEN
    CREATE TRIGGER update_caseros_updated_at
      BEFORE UPDATE ON caseros
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_tecnicos_updated_at'
  ) THEN
    CREATE TRIGGER update_tecnicos_updated_at
      BEFORE UPDATE ON tecnicos
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_incidencias_user_id ON incidencias(user_id);
CREATE INDEX IF NOT EXISTS idx_incidencias_estado ON incidencias(estado);
CREATE INDEX IF NOT EXISTS idx_incidencias_propiedad_id ON incidencias(propiedad_id);
CREATE INDEX IF NOT EXISTS idx_incidencias_email_inquilino ON incidencias(email_inquilino);
CREATE INDEX IF NOT EXISTS idx_propiedades_casero_id ON propiedades(casero_id);
CREATE INDEX IF NOT EXISTS idx_propiedades_inquilino_email ON propiedades(inquilino_email);
CREATE INDEX IF NOT EXISTS idx_tecnicos_casero_id ON tecnicos(casero_id);
CREATE INDEX IF NOT EXISTS idx_historial_incidencia_id ON historial_estados(incidencia_id);
