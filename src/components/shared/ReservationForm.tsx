import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DatePicker, { registerLocale } from 'react-datepicker';
import { format, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Calendar, Users, Mail, Phone, MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { reservationSchema, type ReservationFormData } from '../../utils/validation';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('pt', pt);

interface ReservationFormProps {
  quartoId: number;
  capacidadeMaxima: number;
  precoNoite: number;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  quartoId,
  capacidadeMaxima,
  precoNoite
}) => {
  const [formData, setFormData] = useState<ReservationFormData>({
    nome: '',
    email: '',
    telefone: '',
    numHospedes: 1,
    dataCheckin: addDays(new Date(), 1),
    dataCheckout: addDays(new Date(), 2),
    mensagem: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ReservationFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    try {
      reservationSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: typeof errors = {};
      error.errors.forEach((err: any) => {
        const path = err.path[0] as keyof ReservationFormData;
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('reservas')
        .insert({
          quarto_id: quartoId,
          nome_hospede: formData.nome,
          email_hospede: formData.email,
          telefone_hospede: formData.telefone,
          data_checkin: format(formData.dataCheckin, 'yyyy-MM-dd'),
          data_checkout: format(formData.dataCheckout, 'yyyy-MM-dd'),
          num_hospedes: formData.numHospedes,
          mensagem: formData.mensagem || null
        });

      if (error) throw error;

      setSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          nome: '',
          email: '',
          telefone: '',
          numHospedes: 1,
          dataCheckin: addDays(new Date(), 1),
          dataCheckout: addDays(new Date(), 2),
          mensagem: ''
        });
      }, 3000);
    } catch (error) {
      console.error('Erro ao enviar reserva:', error);
      setErrors({
        submit: 'Ocorreu um erro ao enviar sua reserva. Por favor, tente novamente.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const calcularNumeroNoites = () => {
    return Math.ceil(
      (formData.dataCheckout.getTime() - formData.dataCheckin.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const calcularPrecoTotal = () => {
    return calcularNumeroNoites() * precoNoite;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Fazer Reserva</h3>

      {success ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-100 p-4 rounded-lg text-center"
        >
          <h4 className="text-lg font-medium mb-2">Reserva enviada com sucesso!</h4>
          <p className="text-gray-600">
            Entraremos em contato em breve para confirmar sua reserva.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datas e Hóspedes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dataCheckin" className="label">
                Data de Check-in
              </label>
              <div className="relative">
                <DatePicker
                  id="dataCheckin"
                  selected={formData.dataCheckin}
                  onChange={(date: Date) => setFormData(prev => ({ ...prev, dataCheckin: date }))}
                  selectsStart
                  startDate={formData.dataCheckin}
                  endDate={formData.dataCheckout}
                  minDate={addDays(new Date(), 1)}
                  dateFormat="dd/MM/yyyy"
                  locale="pt"
                  className="input pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
              {errors.dataCheckin && (
                <p className="mt-1 text-sm text-gray-800">{errors.dataCheckin}</p>
              )}
            </div>

            <div>
              <label htmlFor="dataCheckout" className="label">
                Data de Check-out
              </label>
              <div className="relative">
                <DatePicker
                  id="dataCheckout"
                  selected={formData.dataCheckout}
                  onChange={(date: Date) => setFormData(prev => ({ ...prev, dataCheckout: date }))}
                  selectsEnd
                  startDate={formData.dataCheckin}
                  endDate={formData.dataCheckout}
                  minDate={addDays(formData.dataCheckin, 1)}
                  dateFormat="dd/MM/yyyy"
                  locale="pt"
                  className="input pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
              {errors.dataCheckout && (
                <p className="mt-1 text-sm text-gray-800">{errors.dataCheckout}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="numHospedes" className="label">
              Número de Hóspedes
            </label>
            <div className="relative">
              <select
                id="numHospedes"
                value={formData.numHospedes}
                onChange={(e) => setFormData(prev => ({ ...prev, numHospedes: Number(e.target.value) }))}
                className="input pl-10"
              >
                {Array.from({ length: capacidadeMaxima }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'pessoa' : 'pessoas'}
                  </option>
                ))}
              </select>
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            {errors.numHospedes && (
              <p className="mt-1 text-sm text-gray-800">{errors.numHospedes}</p>
            )}
          </div>

          {/* Dados do Hóspede */}
          <div>
            <label htmlFor="nome" className="label">
              Nome Completo
            </label>
            <input
              type="text"
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              className="input"
              placeholder="Digite seu nome completo"
            />
            {errors.nome && (
              <p className="mt-1 text-sm text-gray-800">{errors.nome}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="input pl-10"
                placeholder="seu.email@exemplo.com"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-gray-800">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="telefone" className="label">
              Telefone
            </label>
            <div className="relative">
              <input
                type="tel"
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                className="input pl-10"
                placeholder="Digite seu número de telefone"
              />
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            {errors.telefone && (
              <p className="mt-1 text-sm text-gray-800">{errors.telefone}</p>
            )}
          </div>

          <div>
            <label htmlFor="mensagem" className="label">
              Mensagem (opcional)
            </label>
            <div className="relative">
              <textarea
                id="mensagem"
                value={formData.mensagem}
                onChange={(e) => setFormData(prev => ({ ...prev, mensagem: e.target.value }))}
                className="input pl-10 h-24"
                placeholder="Adicione informações adicionais sobre sua estadia..."
                maxLength={500}
              />
              <MessageSquare className="absolute left-3 top-3 text-gray-400" size={18} />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {500 - (formData.mensagem?.length || 0)} caracteres restantes
            </p>
          </div>

          {/* Resumo */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Resumo da Reserva</h4>
            <div className="space-y-1 text-sm">
              <p className="flex justify-between">
                <span>Número de noites:</span>
                <span>{calcularNumeroNoites()} noites</span>
              </p>
              <p className="flex justify-between">
                <span>Preço por noite:</span>
                <span>{precoNoite}€</span>
              </p>
              <p className="flex justify-between font-medium pt-2 border-t">
                <span>Total:</span>
                <span>{calcularPrecoTotal()}€</span>
              </p>
            </div>
          </div>

          {errors.submit && (
            <div className="bg-gray-100 p-4 rounded-lg text-gray-800">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              'Solicitar Reserva'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ReservationForm;