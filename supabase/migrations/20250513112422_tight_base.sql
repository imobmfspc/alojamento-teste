/*
  # Initial schema for Alojamento Local

  1. New Tables
    - `propriedade` - Information about the property
    - `quartos` - Details of available rooms
    - `imagens_quartos` - Images associated with each room
    - `reservas` - Booking requests from guests

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage content
*/

-- Create propriedade table
CREATE TABLE IF NOT EXISTS propriedade (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  morada TEXT NOT NULL,
  comodidades TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create quartos table
CREATE TABLE IF NOT EXISTS quartos (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  capacidade INTEGER NOT NULL DEFAULT 1,
  preco_noite DECIMAL(10, 2) NOT NULL,
  tamanho_m2 INTEGER NOT NULL,
  comodidades TEXT[] DEFAULT '{}',
  disponivel BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create imagens_quartos table
CREATE TABLE IF NOT EXISTS imagens_quartos (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  quarto_id INTEGER NOT NULL REFERENCES quartos(id),
  url TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create reservas table
CREATE TABLE IF NOT EXISTS reservas (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  quarto_id INTEGER NOT NULL REFERENCES quartos(id),
  nome_hospede TEXT NOT NULL,
  email_hospede TEXT NOT NULL,
  telefone_hospede TEXT NOT NULL,
  data_checkin DATE NOT NULL,
  data_checkout DATE NOT NULL,
  num_hospedes INTEGER NOT NULL DEFAULT 1,
  mensagem TEXT,
  estado TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE propriedade ENABLE ROW LEVEL SECURITY;
ALTER TABLE quartos ENABLE ROW LEVEL SECURITY;
ALTER TABLE imagens_quartos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Propriedade policies
CREATE POLICY "Allow authenticated users to read property information"
  ON propriedade
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert property information"
  ON propriedade
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update property information"
  ON propriedade
  FOR UPDATE
  TO authenticated
  USING (true);

-- Quartos policies
CREATE POLICY "Allow authenticated users to manage rooms"
  ON quartos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Imagens_quartos policies
CREATE POLICY "Allow authenticated users to manage room images"
  ON imagens_quartos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Reservas policies
CREATE POLICY "Allow authenticated users to manage reservations"
  ON reservas
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to read public information
CREATE POLICY "Allow public access to property information"
  ON propriedade
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public access to rooms"
  ON quartos
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public access to room images"
  ON imagens_quartos
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public users to create reservations"
  ON reservas
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Insert default property information
INSERT INTO propriedade (nome, descricao, morada, comodidades)
VALUES (
  'Casa do Sossego',
  'Uma estadia tranquila e confortável no coração da cidade. Oferecemos quartos acolhedores com todas as comodidades necessárias para uma experiência memorável.',
  'Rua Principal, 123, 1000-000 Lisboa, Portugal',
  ARRAY['Wi-Fi gratuito', 'Pequeno-almoço incluído', 'TV por cabo', 'Ar condicionado', 'Estacionamento gratuito', 'Receção 24 horas']
);