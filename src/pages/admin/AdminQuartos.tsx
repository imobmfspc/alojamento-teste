import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../supabase/client';
import { Trash2, Edit, Eye, PlusCircle, CheckCircle, XCircle, Image, Save } from 'lucide-react';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { RoomForm, RoomFormData, RoomFormHandle } from '../../components/admin/RoomForm';
import { motion, AnimatePresence } from 'framer-motion';
import { compressImage, uploadImage } from '../../utils/imageUtils';

interface Quarto {
  id: number;
  nome: string;
  descricao: string;
  preco_noite: number;
  capacidade: number;
  tamanho_m2: number;
  disponivel: boolean;
  comodidades: string[];
  imagem_principal?: string;
}

const AdminQuartos: React.FC = () => {
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [quartoAtual, setQuartoAtual] = useState<Quarto | null>(null);
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [initialRoomFormData, setInitialRoomFormData] = useState<RoomFormData | undefined>(undefined);
  const roomFormRef = useRef<RoomFormHandle>(null);

  const carregarQuartos = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: dadosQuartos, error: erroQuartos } = await supabase
        .from('quartos')
        .select('*')
        .order('id', { ascending: true });

      if (erroQuartos) {
        console.error('Erro ao carregar quartos:', erroQuartos);
        return;
      }

      if (dadosQuartos) {
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
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarQuartos();
  }, [carregarQuartos]);

  // Função para preparar dados iniciais para edição
  const prepararDadosEdicao = useCallback(async (quarto: Quarto): Promise<RoomFormData> => {
    // Buscar imagens existentes do quarto
    const { data: imagens } = await supabase
      .from('imagens_quartos')
      .select('url, ordem')
      .eq('quarto_id', quarto.id)
      .order('ordem', { ascending: true });

    return {
      nome: quarto.nome,
      descricao: quarto.descricao,
      precoNoite: quarto.preco_noite.toString(),
      capacidade: quarto.capacidade.toString(),
      tamanhoM2: quarto.tamanho_m2.toString(),
      disponivel: quarto.disponivel,
      comodidades: quarto.comodidades,
      rawImages: [], // Sempre vazio para edição
      existingImages: imagens || [] // Imagens já existentes
    };
  }, []);

  const abrirModal = useCallback(async (quarto: Quarto | null = null) => {
    setQuartoAtual(quarto);
    
    if (quarto) {
      // Para edição, preparar dados iniciais
      const dadosIniciais = await prepararDadosEdicao(quarto);
      setInitialRoomFormData(dadosIniciais);
    } else {
      // Para criação, limpar dados iniciais
      setInitialRoomFormData(undefined);
    }
    
    setModalAberto(true);
  }, [prepararDadosEdicao]);

  const fecharModal = useCallback(() => {
    setModalAberto(false);
    setQuartoAtual(null);
    setInitialRoomFormData(undefined);
    setMensagem({ tipo: '', texto: '' });
  }, []);

  const abrirModalExclusao = useCallback((quarto: Quarto) => {
    setQuartoAtual(quarto);
    setModalExclusaoAberto(true);
  }, []);

  const fecharModalExclusao = useCallback(() => {
    setModalExclusaoAberto(false);
    setQuartoAtual(null);
    setMensagem({ tipo: '', texto: '' });
  }, []);

  const handleSaveRoom = () => {
    if (roomFormRef.current) {
      roomFormRef.current.submitForm();
    }
  };

  const salvarQuarto = async (formData: RoomFormData) => {
    setProcessando(true);

    try {
      console.log('Iniciando salvamento do quarto:', {
        isEditing: !!quartoAtual,
        quartoId: quartoAtual?.id,
        rawImagesCount: formData.rawImages.length,
        existingImagesCount: formData.existingImages.length
      });

      const dadosQuarto = {
        nome: formData.nome,
        descricao: formData.descricao,
        preco_noite: Number(formData.precoNoite),
        capacidade: Number(formData.capacidade),
        tamanho_m2: Number(formData.tamanhoM2),
        disponivel: formData.disponivel,
        comodidades: formData.comodidades
      };

      let quartoId: number;

      if (quartoAtual) {
        // Atualização de quarto existente
        console.log('Atualizando quarto existente:', quartoAtual.id);
        const { error } = await supabase
          .from('quartos')
          .update(dadosQuarto)
          .eq('id', quartoAtual.id);

        if (error) throw error;
        quartoId = quartoAtual.id;
        
        // Remover todas as imagens existentes
        console.log('Removendo imagens existentes do quarto:', quartoId);
        await supabase
          .from('imagens_quartos')
          .delete()
          .eq('quarto_id', quartoId);
      } else {
        // Criação de novo quarto
        console.log('Criando novo quarto');
        const { data, error } = await supabase
          .from('quartos')
          .insert(dadosQuarto)
          .select();

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Falha ao criar quarto');
        
        quartoId = data[0].id;
        console.log('Novo quarto criado com ID:', quartoId);
      }
      
      // Fechar modal imediatamente após operação bem-sucedida
      fecharModal();
      setProcessando(false);

      // Primeiro, fazer upload das novas imagens para o Cloudinary
      const uploadedNewImages: { url: string; ordem: number }[] = [];
      
      if (formData.rawImages.length > 0) {
        console.log('Fazendo upload das novas imagens:', formData.rawImages.length);
        
        for (let i = 0; i < formData.rawImages.length; i++) {
          const file = formData.rawImages[i];
          const ordemTemporaria = formData.existingImages.length + i; // Ordem temporária
          
          try {
            console.log(`Processando imagem ${i + 1}/${formData.rawImages.length}:`, {
              fileName: file.name,
              fileSize: file.size,
              ordem: ordemTemporaria
            });
            
            // Comprimir a imagem
            const compressedFile = await compressImage(file);
            console.log('Imagem comprimida:', {
              originalSize: file.size,
              compressedSize: compressedFile.size
            });
            
            // Fazer upload da imagem
            const url = await uploadImage(compressedFile, quartoId, ordemTemporaria);
            console.log('Upload concluído:', { url, ordem: ordemTemporaria });
            
            uploadedNewImages.push({ url, ordem: ordemTemporaria });
          } catch (uploadError) {
            console.error(`Erro ao fazer upload da imagem ${i + 1}:`, uploadError);
            // Fornecer mais detalhes sobre o erro
            const errorMessage = uploadError instanceof Error ? uploadError.message : String(uploadError);
            throw new Error(`Erro no upload da imagem ${i + 1}: ${errorMessage}`);
          }
        }
      }

      // Criar lista final de todas as imagens que devem estar no quarto
      const finalImagesToInsert: { url: string; ordem: number }[] = [];
      
      // Adicionar imagens existentes que foram mantidas
      formData.existingImages.forEach((img) => {
        finalImagesToInsert.push({ url: img.url, ordem: img.ordem });
      });
      
      // Adicionar novas imagens que foram carregadas
      uploadedNewImages.forEach((img) => {
        finalImagesToInsert.push({ url: img.url, ordem: img.ordem });
      });
      
      // Ordenar por ordem original e reatribuir ordem sequencial
      finalImagesToInsert.sort((a, b) => a.ordem - b.ordem);
      finalImagesToInsert.forEach((img, index) => {
        img.ordem = index; // Reatribuir ordem sequencial começando de 0
      });
      
      console.log('Lista final de imagens para inserir:', {
        totalImages: finalImagesToInsert.length,
        existingKept: formData.existingImages.length,
        newUploaded: uploadedNewImages.length,
        finalList: finalImagesToInsert
      });
      
      // Remover todas as imagens existentes do quarto
      console.log('Removendo todas as imagens existentes do quarto:', quartoId);
      const { error: erroRemocao } = await supabase
        .from('imagens_quartos')
        .delete()
        .eq('quarto_id', quartoId);
      
      if (erroRemocao) {
        console.error('Erro ao remover imagens existentes:', erroRemocao);
        throw erroRemocao;
      }
      
      // Inserir todas as imagens na ordem correta
      if (finalImagesToInsert.length > 0) {
        console.log('Inserindo todas as imagens na base de dados:', finalImagesToInsert.length);
        const imagensParaInserir = finalImagesToInsert.map((img) => ({
          quarto_id: quartoId,
          url: img.url,
          ordem: img.ordem
        }));

        const { error: erroInsercao } = await supabase
          .from('imagens_quartos')
          .insert(imagensParaInserir);

        if (erroInsercao) {
          console.error('Erro ao inserir imagens na base de dados:', erroInsercao);
          throw erroInsercao;
        }
        console.log('Todas as imagens inseridas com sucesso na base de dados');
      }

      // Recarregar dados para verificar se as imagens foram salvas corretamente
      console.log('Recarregando lista de quartos...');
      await carregarQuartos();
      
      // Mensagem de sucesso
      const mensagemSucesso = quartoAtual 
        ? 'Quarto atualizado com sucesso!' 
        : 'Novo quarto criado com sucesso!';

      setMensagem({ 
        tipo: 'sucesso', 
        texto: mensagemSucesso
      });
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => {
        setMensagem({ tipo: '', texto: '' });
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar quarto:', error);
      setMensagem({ 
        tipo: 'erro', 
        texto: `Ocorreu um erro ao salvar o quarto: ${error instanceof Error ? error.message : String(error)}` 
      });
      setProcessando(false);
    } finally {
      // Não fazer nada aqui, pois já definimos setProcessando(false) nos blocos try/catch
    }
  };

  const excluirQuarto = async () => {
    if (!quartoAtual) return;
    
    setProcessando(true);

    try {
      // Verificar se existem reservas para este quarto
      const { data: reservas, error: erroReservas } = await supabase
        .from('reservas')
        .select('id, data_checkin, data_checkout')
        .eq('quarto_id', quartoAtual.id);

      if (erroReservas) throw erroReservas;

      if (reservas && reservas.length > 0) {
        // Existem reservas associadas ao quarto
        const reservasFuturas = reservas.filter(reserva => 
          new Date(reserva.data_checkout) > new Date()
        );

        if (reservasFuturas.length > 0) {
          throw new Error('Este quarto possui reservas futuras e não pode ser excluído. Por favor, cancele ou transfira as reservas antes de excluir o quarto.');
        } else {
          throw new Error('Este quarto possui reservas passadas associadas e não pode ser excluído para manter o histórico.');
        }
      }

      // Se não houver reservas, prosseguir com a exclusão
      await supabase
        .from('imagens_quartos')
        .delete()
        .eq('quarto_id', quartoAtual.id);
      
      const { error } = await supabase
        .from('quartos')
        .delete()
        .eq('id', quartoAtual.id);

      if (error) throw error;
      
      // Fechar modal imediatamente após operação bem-sucedida
      fecharModalExclusao();
      setProcessando(false);
      
      await carregarQuartos();
      
      setMensagem({ tipo: 'sucesso', texto: 'Quarto excluído com sucesso!' });
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => {
        setMensagem({ tipo: '', texto: '' });
      }, 3000);
    } catch (error) {
      console.error('Erro ao excluir quarto:', error);
      setMensagem({ 
        tipo: 'erro', 
        texto: error instanceof Error ? error.message : 'Ocorreu um erro ao excluir o quarto. Por favor, tente novamente.' 
      });
      setProcessando(false);
    } finally {
      // Não fazer nada aqui, pois já definimos setProcessando(false) nos blocos try/catch
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
      <div className="container-custom py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64">
            <AdminSidebar activeItem="quartos" />
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Gerir Quartos</h1>
              <button
                onClick={() => abrirModal()}
                className="btn-primary flex items-center"
              >
                <PlusCircle size={18} className="mr-2" />
                Novo Quarto
              </button>
            </div>

            {/* Mensagem de feedback na página principal */}
            <AnimatePresence>
              {mensagem.texto && (
                <motion.div 
                  className={`mb-6 p-4 rounded ${
                    mensagem.tipo === 'erro' ? 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {mensagem.texto}
                </motion.div>
              )}
            </AnimatePresence>

            {quartos.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-600 mb-4">Não existem quartos cadastrados.</p>
                <button
                  onClick={() => abrirModal()}
                  className="btn-primary inline-flex items-center"
                >
                  <PlusCircle size={18} className="mr-2" />
                  Adicionar Primeiro Quarto
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quarto
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Preço/Noite
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Capacidade
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Disponível
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {quartos.map((quarto) => (
                        <tr key={quarto.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-md bg-gray-100 overflow-hidden mr-3">
                                {quarto.imagem_principal ? (
                                  <img
                                    src={quarto.imagem_principal}
                                    alt={quarto.nome}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                                    <Image size={20} />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{quarto.nome}</div>
                                <div className="text-gray-500 text-sm truncate max-w-64">
                                  {quarto.descricao.substring(0, 60)}
                                  {quarto.descricao.length > 60 ? '...' : ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-900 font-medium">{quarto.preco_noite}€</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-900">
                              {quarto.capacidade} {quarto.capacidade === 1 ? 'pessoa' : 'pessoas'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {quarto.disponivel ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <CheckCircle size={14} className="mr-1" />
                                Sim
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                                <XCircle size={14} className="mr-1" />
                                Não
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <a
                                href={`/quarto/${quarto.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-900 p-1"
                                title="Visualizar"
                              >
                                <Eye size={18} />
                              </a>
                              <button
                                onClick={async () => {
                                  await abrirModal(quarto);
                                }}
                                className="text-gray-600 hover:text-gray-900 p-1"
                                title="Editar"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => abrirModalExclusao(quarto)}
                                className="text-gray-600 hover:text-gray-900 p-1"
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
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edição/Criação */}
      <AnimatePresence>
        {modalAberto && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] flex flex-col"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="sticky top-0 z-10 bg-white p-6 border-b border-gray-200 rounded-t-lg">
                <h3 className="text-xl font-semibold">
                  {quartoAtual ? 'Editar Quarto' : 'Novo Quarto'}
                </h3>
              </div>

              <div className="flex-grow overflow-y-auto p-6">
                <RoomForm
                  ref={roomFormRef}
                  onSubmit={salvarQuarto}
                  initialData={initialRoomFormData}
                  isEditing={!!quartoAtual}
                  processando={processando}
                  hideFooter={true}
                />
              </div>
              
              <div className="sticky bottom-0 z-10 bg-white p-6 border-t border-gray-200 flex justify-end space-x-3 rounded-b-lg">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="btn-secondary"
                  disabled={processando}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveRoom}
                  className="btn-primary"
                  disabled={processando}
                >
                  {processando ? (
                    <>
                      <Save size={18} className="mr-2" />
                      A guardar...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      {quartoAtual ? 'Guardar Alterações' : 'Criar Quarto'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Exclusão */}
      <AnimatePresence>
        {modalExclusaoAberto && quartoAtual && (
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
                  Tem certeza que deseja excluir o quarto <strong>"{quartoAtual.nome}"</strong>?
                  Esta ação não pode ser desfeita.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={fecharModalExclusao}
                    className="btn-secondary"
                    disabled={processando}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={excluirQuarto}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md"
                    disabled={processando}
                  >
                    {processando ? 'A excluir...' : 'Excluir'}
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

export default AdminQuartos;