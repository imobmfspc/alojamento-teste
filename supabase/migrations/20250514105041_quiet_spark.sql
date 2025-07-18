/*
  # Update amenities structure
  
  1. Changes
    - Add new table for amenities with name and description
    - Add foreign key relationship to property amenities
    - Migrate existing amenities data
*/

-- Create new amenities table
CREATE TABLE IF NOT EXISTS comodidades (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome VARCHAR(30) NOT NULL,
  descricao VARCHAR(60) NOT NULL,
  icone TEXT NOT NULL DEFAULT 'CheckCircle',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE comodidades ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow authenticated users to manage amenities"
  ON comodidades
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to amenities"
  ON comodidades
  FOR SELECT
  TO anon
  USING (true);

-- Add validation constraints
ALTER TABLE comodidades 
  ADD CONSTRAINT check_nome_length CHECK (length(nome) <= 30),
  ADD CONSTRAINT check_descricao_length CHECK (length(descricao) <= 60);

-- Create junction table for property amenities
CREATE TABLE IF NOT EXISTS propriedade_comodidades (
  propriedade_id INTEGER REFERENCES propriedade(id),
  comodidade_id INTEGER REFERENCES comodidades(id),
  PRIMARY KEY (propriedade_id, comodidade_id)
);

-- Enable RLS
ALTER TABLE propriedade_comodidades ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow authenticated users to manage property amenities"
  ON propriedade_comodidades
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public access to property amenities"
  ON propriedade_comodidades
  FOR SELECT
  TO anon
  USING (true);

-- Migrate existing amenities
WITH inserted_amenities AS (
  INSERT INTO comodidades (nome, descricao, icone)
  VALUES 
    ('Wi-Fi gratuito', 'Acesso à internet de alta velocidade em todas as áreas', 'Wifi'),
    ('Pequeno-almoço incluído', 'Pequeno-almoço completo incluído na sua estadia', 'Coffee'),
    ('TV por cabo', 'Televisão com canais internacionais e nacionais', 'Tv'),
    ('Ar condicionado', 'Controlo de temperatura individual em cada quarto', 'AirVent'),
    ('Estacionamento gratuito', 'Estacionamento gratuito para todos os hóspedes', 'CircleParking'),
    ('Receção 24 horas', 'Assistência disponível a qualquer hora do dia', 'ConciergeBell')
  RETURNING id, nome
)
INSERT INTO propriedade_comodidades (propriedade_id, comodidade_id)
SELECT 
  p.id as propriedade_id,
  ia.id as comodidade_id
FROM propriedade p
CROSS JOIN inserted_amenities ia
WHERE EXISTS (
  SELECT 1 
  FROM propriedade p2,
  unnest(p2.comodidades) AS comodidade
  WHERE p2.id = p.id 
  AND comodidade = ia.nome
);

-- Update property table to remove old comodidades array
ALTER TABLE propriedade DROP COLUMN comodidades;