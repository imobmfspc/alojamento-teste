import React, { useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { PlusCircle, XCircle, Image, Save, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUploader from './ImageUploader';

export interface RoomFormHandle {
  submitForm: () => void;
}

interface RoomFormProps {
  onSubmit: (formData: RoomFormData) => Promise<void>;
  initialData?: RoomFormData;
  isEditing?: boolean;
  processando: boolean;
  hideFooter?: boolean;
}

// Nova interface para representar imagens na UI
interface DisplayImage {
  id: string;
  url: string;
  file?: File; // Para novas imagens
  type: 'existing' | 'new';
  ordem: number;
}

export interface RoomFormData {
  nome: string;
  descricao: string;
  precoNoite: string;
  capacidade: string;
  tamanhoM2: string;
  disponivel: boolean;
  comodidades: string[];
  rawImages: File[]; // Novas imagens selecionadas pelo utilizador
  existingImages: { url: string; ordem: number }[]; // Imagens já existentes que não foram removidas
}

const comodidadesSugeridas = [
  'Casa de banho privativa',
  'Ar condicionado',
  'TV por cabo',
  'Wi-Fi',
  'Frigorífico',
  'Varanda',
  'Vista para o mar',
  'Secador de cabelo',
  'Cofre',
  'Chaleira elétrica'
];

export const RoomForm = React.forwardRef<RoomFormHandle, RoomFormProps>(({
  onSubmit,
  initialData,
  isEditing = false,
  processando,
  hideFooter = false
}, ref) => {
  const [formData, setFormData] = useState<RoomFormData>(initialData || {
    nome: '',
    descricao: '',
    precoNoite: '',
    capacidade: '1',
    tamanhoM2: '',
    disponivel: true,
    comodidades: [],
    rawImages: [],
    existingImages: []
  });

  // Estado unificado para todas as imagens (existentes + novas)
  const [displayImages, setDisplayImages] = useState<DisplayImage[]>(() => {
    if (initialData?.existingImages) {
      return initialData.existingImages.map((img, index) => ({
        id: `existing-${index}-${img.url}`,
        url: img.url,
        type: 'existing' as const,
        ordem: img.ordem
      }));
    }
    return [];
  });

  const [novaComodidade, setNovaComodidade] = useState('');
  const [erro, setErro] = useState('');

  // Debounce para campos que podem causar re-renders frequentes
  const [debouncedNome] = useDebounce(formData.nome, 300);
  const [debouncedDescricao] = useDebounce(formData.descricao, 300);

  React.useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit();
    }
  }));

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleDisponibilidadeChange = useCallback((disponivel: boolean) => {
    setFormData(prev => ({ ...prev, disponivel }));
  }, []);

  const adicionarComodidade = useCallback((comodidade: string) => {
    if (comodidade.trim() && !formData.comodidades.includes(comodidade.trim())) {
      setFormData(prev => ({
        ...prev,
        comodidades: [...prev.comodidades, comodidade.trim()]
      }));
      setNovaComodidade('');
    }
  }, [formData.comodidades]);

  const removerComodidade = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      comodidades: prev.comodidades.filter((_, i) => i !== index)
    }));
  }, []);

  const handleNewImagesSelected = useCallback((novasImagens: File[]) => {
    const newDisplayImages: DisplayImage[] = novasImagens.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      file,
      type: 'new',
      ordem: displayImages.length + index
    }));

    setDisplayImages(prev => [...prev, ...newDisplayImages]);
  }, [displayImages.length]);

  const removeImage = useCallback((imageId: string) => {
    setDisplayImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      
      // Se for uma nova imagem, revogar o URL do objeto
      if (imageToRemove?.type === 'new' && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      
      // Remover a imagem e reordenar
      const updatedImages = prev.filter(img => img.id !== imageId);
      return updatedImages.map((img, index) => ({
        ...img,
        ordem: index
      }));
    });
  }, []);

  const moveImage = useCallback((imageId: string, direction: 'up' | 'down') => {
    setDisplayImages(prev => {
      const currentIndex = prev.findIndex(img => img.id === imageId);
      if (currentIndex === -1) return prev;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      // Verificar limites
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      // Criar nova array com as imagens trocadas
      const newImages = [...prev];
      [newImages[currentIndex], newImages[newIndex]] = [newImages[newIndex], newImages[currentIndex]];

      // Atualizar a ordem de todas as imagens
      return newImages.map((img, index) => ({
        ...img,
        ordem: index
      }));
    });
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setErro('');

    // Validações
    if (!formData.nome || !formData.descricao || !formData.precoNoite || !formData.tamanhoM2) {
      setErro('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (parseFloat(formData.precoNoite) <= 0) {
      setErro('O preço por noite deve ser maior que zero.');
      return;
    }

    if (parseInt(formData.tamanhoM2) <= 0) {
      setErro('O tamanho do quarto deve ser maior que zero.');
      return;
    }

    try {
      // Separar as imagens de volta para o formato esperado
      const rawImages: File[] = [];
      const existingImages: { url: string; ordem: number }[] = [];

      displayImages.forEach((img) => {
        if (img.type === 'new' && img.file) {
          rawImages.push(img.file);
        } else if (img.type === 'existing') {
          existingImages.push({
            url: img.url,
            ordem: img.ordem
          });
        }
      });

      const submissionData: RoomFormData = {
        ...formData,
        rawImages,
        existingImages
      };

      await onSubmit(submissionData);
    } catch (error) {
      setErro('Ocorreu um erro ao salvar o quarto. Por favor, tente novamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {erro && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-100 border-l-4 border-gray-800 p-4"
        >
          <p className="text-gray-800">{erro}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nome" className="label">Nome do Quarto*</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            className="input"
            required
          />
        </div>

        <div>
          <label htmlFor="precoNoite" className="label">Preço por Noite (€)*</label>
          <input
            type="number"
            id="precoNoite"
            name="precoNoite"
            value={formData.precoNoite}
            onChange={handleInputChange}
            className="input"
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="capacidade" className="label">Capacidade*</label>
          <select
            id="capacidade"
            name="capacidade"
            value={formData.capacidade}
            onChange={handleInputChange}
            className="input"
            required
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'pessoa' : 'pessoas'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tamanhoM2" className="label">Tamanho (m²)*</label>
          <input
            type="number"
            id="tamanhoM2"
            name="tamanhoM2"
            value={formData.tamanhoM2}
            onChange={handleInputChange}
            className="input"
            min="0"
            required
          />
        </div>

        <div>
          <label className="label">Disponível</label>
          <div className="flex items-center mt-2">
            <label className="inline-flex items-center mr-4">
              <input
                type="radio"
                checked={formData.disponivel === true}
                onChange={() => handleDisponibilidadeChange(true)}
                className="form-radio"
              />
              <span className="ml-2">Sim</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.disponivel === false}
                onChange={() => handleDisponibilidadeChange(false)}
                className="form-radio"
              />
              <span className="ml-2">Não</span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="descricao" className="label">Descrição*</label>
        <textarea
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleInputChange}
          className="input h-24"
          required
        />
      </div>

      <div>
        <label className="label">Comodidades</label>
        
        <AnimatePresence>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.comodidades.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-gray-100 rounded-full pl-3 pr-1 py-1 flex items-center"
              >
                <span className="text-sm">{item}</span>
                <button
                  type="button"
                  onClick={() => removerComodidade(index)}
                  className="ml-1 rounded-full p-1 hover:bg-gray-200"
                >
                  <XCircle size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
        
        <div className="flex">
          <input
            type="text"
            value={novaComodidade}
            onChange={(e) => setNovaComodidade(e.target.value)}
            className="input mr-2"
            placeholder="Adicionar comodidade"
          />
          <button
            type="button"
            onClick={() => adicionarComodidade(novaComodidade)}
            className="btn-secondary"
          >
            <PlusCircle size={18} className="mr-2" />
            Adicionar
          </button>
        </div>
        
        <div className="mt-2">
          <span className="text-sm text-gray-500">Sugestões:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {comodidadesSugeridas.map((item) => (
              <button
                key={item}
                type="button"
                className={`text-xs bg-gray-100 rounded-full px-2 py-1 hover:bg-gray-200 ${
                  formData.comodidades.includes(item) ? 'opacity-50' : ''
                }`}
                onClick={() => adicionarComodidade(item)}
                disabled={formData.comodidades.includes(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="label">Imagens</label>
        
        {/* Lista de imagens com reordenação */}
        <AnimatePresence>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {displayImages
              .sort((a, b) => a.ordem - b.ordem)
              .map((imagem, index) => (
                <motion.div
                  key={imagem.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group aspect-w-16 aspect-h-10 h-24 bg-gray-100 rounded-md overflow-hidden"
                >
                  <img
                    src={imagem.url}
                    alt={`Imagem ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                  
                  {/* Botões de controle */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="flex space-x-1">
                      {/* Mover para cima */}
                      <button
                        type="button"
                        onClick={() => moveImage(imagem.id, 'up')}
                        disabled={index === 0}
                        className="p-1 bg-white text-gray-800 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Mover para cima"
                      >
                        <ChevronUp size={16} />
                      </button>
                      
                      {/* Mover para baixo */}
                      <button
                        type="button"
                        onClick={() => moveImage(imagem.id, 'down')}
                        disabled={index === displayImages.length - 1}
                        className="p-1 bg-white text-gray-800 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Mover para baixo"
                      >
                        <ChevronDown size={16} />
                      </button>
                      
                      {/* Remover */}
                      <button
                        type="button"
                        onClick={() => removeImage(imagem.id)}
                        className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                        title="Remover imagem"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Indicador de posição */}
                  <div className="absolute top-1 left-1 bg-gray-800 bg-opacity-75 text-white rounded px-1.5 py-0.5 text-xs">
                    {index + 1}
                  </div>
                  
                  {/* Indicador de tipo */}
                  <div className="absolute bottom-1 left-1 bg-gray-800 bg-opacity-75 text-white rounded px-1.5 py-0.5 text-xs">
                    {imagem.type === 'existing' ? 'Existente' : 'Nova'}
                  </div>
                </motion.div>
              ))}
          </div>
        </AnimatePresence>
        
        <ImageUploader
          onNewImagesSelected={handleNewImagesSelected}
          onError={setErro}
          initialExistingImages={formData.existingImages}
        />
        
        {displayImages.length > 0 && (
          <div className="mt-3 p-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-800">
              <strong>Dica:</strong> Passe o rato sobre uma imagem para ver os controlos de reordenação. 
              A primeira imagem será a imagem principal do quarto.
            </p>
          </div>
        )}
      </div>

      {!hideFooter && (
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
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
                Guardar
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
});

RoomForm.displayName = 'RoomForm';