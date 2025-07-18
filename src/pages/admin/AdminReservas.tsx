import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { Check, CheckCheck, X, Eye, Filter, Trash2 } from 'lucide-react';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';

interface Reserva {
  id: number;
  nome_hospede: string;
  email_hospede: string;
  telefone_hospede: string;
  data_checkin: string;
  data_checkout: string;
  num_hospedes: number;
  mensagem: string | null;
  estado: string;
  created_at: string;
  quarto: {
    nome: string;
  } | null;
}

const AdminReservas: React.FC = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [reservaAtual, setReservaAtual] = useState<Reserva | null>(null);
  const [atualizando, setAtualizando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: string; texto: string } | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const carregarReservas = async () => {
    try {
      setLoading(true);
      
      const { data: reservas, error } = await supabase
        .from('reservas')
        .select(`
          *,
          quarto:quarto_id (nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReservas(reservas || []);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarReservas();
  }, []);

  const abrirModal = (reserva: Reserva) => {
    setReservaAtual(reserva);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setReservaAtual(null);
    setMensagem(null);
  };

  const abrirModalExclusao = (reserva: Reserva) => {
    setReservaAtual(reserva);
    setModalExclusaoAberto(true);
  };

  const fecharModalExclusao = () => {
    setModalExclusaoAberto(false);
    setReservaAtual(null);
    setMensagem(null);
  };

  const atualizarEstadoReserva = async (id: number, novoEstado: string) => {
    setAtualizando(true);

    try {
      const { error } = await supabase
        .from('reservas')
        .update({ estado: novoEstado })
        .eq('id', id);

      if (error) throw error;

      // Fechar modal imediatamente após sucesso
      fecharModal();
      setAtualizando(false);

      await carregarReservas();
      setMensagem({ tipo: 'sucesso', texto: 'Estado da reserva atualizado com sucesso!' });
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => {
        setMensagem({ tipo: '', texto: '' });
      }, 3000);
    } catch (error) {
      console.error('Erro ao atualizar estado:', error);
      setMensagem({
        tipo: 'erro',
        texto: 'Ocorreu um erro ao atualizar o estado da reserva.'
      });
      setAtualizando(false);
    } finally {
      // Não fazer nada aqui, pois já definimos setAtualizando(false) nos blocos try/catch
    }
  };

  const excluirReserva = async () => {
    if (!reservaAtual) return;
    
    setAtualizando(true);

    try {
      const { error } = await supabase
        .from('reservas')
        .delete()
        .eq('id', reservaAtual.id);

      if (error) throw error;

      // Fechar modal imediatamente após sucesso
      fecharModalExclusao();
      setAtualizando(false);

      await carregarReservas();
      setMensagem({ tipo: 'sucesso', texto: 'Reserva excluída com sucesso!' });
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => {
        setMensagem({ tipo: '', texto: '' });
      }, 3000);
    } catch (error) {
      console.error('Erro ao excluir reserva:', error);
      setMensagem({
        tipo: 'erro',
        texto: 'Ocorreu um erro ao excluir a reserva.'
      });
      setAtualizando(false);
    } finally {
      // Não fazer nada aqui, pois já definimos setAtualizando(false) nos blocos try/catch
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-PT');
  };

  const reservasFiltradas = reservas.filter(reserva => 
    filtroEstado === 'todos' || reserva.estado === filtroEstado
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
      <div className="container-custom py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-64">
            <AdminSidebar activeItem="reservas" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Gerir Reservas</h1>
              <p className="text-gray-600">
                Visualize e gerencie todas as reservas dos quartos.
              </p>
            </div>

            {/* Mensagem de feedback na página principal */}
            <AnimatePresence>
              {mensagem?.texto && (
                <motion.div 
                  className={`mb-6 p-4 rounded ${
                    mensagem.tipo === 'erro' ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {mensagem?.texto}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <Filter size={20} className="text-gray-500" />
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="input max-w-xs"
                  >
                    <option value="todos">Todas as reservas</option>
                    <option value="pendente">Pendentes</option>
                    <option value="confirmada">Confirmadas</option>
                    <option value="cancelada">Canceladas</option>
                    <option value="concluida">Concluídas</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                        Hóspede
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quarto
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-in
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-out
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reservasFiltradas.map((reserva) => (
                      <tr key={reserva.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis">
                          <div>
                            <div className="font-medium text-gray-900 truncate">
                              {reserva.nome_hospede}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {reserva.email_hospede}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {reserva.quarto?.nome || '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatarData(reserva.data_checkin)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatarData(reserva.data_checkout)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            reserva.estado === 'pendente' ? 'bg-gray-100 text-gray-800' :
                            reserva.estado === 'confirmada' ? 'bg-gray-700 text-white' :
                            reserva.estado === 'cancelada' ? 'bg-gray-300 text-gray-700' :
                            'bg-gray-100 text-gray-800 border border-gray-800'
                          }`}>
                            {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => abrirModal(reserva)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Ver detalhes"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => abrirModalExclusao(reserva)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalAberto && reservaAtual && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-white rounded-lg shadow-lg max-w-2xl w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Detalhes da Reserva</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Hóspede</label>
                      <p className="mt-1">{reservaAtual.nome_hospede}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quarto</label>
                      <p className="mt-1">{reservaAtual.quarto?.nome || '—'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Check-in</label>
                      <p className="mt-1">{formatarData(reservaAtual.data_checkin)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Check-out</label>
                      <p className="mt-1">{formatarData(reservaAtual.data_checkout)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1">{reservaAtual.email_hospede}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Telefone</label>
                      <p className="mt-1">{reservaAtual.telefone_hospede}</p>
                    </div>
                  </div>

                  {reservaAtual.mensagem && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mensagem</label>
                      <p className="mt-1 text-gray-600">{reservaAtual.mensagem}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => atualizarEstadoReserva(reservaAtual.id, 'confirmada')}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                          reservaAtual.estado === 'confirmada'
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        disabled={atualizando}
                      >
                        <Check size={16} className="mr-1" />
                        Confirmar
                      </button>
                      <button
                        onClick={() => atualizarEstadoReserva(reservaAtual.id, 'cancelada')}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                          reservaAtual.estado === 'cancelada'
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        disabled={atualizando}
                      >
                        <X size={16} className="mr-1" />
                        Cancelar
                      </button>
                      <button
                        onClick={() => atualizarEstadoReserva(reservaAtual.id, 'concluida')}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                          reservaAtual.estado === 'concluida'
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        disabled={atualizando}
                      >
                        <CheckCheck size={16} className="mr-1" />
                        Concluir
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={fecharModal}
                    className="btn-secondary"
                    disabled={atualizando}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalExclusaoAberto && reservaAtual && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-white rounded-lg shadow-lg max-w-md w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Confirmar Exclusão</h3>
                
                <p className="mb-4">
                  Tem certeza que deseja excluir a reserva de <strong>{reservaAtual.nome_hospede}</strong>?
                  Esta ação não pode ser desfeita.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={fecharModalExclusao}
                    className="btn-secondary"
                    disabled={atualizando}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={excluirReserva}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md"
                    disabled={atualizando}
                  >
                    {atualizando ? 'A excluir...' : 'Excluir'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminReservas;