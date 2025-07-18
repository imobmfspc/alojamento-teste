import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { Save, PlusCircle, XCircle, CheckCircle, Wifi, Coffee, Tv, AirVent, ParkingCircle as CircleParking, ConciergeBell, Trash2, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { validateImage, compressImage, uploadGeneralImage } from '../../utils/imageUtils';
import { getOptimizedImageUrl } from '../../config/cloudinary';

interface Propriedade {
  id: number;
  nome: string;
  descricao: string;
  morada: string;
  sobre_footer: string;
  telefone: string;
  email: string;
  horario_checkin: string;
  horario_checkout: string;
  horario_rececao: string;
  hero_image_url: string | null;
  titulo_quartos: string | null;
  descricao_quartos: string | null;
  titulo_comodidades: string | null;
  descricao_comodidades: string | null;
  link_externo_url: string | null;
  link_externo_texto: string | null;
}

interface Comodidade {
  id: number;
  nome: string;
  descricao: string;
  icone: string;
}

const AdminPropriedade: React.FC = () => {
  const [propriedade, setPropriedade] = useState<Propriedade | null>(null);
  const [comodidades, setComodidades] = useState<Comodidade[]>([]);
  const [comodidadesSelecionadas, setComodidadesSelecionadas] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [modalComodidade, setModalComodidade] = useState(false);
  const [modalExclusao, setModalExclusao] = useState(false);
  const [comodidadeParaExcluir, setComodidadeParaExcluir] = useState<Comodidade | null>(null);
  const [atualizando, setAtualizando] = useState(false);
  
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [morada, setMorada] = useState('');
  const [novaComodidade, setNovaComodidade] = useState({ nome: '', descricao: '' });
  const [errosComodidade, setErrosComodidade] = useState({ nome: '', descricao: '' });
  
  const [sobreFooter, setSobreFooter] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [horarioCheckin, setHorarioCheckin] = useState('');
  const [horarioCheckout, setHorarioCheckout] = useState('');
  const [horarioRececao, setHorarioRececao] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [linkExternoUrl, setLinkExternoUrl] = useState('');
  const [linkExternoTexto, setLinkExternoTexto] = useState('');
  const [tituloQuartos, setTituloQuartos] = useState('');
  const [descricaoQuartos, setDescricaoQuartos] = useState('');
  const [tituloComodidades, setTituloComodidades] = useState('');
  const [descricaoComodidades, setDescricaoComodidades] = useState('');
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [heroImageProgress, setHeroImageProgress] = useState(0);

  const icones: { [key: string]: React.ReactNode } = {
    Wifi: <Wifi size={20} />,
    Coffee: <Coffee size={20} />,
    Tv: <Tv size={20} />,
    AirVent: <AirVent size={20} />,
    CircleParking: <CircleParking size={20} />,
    ConciergeBell: <ConciergeBell size={20} />,
    CheckCircle: <CheckCircle size={20} />
  };

  const coreAmenities = [
    'Ar condicionado',
    'Estacionamento gratuito',
    'Pequeno-almoço incluído',
    'Receção multilíngue',
    'TV por cabo',
    'Wi-Fi gratuito'
  ];

  const isAmenityDeletable = (nome: string) => {
    return !coreAmenities.includes(nome);
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const { data: dadosPropriedade, error: erroPropriedade } = await supabase
        .from('propriedade')
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .single();

      if (erroPropriedade) {
        console.error('Erro ao carregar dados da propriedade:', erroPropriedade);
        return;
      }

      setPropriedade(dadosPropriedade);
      
      setNome(dadosPropriedade.nome || '');
      setDescricao(dadosPropriedade.descricao || '');
      setMorada(dadosPropriedade.morada || '');
      setSobreFooter(dadosPropriedade.sobre_footer || '');
      setTelefone(dadosPropriedade.telefone || '');
      setEmail(dadosPropriedade.email || '');
      setHorarioCheckin(dadosPropriedade.horario_checkin || '');
      setHorarioCheckout(dadosPropriedade.horario_checkout || '');
      setHorarioRececao(dadosPropriedade.horario_rececao || '');
      setHeroImageUrl(dadosPropriedade.hero_image_url || '');
      setLinkExternoUrl(dadosPropriedade.link_externo_url || '');
      setLinkExternoTexto(dadosPropriedade.link_externo_texto || '');
      setTituloQuartos(dadosPropriedade.titulo_quartos || '');
      setDescricaoQuartos(dadosPropriedade.descricao_quartos || '');
      setTituloComodidades(dadosPropriedade.titulo_comodidades || '');
      setDescricaoComodidades(dadosPropriedade.descricao_comodidades || '');

      const { data: todasComodidades } = await supabase
        .from('comodidades')
        .select('*')
        .order('nome');

      if (todasComodidades) {
        setComodidades(todasComodidades);
      }

      const { data: comodidadesProp } = await supabase
        .from('propriedade_comodidades')
        .select('comodidade_id')
        .eq('propriedade_id', dadosPropriedade.id);

      if (comodidadesProp) {
        setComodidadesSelecionadas(comodidadesProp.map(c => c.comodidade_id));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const validarComodidade = () => {
    const erros = {
      nome: '',
      descricao: ''
    };

    if (!novaComodidade.nome) {
      erros.nome = 'O nome é obrigatório';
    } else if (novaComodidade.nome.length > 30) {
      erros.nome = 'O nome não pode ter mais de 30 caracteres';
    }

    if (!novaComodidade.descricao) {
      erros.descricao = 'A descrição é obrigatória';
    } else if (novaComodidade.descricao.length > 60) {
      erros.descricao = 'A descrição não pode ter mais de 60 caracteres';
    }

    setErrosComodidade(erros);
    return !erros.nome && !erros.descricao;
  };

  const adicionarComodidade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarComodidade()) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('comodidades')
        .insert({
          nome: novaComodidade.nome.trim(),
          descricao: novaComodidade.descricao.trim()
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Sort comodidades alphabetically by name when adding new one
        setComodidades(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)));
        setComodidadesSelecionadas([...comodidadesSelecionadas, data.id]);
      }

      setNovaComodidade({ nome: '', descricao: '' });
      setModalComodidade(false);
    } catch (error) {
      console.error('Erro ao adicionar comodidade:', error);
      setMensagem({
        tipo: 'erro',
        texto: 'Erro ao adicionar comodidade. Por favor, tente novamente.'
      });
    }
  };

  const toggleComodidade = async (comodidadeId: number) => {
    if (!propriedade) return;

    try {
      if (comodidadesSelecionadas.includes(comodidadeId)) {
        await supabase
          .from('propriedade_comodidades')
          .delete()
          .eq('propriedade_id', propriedade.id)
          .eq('comodidade_id', comodidadeId);

        setComodidadesSelecionadas(prev => 
          prev.filter(id => id !== comodidadeId)
        );
      } else {
        await supabase
          .from('propriedade_comodidades')
          .insert({
            propriedade_id: propriedade.id,
            comodidade_id: comodidadeId
          });

        setComodidadesSelecionadas(prev => [...prev, comodidadeId]);
      }
    } catch (error) {
      console.error('Erro ao atualizar comodidades:', error);
      setMensagem({
        tipo: 'erro',
        texto: 'Erro ao atualizar comodidades. Por favor, tente novamente.'
      });
    }
  };

  const abrirModalExclusao = (comodidade: Comodidade) => {
    setComodidadeParaExcluir(comodidade);
    setModalExclusao(true);
  };

  const fecharModalExclusao = () => {
    setModalExclusao(false);
    setComodidadeParaExcluir(null);
  };

  const excluirComodidade = async () => {
    if (!comodidadeParaExcluir) return;

    try {
      setAtualizando(true);

      await supabase
        .from('propriedade_comodidades')
        .delete()
        .eq('comodidade_id', comodidadeParaExcluir.id);

      const { error } = await supabase
        .from('comodidades')
        .delete()
        .eq('id', comodidadeParaExcluir.id);

      if (error) throw error;

      setComodidades(prev => prev.filter(c => c.id !== comodidadeParaExcluir.id));
      setComodidadesSelecionadas(prev => prev.filter(id => id !== comodidadeParaExcluir.id));
      
      setMensagem({
        tipo: 'sucesso',
        texto: 'Comodidade excluída com sucesso!'
      });

      setTimeout(() => {
        setMensagem({ tipo: '', texto: '' });
      }, 3000);

      fecharModalExclusao();
    } catch (error) {
      console.error('Erro ao excluir comodidade:', error);
      setMensagem({
        tipo: 'erro',
        texto: 'Ocorreu um erro ao excluir a comodidade. Por favor, tente novamente.'
      });
    } finally {
      setAtualizando(false);
    }
  };

  const handleHeroImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingHeroImage(true);
      setHeroImageProgress(0);
      setMensagem({ tipo: '', texto: '' }); // Limpar mensagens anteriores

      // Validar imagem
      const validation = await validateImage(file);
      if (!validation.isValid) {
        setMensagem({
          tipo: 'erro',
          texto: `Validação falhou: ${validation.error || 'Imagem inválida'}`
        });
        return;
      }

      // Comprimir imagem
      setMensagem({
        tipo: 'sucesso',
        texto: 'Comprimindo imagem...'
      });
      const compressedFile = await compressImage(file);

      // Fazer upload
      setMensagem({
        tipo: 'sucesso',
        texto: 'Enviando imagem...'
      });
      const url = await uploadGeneralImage(
        compressedFile,
        'hero',
        (progress) => setHeroImageProgress(progress)
      );

      setHeroImageUrl(url);
      setMensagem({
        tipo: 'sucesso',
        texto: 'Imagem de capa carregada com sucesso!'
      });

      setTimeout(() => {
        setMensagem({ tipo: '', texto: '' });
      }, 3000);
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      
      let errorMessage = 'Erro desconhecido ao fazer upload da imagem';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Adicionar informações de debug
      const debugInfo = [
        `Tamanho do arquivo: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        `Tipo do arquivo: ${file.type}`,
        `Nome do arquivo: ${file.name}`
      ].join(' | ');
      
      setMensagem({
        tipo: 'erro',
        texto: `${errorMessage}\n\nDetalhes: ${debugInfo}`
      });
    } finally {
      setUploadingHeroImage(false);
      setHeroImageProgress(0);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemoveHeroImage = () => {
    setHeroImageUrl('');
    setMensagem({
      tipo: 'sucesso',
      texto: 'Imagem de capa removida. Lembre-se de guardar as alterações.'
    });

    setTimeout(() => {
      setMensagem({ tipo: '', texto: '' });
    }, 3000);
  };

  const salvarPropriedade = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      if (!nome || !descricao || !morada) {
        setMensagem({ tipo: 'erro', texto: 'Por favor, preencha todos os campos obrigatórios.' });
        setSalvando(false);
        return;
      }

      const dadosPropriedade = {
        nome,
        descricao,
        morada,
        sobre_footer: sobreFooter,
        telefone,
        email,
        horario_checkin: horarioCheckin,
        horario_checkout: horarioCheckout,
        horario_rececao: horarioRececao,
        hero_image_url: heroImageUrl || null,
        link_externo_url: linkExternoUrl || null,
        link_externo_texto: linkExternoTexto || null,
        titulo_quartos: tituloQuartos || null,
        descricao_quartos: descricaoQuartos || null,
        titulo_comodidades: tituloComodidades || null,
        descricao_comodidades: descricaoComodidades || null
      };

      const { error } = await supabase
        .from('propriedade')
        .update(dadosPropriedade)
        .eq('id', propriedade?.id);

      if (error) throw error;

      setPropriedade(prev => prev ? { ...prev, ...dadosPropriedade } : null);
      
      setMensagem({ 
        tipo: 'sucesso', 
        texto: 'Informações da propriedade atualizadas com sucesso!' 
      });
      
      await carregarDados();
      
      setTimeout(() => {
        setMensagem({ tipo: '', texto: '' });
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar propriedade:', error);
      setMensagem({ 
        tipo: 'erro', 
        texto: 'Ocorreu um erro ao salvar as informações. Por favor, tente novamente.' 
      });
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
      <div className="container-custom py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-64">
            <AdminSidebar activeItem="propriedade" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Informações da Propriedade</h1>
              <p className="text-gray-600">
                Atualize os detalhes gerais da sua propriedade que serão exibidos aos visitantes.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <form onSubmit={salvarPropriedade}>
                {mensagem.texto && (
                  <motion.div 
                    className={`mb-6 p-4 rounded ${
                      mensagem.tipo === 'erro' ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'
                    }`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {mensagem.texto}
                  </motion.div>
                )}

                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
                      Informações Gerais
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="nome" className="label">Nome da Propriedade*</label>
                        <input
                          type="text"
                          id="nome"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          className="input"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="descricao" className="label">Descrição*</label>
                        <textarea
                          id="descricao"
                          value={descricao}
                          onChange={(e) => setDescricao(e.target.value)}
                          className="input h-32"
                          required
                        ></textarea>
                      </div>

                      <div>
                        <label htmlFor="morada" className="label">Morada*</label>
                        <input
                          type="text"
                          id="morada"
                          value={morada}
                          onChange={(e) => setMorada(e.target.value)}
                          className="input"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                      <h2 className="text-lg font-semibold">Comodidades</h2>
                      <button
                        type="button"
                        onClick={() => setModalComodidade(true)}
                        className="btn-secondary flex items-center text-sm"
                      >
                        <PlusCircle size={16} className="mr-2" />
                        Nova Comodidade
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {comodidades
                        .sort((a, b) => a.nome.localeCompare(b.nome))
                        .map((comodidade) => {
                          const isDeletable = isAmenityDeletable(comodidade.nome);
                          
                          return (
                            <motion.div
                              key={comodidade.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`group flex items-center p-3 rounded-lg border transition-all ${
                                comodidadesSelecionadas.includes(comodidade.id)
                                  ? 'border-gray-800 bg-gray-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div 
                                onClick={() => toggleComodidade(comodidade.id)}
                                className="flex-1 flex items-center cursor-pointer min-w-0"
                              >
                                <div className={`flex-shrink-0 p-2 rounded-full transition-colors ${
                                  comodidadesSelecionadas.includes(comodidade.id)
                                    ? 'bg-gray-800 text-white'
                                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                }`}>
                                  {icones[comodidade.icone] || <CheckCircle size={20} />}
                                </div>
                                <div className="ml-3 min-w-0">
                                  <h3 className="text-sm font-medium truncate" title={comodidade.nome}>
                                    {comodidade.nome}
                                  </h3>
                                  <p 
                                    className="text-xs text-gray-500 truncate"
                                    title={comodidade.descricao}
                                  >
                                    {comodidade.descricao}
                                  </p>
                                </div>
                              </div>
                              {isDeletable ? (
                                <button
                                  onClick={() => abrirModalExclusao(comodidade)}
                                  className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                  title="Excluir comodidade"
                                >
                                  <Trash2 size={16} />
                                </button>
                              ) : (
                                <div 
                                  className="ml-2 p-1 text-gray-300 cursor-not-allowed" 
                                  title="Esta comodidade não pode ser excluída"
                                >
                                  <Trash2 size={16} />
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
                      Personalização das Seções
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-md font-medium mb-3">Seção "Quartos"</h3>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="titulo_quartos" className="label">Título da Seção</label>
                            <input
                              type="text"
                              id="titulo_quartos"
                              value={tituloQuartos}
                              onChange={(e) => setTituloQuartos(e.target.value)}
                              className="input"
                              placeholder="Nossos Quartos"
                            />
                          </div>
                          <div>
                            <label htmlFor="descricao_quartos" className="label">Descrição da Seção</label>
                            <textarea
                              id="descricao_quartos"
                              value={descricaoQuartos}
                              onChange={(e) => setDescricaoQuartos(e.target.value)}
                              className="input h-20"
                              placeholder="Todos os nossos quartos são cuidadosamente decorados para oferecer conforto e tranquilidade durante a sua estadia."
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-md font-medium mb-3">Seção "Comodidades"</h3>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="titulo_comodidades" className="label">Título da Seção</label>
                            <input
                              type="text"
                              id="titulo_comodidades"
                              value={tituloComodidades}
                              onChange={(e) => setTituloComodidades(e.target.value)}
                              className="input"
                              placeholder="Comodidades"
                            />
                          </div>
                          <div>
                            <label htmlFor="descricao_comodidades" className="label">Descrição da Seção</label>
                            <textarea
                              id="descricao_comodidades"
                              value={descricaoComodidades}
                              onChange={(e) => setDescricaoComodidades(e.target.value)}
                              className="input h-20"
                              placeholder="Oferecemos uma variedade de comodidades para tornar a sua estadia o mais confortável possível."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
                      Imagem de Capa
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="label">Imagem de fundo da página inicial</label>
                        <p className="text-sm text-gray-600 mb-3">
                          Esta imagem será exibida como fundo na seção principal da página inicial.
                          Recomendado: 1920x1080px ou superior.
                        </p>
                        
                        {heroImageUrl ? (
                          <div className="space-y-3">
                            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={getOptimizedImageUrl(heroImageUrl, 800)}
                                alt="Imagem de capa"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex space-x-2">
                              <label className="btn-secondary cursor-pointer">
                                <Upload size={16} className="mr-2" />
                                Alterar Imagem
                                <input
                                  type="file"
                                  accept=".jpg,.jpeg"
                                  onChange={handleHeroImageSelect}
                                  className="hidden"
                                  disabled={uploadingHeroImage}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={handleRemoveHeroImage}
                                className="btn-secondary text-gray-600 hover:text-gray-800"
                                disabled={uploadingHeroImage}
                              >
                                <Trash2 size={16} className="mr-2" />
                                Remover
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <div className="text-center">
                              <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                              <label className="btn-primary cursor-pointer">
                                {uploadingHeroImage ? (
                                  <>
                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                    Carregando... {heroImageProgress}%
                                  </>
                                ) : (
                                  <>
                                    <Upload size={16} className="mr-2" />
                                    Selecionar Imagem
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept=".jpg,.jpeg"
                                  onChange={handleHeroImageSelect}
                                  className="hidden"
                                  disabled={uploadingHeroImage}
                                />
                              </label>
                              <p className="text-sm text-gray-500 mt-2">
                                Apenas JPG/JPEG • Máximo 3MB • Mínimo 800x600px
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
                      Informações do Rodapé
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="sobre_footer" className="label">Texto "Sobre Nós"</label>
                        <textarea
                          id="sobre_footer"
                          value={sobreFooter}
                          onChange={(e) => setSobreFooter(e.target.value)}
                          className="input h-24"
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="telefone" className="label">Telefone</label>
                          <input
                            type="text"
                            id="telefone"
                            value={telefone}
                            onChange={(e) => setTelefone(e.target.value)}
                            className="input"
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className="label">Email</label>
                          <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="horario_checkin" className="label">Horário Check-in</label>
                          <input
                            type="text"
                            id="horario_checkin"
                            value={horarioCheckin}
                            onChange={(e) => setHorarioCheckin(e.target.value)}
                            className="input"
                            placeholder="14:00 - 20:00"
                          />
                        </div>

                        <div>
                          <label htmlFor="horario_checkout" className="label">Horário Check-out</label>
                          <input
                            type="text"
                            id="horario_checkout"
                            value={horarioCheckout}
                            onChange={(e) => setHorarioCheckout(e.target.value)}
                            className="input"
                            placeholder="até às 11:00"
                          />
                        </div>

                        <div>
                          <label htmlFor="horario_rececao" className="label">Horário Receção</label>
                          <input
                            type="text"
                            id="horario_rececao"
                            value={horarioRececao}
                            onChange={(e) => setHorarioRececao(e.target.value)}
                            className="input"
                            placeholder="08:00 - 20:00"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="link_externo_texto" className="label">Texto do Link Externo</label>
                          <input
                            type="text"
                            id="link_externo_texto"
                            value={linkExternoTexto}
                            onChange={(e) => setLinkExternoTexto(e.target.value)}
                            className="input"
                            placeholder="Ex: Visite o nosso site"
                          />
                        </div>

                        <div>
                          <label htmlFor="link_externo_url" className="label">URL do Link Externo</label>
                          <input
                            type="url"
                            id="link_externo_url"
                            value={linkExternoUrl}
                            onChange={(e) => setLinkExternoUrl(e.target.value)}
                            className="input"
                            placeholder="https://exemplo.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-8 flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary flex items-center"
                    disabled={salvando}
                  >
                    <Save size={18} className="mr-2" />
                    {salvando ? 'A guardar...' : 'Guardar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalComodidade && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-white rounded-lg shadow-lg max-w-md w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Nova Comodidade</h3>
                
                <form onSubmit={adicionarComodidade}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="nomeComodidade" className="label">Nome</label>
                      <input
                        type="text"
                        id="nomeComodidade"
                        value={novaComodidade.nome}
                        onChange={(e) => setNovaComodidade(prev => ({ ...prev, nome: e.target.value }))}
                        className={`input ${errosComodidade.nome ? 'border-gray-800' : ''}`}
                        maxLength={30}
                      />
                      {errosComodidade.nome && (
                        <p className="mt-1 text-sm text-gray-800">{errosComodidade.nome}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="descricaoComodidade" className="label">Descrição</label>
                      <textarea
                        id="descricaoComodidade"
                        value={novaComodidade.descricao}
                        onChange={(e) => setNovaComodidade(prev => ({ ...prev, descricao: e.target.value }))}
                        className={`input ${errosComodidade.descricao ? 'border-gray-800' : ''}`}
                        maxLength={60}
                      />
                      {errosComodidade.descricao && (
                        <p className="mt-1 text-sm text-gray-800">{errosComodidade.descricao}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setModalComodidade(false)}
                      className="btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      Adicionar
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalExclusao && comodidadeParaExcluir && (
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
                
                <p className="text-gray-600 mb-6">
                  Tem certeza que deseja excluir a comodidade <strong>"{comodidadeParaExcluir.nome}"</strong>?
                  Esta ação não pode ser desfeita.
                </p>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={fecharModalExclusao}
                    className="btn-secondary"
                    disabled={atualizando}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={excluirComodidade}
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

export default AdminPropriedade;