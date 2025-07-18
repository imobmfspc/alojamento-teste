/*
  # Atualizar comodidade de receção

  1. Alterações
    - Atualizar nome da comodidade "Receção 24 horas" para "Receção multilíngue"
    - Atualizar descrição para "Equipa preparada para o atender em várias línguas"

  2. Notas
    - Esta alteração mantém todas as associações existentes com propriedades
    - Apenas o texto é alterado, não a funcionalidade
*/

UPDATE comodidades 
SET 
  nome = 'Receção multilíngue',
  descricao = 'Equipa preparada para o atender em várias línguas'
WHERE nome = 'Receção 24 horas';