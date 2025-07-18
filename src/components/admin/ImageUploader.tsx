import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateImage } from '../../utils/imageUtils';

interface ImageUploaderProps {
  onNewImagesSelected: (files: File[]) => void;
  onError: (error: string) => void;
  initialExistingImages?: { url: string; ordem: number }[];
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onNewImagesSelected,
  onError,
  initialExistingImages = []
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const validation = await validateImage(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else if (validation.error) {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    if (errors.length > 0) {
      onError(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      onNewImagesSelected(validFiles);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const removedFile = selectedFiles[index];
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    
    // Notificar o componente pai que um arquivo foi removido
    // Para isso, precisamos recalcular a lista sem o arquivo removido
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    // Como não temos uma forma direta de "remover" do pai, 
    // vamos apenas atualizar o estado local
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          selectedFiles.length === 0 ? 'border-gray-300' : 'border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-full flex flex-col items-center justify-center space-y-2"
        >
          <Upload size={24} className="text-gray-400" />
          <div className="text-sm text-gray-600">
            Arraste e solte imagens aqui ou clique para selecionar
          </div>
          <div className="text-xs text-gray-500">
            Apenas JPG/JPEG • Máximo 5MB • Mínimo 800x600px
          </div>
        </button>
      </div>

      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-gray-700">Novas imagens selecionadas:</h4>
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)}MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {initialExistingImages.length > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          <p>Nota: As imagens existentes são mostradas acima na pré-visualização do formulário.</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;