import { z } from 'zod';

export const reservationSchema = z.object({
  nome: z.string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(100, 'O nome não pode ter mais de 100 caracteres'),
  email: z.string()
    .email('Email inválido'),
  telefone: z.string()
    .min(1, 'O telefone é obrigatório'),
  numHospedes: z.number()
    .min(1, 'Deve ter pelo menos 1 hóspede')
    .max(10, 'Não pode exceder 10 hóspedes'),
  dataCheckin: z.date()
    .min(new Date(), 'A data de check-in não pode ser no passado'),
  dataCheckout: z.date(),
  mensagem: z.string()
    .max(500, 'A mensagem não pode exceder 500 caracteres')
    .optional(),
}).refine(data => data.dataCheckout > data.dataCheckin, {
  message: "A data de check-out deve ser posterior à data de check-in",
  path: ["dataCheckout"]
});

export type ReservationFormData = z.infer<typeof reservationSchema>;

export const roomSchema = z.object({
  nome: z.string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(100, 'O nome não pode ter mais de 100 caracteres'),
  descricao: z.string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres')
    .max(1000, 'A descrição não pode ter mais de 1000 caracteres'),
  precoNoite: z.string()
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, 'O preço deve ser um número positivo'),
  capacidade: z.string()
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, 'A capacidade deve ser um número positivo'),
  tamanhoM2: z.string()
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, 'O tamanho deve ser um número positivo'),
  disponivel: z.boolean(),
  comodidades: z.array(z.string()),
  imagens: z.array(z.object({
    url: z.string().url('URL inválida'),
    ordem: z.number()
  }))
});

export type RoomFormData = z.infer<typeof roomSchema>;