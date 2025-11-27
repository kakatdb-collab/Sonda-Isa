import React from 'react';
import { LinkedInProfile, ExtractionBatch } from '../types';

interface DataGridProps {
  data: LinkedInProfile[];
  batches: ExtractionBatch[];
  title: string;
  onTitleChange: (val: string) => void;
  onDownloadCSV: () => void;
  onDownloadExcel: () => void;
  onDownloadPDF: () => void;
}

export const DataGrid: React.FC<DataGridProps> = ({ data, batches, title, onTitleChange, onDownloadCSV, onDownloadExcel, onDownloadPDF }) => {
  if (data.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      
      {/* Control Bar */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex-grow w-full md:w-auto">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            Nome da Planilha
          </label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-linkedin-600 focus:outline-none text-gray-800 font-medium"
            placeholder="Ex: Leads Santander 2024"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
           <div className="text-right hidden sm:block mr-2">
              <div className="text-sm font-bold text-gray-900">{data.length} Perfis</div>
              <div className="text-xs text-gray-500">{batches.length} Lotes</div>
           </div>
           
           <button
            onClick={onDownloadCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-bold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none shadow-sm"
            title="Formato padrão CSV"
          >
            CSV
          </button>

          <button
            onClick={onDownloadExcel}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none shadow-md hover:shadow-lg transition-all"
            title="Formato otimizado para Excel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Excel
          </button>

          <button
            onClick={onDownloadPDF}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none shadow-md hover:shadow-lg transition-all"
            title="Exportar como PDF"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            PDF
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
           <h3 className="text-sm font-bold text-gray-700">Visualização dos Dados</h3>
        </div>
        <div className="overflow-x-auto max-h-[500px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tempo no Cargo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((profile, index) => (
                <tr key={index} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{profile.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 truncate max-w-xs" title={profile.role}>{profile.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{profile.company || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-linkedin-700 bg-blue-50 px-2 py-1 rounded inline-block">{profile.tenure || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{profile.location}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Import History */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Histórico da Sessão Atual</h4>
        <div className="flex flex-wrap gap-2">
           {batches.map((batch, idx) => (
             <span key={batch.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
               Importação #{idx + 1}: {batch.count} perfis ({batch.timestamp.toLocaleTimeString()})
             </span>
           ))}
        </div>
      </div>

    </div>
  );
};