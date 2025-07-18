import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../supabase/client';
import { MapPin, Wifi, Coffee, Tv, CheckCircle, ChevronDown, AirVent, ParkingCircle as CircleParking, ConciergeBell, CalendarCheck, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ParallaxBackground from '../../components/shared/ParallaxBackground';
import AnimatedSection from '../../components/shared/AnimatedSection';
import { getOptimizedImageUrl } from '../../config/cloudinary';

interface Quarto {
  id: number;
  nome: string;
  descricao: string;
  preco_noite: number;
  capacidade: number;
  disponivel: boolean;
  imagem_principal?: string;
}

interface Propriedade {
  id: number;
  nome: string;
  descricao: string;
  morada: string;
  hero_image_url: string | null;
}

interface Comodidade {
  id: number;
  nome: string;
  descricao: string;
  icone: string;
}

const HomePage: React.FC = () => {
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [propriedade, setPropriedade] = useState<Propriedade | null>(null);
  const [comodidades, setComodidades] = useState<Comodidade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        // Buscar dados da propriedade
        const { data: dadosPropriedade, error: erroPropriedade } = await supabase
          .from('propriedade')
          .select('*')
          .order('id', { ascending: true })
          .limit(1)
          .single();

        if (erroPropriedade) {
          console.error('Erro ao carregar dados da propriedade:', erroPropriedade);
        } else {
          setPropriedade(dadosPropriedade);

          // Buscar comodidades selecionadas
          const { data: comodidadesSelecionadas, error: erroComodidades } = await supabase
            .from('propriedade_comodidades')
            .select(`
              comodidade:comodidade_id (
                id,
                nome,
                descricao,
                icone
              )
            `)
            .eq('propriedade_id', dadosPropriedade.id);

          if (!erroComodidades && comodidadesSelecionadas) {
            setComodidades(comodidadesSelecionadas.map(item => item.comodidade));
          }
        }

        // Buscar quartos
        const { data: dadosQuartos, error: erroQuartos } = await supabase
          .from('quartos')
          .select('*')
          .order('id', { ascending: true });

        if (erroQuartos) {
          console.error('Erro ao carregar quartos:', erroQuartos);
        } else if (dadosQuartos) {
          // Para cada quarto, buscar a primeira imagem
          const quartosComImagens = await Promise.all(
            dadosQuartos.map(async (quarto) => {
              const { data: imagens } = await supabase
                .from('imagens_quartos')
                .select('url')
                .eq('quarto_id', quarto.id)
                .order('ordem', { ascending: true })
                .limit(1);

              return {
                ...quarto,
                imagem_principal: imagens && imagens.length > 0 ? imagens[0].url : undefined
              };
            })
          );

          setQuartos(quartosComImagens);
        }

        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setLoading(false);
      }
    };

    fetchDados();

    // Inscrever para atualizações em tempo real das comodidades
    const subscription = supabase
      .channel('comodidades_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'propriedade_comodidades'
        },
        () => {
          // Recarregar comodidades quando houver mudanças
          fetchDados();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const scrollToQuartos = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const quartosSection = document.getElementById('quartos');
    if (quartosSection) {
      quartosSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const HeroSection = () => (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video or Image */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/75 via-gray-900/65 to-gray-900/95" />
        <img
          src={
            propriedade?.hero_image_url 
              ? getOptimizedImageUrl(propriedade.hero_image_url, 1920)
              : "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg"
          }
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-white"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-white">
              {propriedade?.nome || 'Sua Casa'}
            </h1>
            
            <p className="text-xl text-white/90 leading-relaxed mb-8 mx-auto">
              {propriedade?.descricao || 'Descubra o conforto e a tranquilidade em nossa acomodação exclusiva, onde cada detalhe foi pensado para tornar sua estadia inesquecível.'}
            </p>

            <div className="flex flex-col items-center gap-4">
              <a 
                href="#quartos"
                onClick={scrollToQuartos}
                className="btn-primary text-base px-8 py-4 rounded-full"
              >
                <CalendarCheck className="mr-2 h-5 w-5" />
                Reservar Agora
              </a>

              <motion.a
                href="#quartos"
                onClick={scrollToQuartos}
                className="group flex flex-col items-center text-white/80 hover:text-white transition-all duration-300"
                whileHover={{ y: 5 }}
              >
                <span className="text-sm font-medium mb-2 tracking-wide">Descobrir Mais</span>
                <ChevronDown 
                  size={24} 
                  className="animate-bounce group-hover:scale-110 transition-transform duration-300" 
                />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );

  const QuartosSection = () => (
    <section id="quartos" className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="mb-6">Nossos Quartos</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Todos os nossos quartos são cuidadosamente decorados para oferecer conforto e tranquilidade durante a sua estadia.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quartos.map((quarto, index) => (
            <motion.div 
              key={quarto.id}
              className="bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/quarto/${quarto.id}`} className="block">
                <div className="aspect-w-16 aspect-h-10 h-48 relative overflow-hidden">
                  {quarto.imagem_principal ? (
                    <img 
                      src={quarto.imagem_principal} 
                      alt={quarto.nome} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Sem imagem</span>
                    </div>
                  )}
                  
                  {!quarto.disponivel && (
                    <div className="absolute top-0 right-0 bg-gray-800 text-white text-xs font-semibold px-3 py-1" style={{ borderBottomLeftRadius: '0.5rem' }}>
                      Não disponível
                    </div>
                  )}
                </div>
              </Link>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{quarto.nome}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{quarto.descricao}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">
                      Capacidade: {quarto.capacidade} pessoa{quarto.capacidade !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-xl font-bold">
                    {quarto.preco_noite}€ <span className="text-sm font-normal text-gray-600">/ noite</span>
                  </div>
                </div>
                
                <Link 
                  to={`/quarto/${quarto.id}`} 
                  className="btn-primary w-full justify-center"
                >
                  Ver Detalhes
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  const ComodidadesSection = () => {
    const icones: Record<string, React.ReactNode> = {
      'Wifi': <Wifi size={24} />,
      'Coffee': <Coffee size={24} />,
      'Tv': <Tv size={24} />,
      'AirVent': <AirVent size={24} />,
      'CircleParking': <CircleParking size={24} />,
      'ConciergeBell': <ConciergeBell size={24} />,
      'CheckCircle': <CheckCircle size={24} />
    };

    return (
      <section id="comodidades" className="py-20 bg-gray-100">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="mb-6">{propriedade?.titulo_comodidades || 'Comodidades'}</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              {propriedade?.descricao_comodidades || 'Oferecemos uma variedade de comodidades para tornar a sua estadia o mais confortável possível.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {comodidades.map((comodidade, index) => (
              <motion.div 
                key={comodidade.id}
                className="bg-white p-6 rounded-lg shadow-md flex items-start space-x-4 hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-gray-700">
                  {icones[comodidade.icone] || icones['CheckCircle']}
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">{comodidade.nome}</h3>
                  <p className="text-gray-600">{comodidade.descricao}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="pt-0">
      <HeroSection />
      <QuartosSection />
      <ComodidadesSection />
    </div>
  );
};

export default HomePage;