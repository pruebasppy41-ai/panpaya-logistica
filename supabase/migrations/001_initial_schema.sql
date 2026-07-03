-- Pan Pa Ya - Sistema Logístico
-- Tablas: rutas y pedidos

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rutas diarias (un bloque = una ruta con conductor)
CREATE TABLE rutas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha         DATE NOT NULL,
  nombre_zona   TEXT NOT NULL,
  conductor     TEXT NOT NULL,
  placa         TEXT NOT NULL,
  auxiliar      TEXT,
  hora_salida   TIME,
  lado          TEXT NOT NULL CHECK (lado IN ('izquierda', 'derecha')),
  archivo_origen TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rutas_fecha ON rutas (fecha);
CREATE INDEX idx_rutas_placa ON rutas (placa);
CREATE INDEX idx_rutas_fecha_zona ON rutas (fecha, nombre_zona);

-- Pedidos / entregas por ruta
CREATE TABLE pedidos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ruta_id         UUID NOT NULL REFERENCES rutas (id) ON DELETE CASCADE,
  codigo_cliente  TEXT NOT NULL,
  nombre_cliente  TEXT NOT NULL,
  direccion       TEXT NOT NULL,
  notas           TEXT,
  orden           INTEGER,
  estado          TEXT NOT NULL DEFAULT 'Pendiente'
                  CHECK (estado IN ('Pendiente', 'En camino', 'Entregado', 'No entregado')),
  foto_url        TEXT,
  entregado_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pedidos_ruta ON pedidos (ruta_id);
CREATE INDEX idx_pedidos_estado ON pedidos (estado);
CREATE INDEX idx_pedidos_codigo ON pedidos (codigo_cliente);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rutas_updated_at
  BEFORE UPDATE ON rutas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Al marcar Entregado, registrar timestamp automáticamente
CREATE OR REPLACE FUNCTION pedidos_entregado_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'Entregado' AND (OLD.estado IS DISTINCT FROM 'Entregado') THEN
    NEW.entregado_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pedidos_entregado_trigger
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION pedidos_entregado_at();

-- Storage bucket para fotos de entrega (crear en dashboard o vía API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('entregas', 'entregas', true);

-- RLS (habilitar según roles en producción)
ALTER TABLE rutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Políticas básicas: lectura/escritura autenticada
CREATE POLICY "rutas_select_auth" ON rutas FOR SELECT TO authenticated USING (true);
CREATE POLICY "rutas_insert_service" ON rutas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "rutas_update_auth" ON rutas FOR UPDATE TO authenticated USING (true);

CREATE POLICY "pedidos_select_auth" ON pedidos FOR SELECT TO authenticated USING (true);
CREATE POLICY "pedidos_insert_service" ON pedidos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "pedidos_update_auth" ON pedidos FOR UPDATE TO authenticated USING (true);

-- Realtime para panel y app móvil
ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;
ALTER PUBLICATION supabase_realtime ADD TABLE rutas;
