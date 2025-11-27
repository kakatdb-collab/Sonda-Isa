import React, { useEffect, useState } from 'react';
import { ExtractionStatus } from '../types';

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onExtract: () => void;
  status: ExtractionStatus;
}

export const InputArea: React.FC<InputAreaProps> = ({ value, onChange, onExtract, status }) => {
  const isLoading = status === ExtractionStatus.LOADING;
  const isBookmarkletData = value.includes("LINKEDIN_EXTRACTOR");
  
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    const v29_2 = (value.match(/<<<< PAGE_SPLIT_V29_2 >>>>/g) || []).length;
    const v29_1 = (value.match(/<<<< PAGE_SPLIT_V29_1 >>>>/g) || []).length;
    const v29 = (value.match(/<<<< PAGE_SPLIT_V29 >>>>/g) || []).length;
    const v28 = (value.match(/<<<< PAGE_SPLIT_V28 >>>>/g) || []).length;
    
    if (value.trim().length > 0) {
        setPageCount(Math.max(v29_2, v29_1, v29, v28) + 1);
    } else {
        setPageCount(0);
    }
  }, [value]);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">2. Área de Colagem e Extração</h2>
      <div className="relative">
        <textarea
          className={`w-full h-48 p-3 border rounded-md font-mono text-sm ${isBookmarkletData ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
          placeholder="Cole aqui os dados copiados..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLoading}
        />
        {isBookmarkletData && pageCount > 1 && (
            <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold border border-blue-200">
              📚 MODO LOTE DETECTADO: {pageCount} PÁGINAS
            </div>
        )}
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={onExtract}
          disabled={isLoading || !value}
          className={`px-8 py-3 rounded-md text-white font-bold ${isLoading ? 'bg-gray-400' : 'bg-linkedin-600 hover:bg-linkedin-700'}`}
        >
          {isLoading ? 'Processando...' : 'Gerar Planilha'}
        </button>
      </div>
    </div>
  );
};