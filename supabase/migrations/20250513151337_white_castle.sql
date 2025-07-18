/*
  # Add footer information to property settings
  
  1. Changes
    - Add footer information columns to propriedade table
    - Update existing property with default footer content
*/

ALTER TABLE propriedade
  ADD COLUMN IF NOT EXISTS sobre_footer TEXT DEFAULT 'Oferecemos alojamento de qualidade no coração da cidade, com conforto e conveniência para tornar a sua estadia verdadeiramente memorável.',
  ADD COLUMN IF NOT EXISTS telefone TEXT DEFAULT '+351 123 456 789',
  ADD COLUMN IF NOT EXISTS email TEXT DEFAULT 'info@alojamentolocal.pt',
  ADD COLUMN IF NOT EXISTS horario_checkin TEXT DEFAULT '14:00 - 20:00',
  ADD COLUMN IF NOT EXISTS horario_checkout TEXT DEFAULT 'até às 11:00',
  ADD COLUMN IF NOT EXISTS horario_rececao TEXT DEFAULT '08:00 - 20:00';

-- Update existing property with default values if they're NULL
UPDATE propriedade
SET 
  sobre_footer = COALESCE(sobre_footer, 'Oferecemos alojamento de qualidade no coração da cidade, com conforto e conveniência para tornar a sua estadia verdadeiramente memorável.'),
  telefone = COALESCE(telefone, '+351 123 456 789'),
  email = COALESCE(email, 'info@alojamentolocal.pt'),
  horario_checkin = COALESCE(horario_checkin, '14:00 - 20:00'),
  horario_checkout = COALESCE(horario_checkout, 'até às 11:00'),
  horario_rececao = COALESCE(horario_rececao, '08:00 - 20:00')
WHERE id = (SELECT id FROM propriedade LIMIT 1);