import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../supabase/client';
import { Users, Ruler, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ReservationForm from '../../components/shared/ReservationForm';
import ImageGallery from '../../components/shared/ImageGallery';

interface Quarto {
  id: number;
  nome: string;
  descricao: string;
  preco_noite: number;
  capacidade: number;
  tamanho_m2: number;
  comodidades: string[];
  disponivel: boolean;
}

interface Imagem {
  id: number;
  quarto_id: number;
  url: string;
  ordem: number;
}

const QuartoDetalhesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [quarto, setQuarto] = useState<Quarto | null>(null);
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoomDetails = useCallback(async () => {
    try {
      if (!id) return;

      const { data: dadosQuarto, error: erroQuarto } = await supabase
        .from('quartos')
        .select('*')
        .eq('id', id)
        .single();

      if (erroQuarto) {
        console.error('Erro ao carregar dados do quarto:', erroQuarto);
        setLoading(false);
        return;
      }

      setQuarto(dadosQuarto);

      const { data: dadosImagens, error: erroImagens } = await supabase
        .from('imagens_quartos')
        .select('*')
        .eq('quarto_id', id)
        .order('ordem', { ascending: true });

      if (erroImagens) {
        console.error('Erro ao carregar imagens:', erroImagens);
      } else if (dadosImagens) {
        setImagens(dadosImagens);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRoomDetails();
  }, [fetchRoomDetails]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!quarto) {
    return (
      <div className="min-h-screen pt-32">
        <div className="container-custom">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">Quarto não encontrado</h1>
            <p className="mb-8">O quarto que procura não existe ou foi removido.</p>
            <Link to="/" className="btn-primary">
              Voltar à Página Inicial
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const Informacoes = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{quarto.nome}</h1>
        
        {!quarto.disponivel && (
          <div className="inline-block bg-gray-800 text-white text-sm font-semibold px-3 py-1 rounded mb-4">
            Não disponível
          </div>
        )}
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center text-gray-600">
            <Users size={18} className="mr-1" />
            <span>{quarto.capacidade} pessoa{quarto.capacidade !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Ruler size={18} className="mr-1" />
            <span>{quarto.tamanho_m2} m²</span>
          </div>
        </div>
        
        <p className="text-gray-700 mb-6 leading-relaxed">{quarto.descricao}</p>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Preço</h3>
          <div className="text-3xl font-bold text-gray-900">
            {quarto.preco_noite}€ <span className="text-base font-normal text-gray-600">/ noite</span>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-3">Comodidades</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quarto.comodidades.map((comodidade, index) => (
            <div key={index} className="flex items-center">
              <CheckCircle size={18} className="text-gray-600 mr-2" />
              <span>{comodidade}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-32">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            {/* Image Gallery */}
            <div className="mb-12">
              {imagens.length > 0 ? (
                <ImageGallery 
                  images={imagens} 
                  className="h-96 md:h-[500px]"
                />
              ) : (
                <div className="h-96 md:h-[500px] bg-gray-100 rounded-2xl flex items-center justify-center">
                  <p className="text-gray-500">Sem imagens disponíveis</p>
                </div>
              )}
            </div>
            
            <div className="mt-12">
              <Informacoes />
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-32">
              <ReservationForm
                quartoId={quarto.id}
                capacidadeMaxima={quarto.capacidade}
                precoNoite={quarto.preco_noite}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuartoDetalhesPage;