/*
  # Adicionar campos de personalização para seções

  1. Novas Colunas
    - `titulo_quartos` (text) - Título personalizado para seção de quartos
    - `descricao_quartos` (text) - Descrição personalizada para seção de quartos  
    - `titulo_comodidades` (text) - Título personalizado para seção de comodidades
    - `descricao_comodidades` (text) - Descrição personalizada para seção de comodidades

  2. Valores Padrão
    - Títulos padrão: "Nossos Quartos" e "Comodidades"
    - Descrições padrão mantidas como estavam na aplicação
*/

-- Adicionar colunas para personalização das seções
ALTER TABLE propriedade 
ADD COLUMN IF NOT EXISTS titulo_quartos text DEFAULT 'Nossos Quartos',
ADD COLUMN IF NOT EXISTS descricao_quartos text DEFAULT 'Todos os nossos quartos são cuidadosamente decorados para oferecer conforto e tranquilidade durante a sua estadia.',
ADD COLUMN IF NOT EXISTS titulo_comodidades text DEFAULT 'Comodidades',
ADD COLUMN IF NOT EXISTS descricao_comodidades text DEFAULT 'Oferecemos uma variedade de comodidades para tornar a sua estadia o mais confortável possível.';