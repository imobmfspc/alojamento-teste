import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../supabase/client';
import { Home, Bed, Mail, Settings } from 'lucide-react';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import AdminSidebar from '../../components/admin/AdminSidebar';

interface Estatisticas {
  totalQuartos: number;
  quartosDisponiveis: number;
  reservasPendentes: number;
}

interface ReservaRecente {
  id: number;
  nome_hospede: string;
  data_checkin: string;
  data_checkout: string;
  quarto: { nome: string } | null;
  estado: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Estatisticas>({
    totalQuartos: 0,
    quartosDisponiveis: 0,
    reservasPendentes: 0,
  });
  const [reservasRecentes, setReservasRecentes] = useState<ReservaRecente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        // Buscar estatísticas de quartos
        const { data: quartos, error: erroQuartos } = await supabase
          .from('quartos')
          .select('id, disponivel');
        
        if (erroQuartos) {
          console.error('Erro ao carregar quartos:', erroQuartos);
        } else if (quartos) {
          setStats(prev => ({
            ...prev,
            totalQuartos: quartos.length,
            quartosDisponiveis: quartos.filter(q => q.disponivel).length,
          }));
        }

        // Buscar reservas pendentes
        const { data: reservasPendentes, error: erroReservasPendentes } = await supabase
          .from('reservas')
          .select('id')
          .eq('estado', 'pendente');

        if (erroReservasPendentes) {
          console.error('Erro ao carregar reservas pendentes:', erroReservasPendentes);
        } else if (reservasPendentes) {
          setStats(prev => ({
            ...prev,
            reservasPendentes: reservasPendentes.length,
          }));
        }

        // Buscar reservas recentes
        const { data: reservas, error: erroReservas } = await supabase
          .from('reservas')
          .select(`
            id,
            nome_hospede,
            data_checkin,
            data_checkout,
            estado,
            created_at,
            quarto:quarto_id (nome)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (erroReservas) {
          console.error('Erro ao carregar reservas recentes:', erroReservas);
        } else if (reservas) {
          setReservasRecentes(reservas);
        }

        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setLoading(false);
      }
    };

    fetchDados();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Formatar data para exibição
  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-PT');
  };

  // Mapear estado para texto e estilo
  const estadoReserva = (estado: string) => {
    const estilos = {
      'pendente': 'bg-gray-200 text-gray-800',
      'confirmada': 'bg-gray-700 text-white',
      'cancelada': 'bg-gray-300 text-gray-700',
      'concluida': 'bg-gray-100 text-gray-800 border border-gray-800',
    };

    const textos = {
      'pendente': 'Pendente',
      'confirmada': 'Confirmada',
      'cancelada': 'Cancelada',
      'concluida': 'Concluída',
    };

    return {
      texto: textos[estado as keyof typeof textos] || estado,
      estilo: estilos[estado as keyof typeof estilos] || 'bg-gray-200 text-gray-800',
    };
  };

  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
      <div className="container-custom py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64">
            <AdminSidebar activeItem="dashboard" />
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Painel de Administração</h1>
              <p className="text-gray-600">
                Bem-vindo de volta! Aqui está um resumo da sua propriedade.
              </p>
            </div>

            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <motion.div 
                className="bg-white p-6 rounded-lg shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full bg-gray-100 mr-4">
                    <Bed size={20} className="text-gray-700" />
                  </div>
                  <h3 className="text-lg font-medium">Quartos</h3>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-3xl font-bold">{stats.totalQuartos}</span>
                    <span className="text-gray-500 ml-2">Total</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-semibold">{stats.quartosDisponiveis}</span>
                    <span className="text-gray-500 ml-2">Disponíveis</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to="/admin/quartos" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                    Gerir quartos →
                  </Link>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white p-6 rounded-lg shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full bg-gray-100 mr-4">
                    <Mail size={20} className="text-gray-700" />
                  </div>
                  <h3 className="text-lg font-medium">Reservas Pendentes</h3>
                </div>
                <div>
                  <span className="text-3xl font-bold">{stats.reservasPendentes}</span>
                  <span className="text-gray-500 ml-2">Novas</span>
                </div>
                <div className="mt-4">
                  <Link to="/admin/reservas" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                    Ver reservas →
                  </Link>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white p-6 rounded-lg shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full bg-gray-100 mr-4">
                    <Settings size={20} className="text-gray-700" />
                  </div>
                  <h3 className="text-lg font-medium">Definições</h3>
                </div>
                <div>
                  <p className="text-gray-600 mb-4">
                    Gerir as informações da propriedade e configurações gerais.
                  </p>
                </div>
                <div className="mt-4">
                  <Link to="/admin/propriedade" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                    Editar informações →
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Reservas recentes */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Reservas Recentes</h2>
              
              {reservasRecentes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hóspede
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quarto
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-in
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-out
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data do Pedido
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reservasRecentes.map((reserva) => {
                        const { texto, estilo } = estadoReserva(reserva.estado);
                        
                        return (
                          <tr key={reserva.id}>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{reserva.nome_hospede}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{reserva.quarto?.nome || '—'}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{formatarData(reserva.data_checkin)}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{formatarData(reserva.data_checkout)}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${estilo}`}>
                                {texto}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatarData(reserva.created_at)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">Não existem reservas recentes.</p>
                </div>
              )}

              <div className="mt-4 text-right">
                <Link to="/admin/reservas" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                  Ver todas as reservas →
                </Link>
              </div>
            </div>

            {/* Link para a página pública */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Ver Página Pública</h2>
                  <p className="text-gray-600">
                    Veja como a sua página aparece para os visitantes.
                  </p>
                </div>
                <Link to="/" className="btn-primary">
                  <Home size={18} className="mr-2" />
                  Visualizar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;