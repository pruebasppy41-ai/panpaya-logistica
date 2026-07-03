-- Cargo del personal administrativo logístico

ALTER TABLE asesores
  ADD COLUMN IF NOT EXISTS cargo TEXT;
