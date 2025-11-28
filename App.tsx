import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { InputArea } from './components/InputArea';
import { DataGrid } from './components/DataGrid';
import { Bookmarklet } from './components/Bookmarklet';
import { extractProfilesFromText } from './services/geminiService';
import { downloadCSV, downloadExcel } from './utils/csvHelper';
import { downloadPDF } from './utils/pdfHelper';
import { LinkedInProfile, ExtractionStatus, ExtractionBatch, SavedSheet } from './types';

function App() {
  // API Key State Management
  const [apiKey, setApiKey] = useState<string>('');
  const [isConfiguring, setIsConfiguring] = useState<boolean>(true);

  const [inputText, setInputText] = useState('');
  const [spreadsheetTitle, setSpreadsheetTitle] = useState('sonda-isa-export');
  const [allProfiles, setAllProfiles] = useState<LinkedInProfile[]>([]);
  const [batches, setBatches] = useState<ExtractionBatch[]>([]);
  const [status, setStatus] = useState<ExtractionStatus>(ExtractionStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // History State
  const [savedSheets, setSavedSheets] = useState<SavedSheet[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Load API Key on Mount
  useEffect(() => {
    const storedKey = localStorage.getItem('sonda_isa_gemini_key');
    if (storedKey) {
      setApiKey(storedKey);
      setIsConfiguring(false);
    }
  }, []);

  const handleSaveKey = (key: string) => {
    if (key.trim().length > 10) {
      localStorage.setItem('sonda_isa_gemini_key', key.trim());
      setApiKey(key.trim());
      setIsConfiguring(false);
    } else {
      alert("Chave inválida. Verifique e tente novamente.");
    }
  };

  const handleResetKey = () => {
    if (confirm("Deseja alterar a Chave de API?")) {
      setIsConfiguring(true);
    }
  };

  // Load History from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('li_extractor_history_v41_2');
      if (stored) {
        setSavedSheets(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading history", e);
    }
  }, []);

  // Save History
  useEffect(() => {
    localStorage.setItem('li_extractor_history_v41_2', JSON.stringify(savedSheets));
  }, [savedSheets]);

  const saveCurrentSheet = () => {
    if (allProfiles.length === 0) return;
    const newSheet: SavedSheet = {
      id: Date.now().toString(),
      title: spreadsheetTitle || 'Sem título',
      date: new Date().toISOString(),
      profiles: allProfiles,
      batches: batches
    };
    setSavedSheets(prev => [newSheet, ...prev].slice(0, 30));
  };

  const handleNewSheet = () => {
    if (allProfiles.length > 0) saveCurrentSheet();
    setAllProfiles([]);
    setBatches([]);
    setSpreadsheetTitle('sonda-isa-export');
    setInputText('');
    setStatus(ExtractionStatus.IDLE);
    setSuccessMessage(null);
  };

  const loadSheet = (sheet: SavedSheet) => {
    if (allProfiles.length > 0 && !window.confirm("Carregar planilha antiga substituirá a atual. Continuar?")) return;
    setAllProfiles(sheet.profiles);
    setBatches(sheet.batches);
    setSpreadsheetTitle(sheet.title);
    setSuccessMessage(`Planilha carregada: ${sheet.title}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteSheet = (id: string) => {
    if (window.confirm("Excluir esta planilha do histórico?")) {
      setSavedSheets(prev => prev.filter(s => s.id !== id));
    }
  };

  // Deduplication Logic
  const isDuplicate = (p1: LinkedInProfile, p2: LinkedInProfile) => {
    if (p1.profileUrl && p2.profileUrl && p1.profileUrl.length > 10 && p2.profileUrl.length > 10) {
      if (p1.profileUrl === p2.profileUrl) return true;
    }
    const norm = (s: string) => s ? s.toLowerCase().trim().replace(/[^a-z0-9]/g, '') : '';
    const n1 = norm(p1.name);
    const n2 = norm(p2.name);
    const c1 = norm(p1.company);
    const c2 = norm(p2.company);
    if (!n1 || !n2) return false;
    if (n1 === n2) {
       if (c1 === c2) return true;
       if (c1.length > 3 && c2.length > 3) {
          if (c1.includes(c2) || c2.includes(c1)) return true;
       }
    }
    return false;
  };

  const handleExtract = useCallback(async () => {
    if (!inputText.trim()) return;
    setStatus(ExtractionStatus.LOADING);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Pass the API Key dynamically here
      const rawData = await extractProfilesFromText(inputText, apiKey);
      
      if (rawData.length === 0) {
        setErrorMessage("Nenhum perfil encontrado.");
        setStatus(ExtractionStatus.ERROR);
      } else {
        setAllProfiles(prevProfiles => {
          let duplicatesCount = 0;
          const uniqueNewData = rawData.filter(newProfile => {
            const exists = prevProfiles.some(existingProfile => isDuplicate(existingProfile, newProfile));
            if (exists) duplicatesCount++;
            return !exists;
          });

          if (duplicatesCount > 0) {
            setSuccessMessage(`${uniqueNewData.length} novos perfis adicionados. ${duplicatesCount} duplicatas removidas automaticamente.`);
          } else {
            setSuccessMessage(`${uniqueNewData.length} perfis adicionados com sucesso.`);
          }

          return [...prevProfiles, ...uniqueNewData];
        });

        setBatches(prev => [...prev, { id: Date.now().toString(), timestamp: new Date(), count: rawData.length }]);
        setInputText('');
        setStatus(ExtractionStatus.SUCCESS);
      }
    } catch (error: any) {
      console.error(error);
      setStatus(ExtractionStatus.ERROR);
      setErrorMessage("Erro: " + (error.message || "Erro inesperado ao processar."));
    }
  }, [inputText, apiKey]);

  const handleDownloadCSV = useCallback(() => {
    downloadCSV(allProfiles, spreadsheetTitle);
  }, [allProfiles, spreadsheetTitle]);

  const handleDownloadExcel = useCallback(() => {
    downloadExcel(allProfiles, spreadsheetTitle);
  }, [allProfiles, spreadsheetTitle]);

  const handleDownloadPDF = useCallback(() => {
    downloadPDF(allProfiles, spreadsheetTitle);
  }, [allProfiles, spreadsheetTitle]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSheets = savedSheets.slice(indexOfFirstItem, indexOfLastItem);

  if (isConfiguring) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center border border-gray-200">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-isa-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 9.464l-2.828 2.829-1.415-1.415 6.364-6.364 1.414-1.414a6 6 0 018.486 8.486z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Bem-vindo ao Sonda ISA</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Para usar esta ferramenta web, você precisa configurar sua <strong>Google Gemini API Key</strong>. 
            A chave será salva apenas no seu navegador.
          </p>
          <div className="text-left mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sua API Key (Gemini)</label>
            <input 
              type="password" 
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-isa-600 focus:outline-none"
              placeholder="Cole sua chave AIzaSy..."
              onChange={(e) => setApiKey(e.target.value)}
              value={apiKey}
            />
          </div>
          <button 
            onClick={() => handleSaveKey(apiKey)}
            className="w-full bg-isa-600 hover:bg-isa-700 text-white font-bold py-3 rounded transition-colors"
          >
            Salvar e Entrar
          </button>
          <p className="mt-4 text-xs text-gray-400">
            Não tem uma chave? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-isa-600 underline">Gere gratuitamente aqui</a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex flex-col">
      <Header onConfigure={handleResetKey} hasKey={true} />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sonda ISA (v41.2)</h1>
          <button onClick={handleNewSheet} className="bg-white text-isa-700 border border-isa-200 px-4 py-2 rounded shadow-sm hover:bg-isa-50 font-medium transition-colors">
             {allProfiles.length > 0 ? "💾 Salvar & Novo" : "✨ Nova Planilha"}
          </button>
        </div>

        <Bookmarklet />
        <InputArea value={inputText} onChange={setInputText} onExtract={handleExtract} status={status} />
        
        {errorMessage && <div className="bg-red-50 p-4 mb-6 text-red-700 border border-red-200 rounded">{errorMessage}</div>}
        {successMessage && <div className="bg-green-50 p-4 mb-6 text-green-700 border border-green-200 rounded font-bold">{successMessage}</div>}
        
        {allProfiles.length > 0 && (
          <DataGrid 
            data={allProfiles} 
            batches={batches} 
            title={spreadsheetTitle} 
            onTitleChange={setSpreadsheetTitle} 
            onDownloadCSV={handleDownloadCSV} 
            onDownloadExcel={handleDownloadExcel}
            onDownloadPDF={handleDownloadPDF}
          />
        )}

        {savedSheets.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow overflow-hidden border border-gray-200 animate-fade-in-up">
             <div className="bg-isa-50 px-6 py-4 border-b border-isa-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-isa-900 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  Histórico de Planilhas Salvas
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-isa-500">{savedSheets.length} arquivos</span>
                  <button onClick={() => { if(confirm('Limpar todo o histórico?')) setSavedSheets([]) }} className="text-xs text-red-500 hover:text-red-700 underline">Limpar Histórico</button>
                </div>
             </div>
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Data</th>
                     <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Título</th>
                     <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Perfis</th>
                     <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Ações</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {currentSheets.map(sheet => (
                     <tr key={sheet.id} className="hover:bg-isa-50 transition-colors">
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sheet.date).toLocaleString()}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{sheet.title}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-bold">{sheet.profiles.length}</span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                         <button onClick={() => downloadExcel(sheet.profiles, sheet.title)} className="text-green-600 hover:text-green-800 px-2 py-1 border border-green-200 rounded text-xs" title="Baixar Excel Direto">
                            Excel
                         </button>
                         <button onClick={() => loadSheet(sheet)} className="text-isa-600 hover:text-isa-900 px-3 py-1 border border-isa-200 rounded hover:bg-isa-100">Carregar</button>
                         <button onClick={() => deleteSheet(sheet.id)} className="text-red-600 hover:text-red-900 px-3 py-1 border border-red-200 rounded hover:bg-red-50">Excluir</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="text-sm font-bold text-gray-600 disabled:opacity-30 hover:text-gray-900 px-3 py-1 border rounded">Anterior</button>
                <span className="text-sm text-gray-600 font-medium">Página {currentPage} de {Math.max(1, Math.ceil(savedSheets.length / itemsPerPage))}</span>
                <button disabled={indexOfLastItem >= savedSheets.length} onClick={() => setCurrentPage(p => p + 1)} className="text-sm font-bold text-gray-600 disabled:opacity-30 hover:text-gray-900 px-3 py-1 border rounded">Próxima</button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;