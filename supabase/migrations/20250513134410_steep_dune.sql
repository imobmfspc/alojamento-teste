/*
  # Melhorias de Segurança e Performance

  1. Índices
    - Adiciona índices para campos frequentemente pesquisados
    - Otimiza performance de queries comuns

  2. Validações
    - Adiciona constraints para validação de dados
    - Implementa triggers para validação de datas

  3. Auditoria
    - Adiciona campos de auditoria
    - Implementa trigger para log de alterações
*/

-- Adiciona índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_reservas_datas ON reservas (data_checkin, data_checkout);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas (estado);
CREATE INDEX IF NOT EXISTS idx_quartos_disponivel ON quartos (disponivel);
CREATE INDEX IF NOT EXISTS idx_imagens_quartos_ordem ON imagens_quartos (quarto_id, ordem);

-- Adiciona constraints de validação
ALTER TABLE reservas ADD CONSTRAINT check_datas_reserva 
  CHECK (data_checkout > data_checkin);

ALTER TABLE reservas ADD CONSTRAINT check_estado_reserva 
  CHECK (estado IN ('pendente', 'confirmada', 'cancelada', 'concluida'));

ALTER TABLE quartos ADD CONSTRAINT check_preco_positivo 
  CHECK (preco_noite > 0);

ALTER TABLE quartos ADD CONSTRAINT check_capacidade_positiva 
  CHECK (capacidade > 0);

-- Adiciona campos de auditoria
ALTER TABLE reservas 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE quartos 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Cria função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria triggers para atualização automática
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_reservas_updated_at'
  ) THEN
    CREATE TRIGGER set_reservas_updated_at
      BEFORE UPDATE ON reservas
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_quartos_updated_at'
  ) THEN
    CREATE TRIGGER set_quartos_updated_at
      BEFORE UPDATE ON quartos
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;