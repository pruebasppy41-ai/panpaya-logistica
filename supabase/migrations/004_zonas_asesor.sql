-- Catálogo de zonas + relación asesor ↔ varias zonas

CREATE TABLE IF NOT EXISTS zonas_distribucion (
  codigo  TEXT PRIMARY KEY,
  nombre  TEXT NOT NULL
);

INSERT INTO zonas_distribucion (codigo, nombre) VALUES
  ('1CAN01', 'Medellin'),
  ('1CAN02', 'Medellin'),
  ('1CBG01', 'ZONA T'),
  ('1CBG02', 'ORIENTE /CHAPINERO'),
  ('1CBG03', 'NOR OCCIDENTE'),
  ('1CBG04', 'OCCIDENTE/ ZONA FRANCA'),
  ('1CBG05', 'BOSA/SOACHA'),
  ('1CBG06', 'CENTRO'),
  ('1CBG07', 'SUR ORIENTE'),
  ('1CBG09', 'TENJO/COTA SIBERIA'),
  ('1CBG10', 'NORTE'),
  ('1CBG11', 'NOR ORIENTE'),
  ('1CBG12', 'SUR OCCIDENTE'),
  ('1CBG13', 'R&M ZIPAQUIRA'),
  ('1CBY01', 'Boyacá'),
  ('1CBY02', 'Boyacá'),
  ('1CCT01', 'Barranquilla'),
  ('1CCT02', 'Cartagena'),
  ('1CCT03', 'Barranquilla/Cartagena'),
  ('1CCU01', 'Cucuta'),
  ('1CCU02', 'Santander'),
  ('1CEC01', 'Eje cafetero'),
  ('1CEC02', 'Eje cafetero'),
  ('1CFA01', 'Faca'),
  ('1CME01', 'Meta'),
  ('1CVL01', 'Valle'),
  ('1CZM01', 'Sumapaz Melgar/Girardot/Neiva'),
  ('1CZM02', 'Mesa-Mesitas'),
  ('1CZM03', 'Fusagasugá/Melgar'),
  ('1RBG01', 'MULTITEMPERATURA 1'),
  ('1RBG02', 'MULTITEMPERATURA 2'),
  ('1RBG03', 'MULTITEMPERATURA 3'),
  ('1RBG04', 'MULTITEMPERATURA 4'),
  ('1RBG05', 'MULTITEMPERATURA 5'),
  ('1SBG01', 'Sabana 1 /Cajicá/Zipa/Tabio'),
  ('1SBG02', 'Tocancipa/Gachancipa/Sopo'),
  ('1SBG03', 'Sabana 3 Tocancipa/Gachancipa'),
  ('1SBG04', 'RAPPI 1'),
  ('1SBG05', 'RAPPI 2')
ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre;

CREATE TABLE IF NOT EXISTS asesor_zonas (
  asesor_id    UUID NOT NULL REFERENCES asesores (id) ON DELETE CASCADE,
  codigo_zona  TEXT NOT NULL REFERENCES zonas_distribucion (codigo) ON DELETE RESTRICT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (asesor_id, codigo_zona)
);

CREATE INDEX IF NOT EXISTS idx_asesor_zonas_asesor ON asesor_zonas (asesor_id);

ALTER TABLE asesores ALTER COLUMN zona DROP NOT NULL;

ALTER TABLE zonas_distribucion ENABLE ROW LEVEL SECURITY;
ALTER TABLE asesor_zonas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "zonas_select_public" ON zonas_distribucion;
CREATE POLICY "zonas_select_public" ON zonas_distribucion
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "asesor_zonas_select_own" ON asesor_zonas;
CREATE POLICY "asesor_zonas_select_own" ON asesor_zonas
  FOR SELECT TO authenticated
  USING (auth.uid() = asesor_id);

DROP POLICY IF EXISTS "asesor_zonas_insert_own" ON asesor_zonas;
CREATE POLICY "asesor_zonas_insert_own" ON asesor_zonas
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = asesor_id);
