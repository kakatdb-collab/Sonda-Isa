import React, { useState, useEffect, useRef } from 'react';

export const Bookmarklet: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  const consoleScript = 
    "(function() { " +
    "  try { " +
    "    console.log('⚡ Sonda Isa v41.2 Iniciado'); " +
    "    /* Limpeza de versões anteriores */ " +
    "    var ids = ['li-extractor-v40', 'li-extractor-v41', 'li-extractor-v41_1', 'li-extractor-v41_2']; " +
    "    for(var i=0; i<ids.length; i++) { var el = document.getElementById(ids[i]); if(el) el.remove(); } " +
    "    " +
    "    /* Configurações v41.2 */ " +
    "    var STORAGE_KEY = 'li_extractor_batch_v41_2'; " +
    "    var TURBO_KEY = 'li_extractor_turbo_v41_2'; " +
    "    var LAST_SIG_KEY = 'li_extractor_sig_v41_2'; " +
    "    var SEPARATOR = '\\n\\n<<<< PAGE_SPLIT_V41_2 >>>>\\n\\n'; " +
    "    " +
    "    /* Funções Auxiliares */ " +
    "    function getStored() { return localStorage.getItem(STORAGE_KEY) || ''; } " +
    "    function setStored(v) { localStorage.setItem(STORAGE_KEY, v); } " +
    "    function clearStored() { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(TURBO_KEY); localStorage.removeItem(LAST_SIG_KEY); } " +
    "    function isTurbo() { return localStorage.getItem(TURBO_KEY) === 'true'; } " +
    "    function setTurbo(v) { localStorage.setItem(TURBO_KEY, v); } " +
    "    function getLastSig() { return localStorage.getItem(LAST_SIG_KEY) || ''; } " +
    "    function setLastSig(v) { localStorage.setItem(LAST_SIG_KEY, v); } " +
    "    " +
    "    function countTotalLeads(text) { " +
    "       if (!text) return 0; " +
    "       var matches = text.match(/-----------------/g); " +
    "       return matches ? matches.length : 0; " +
    "    } " +
    "    " +
    "    /* Lógica de Scroll Suave */ " +
    "    function scrollToBottomSlowly(onComplete) { " +
    "       var container = document.querySelector('#search-results-container') || document.querySelector('.search-results-container') || document.body; " +
    "       container.scrollTop = 0; " +
    "       var currentTop = 0; " +
    "       var maxScroll = container.scrollHeight; " +
    "       var step = 150; " +
    "       var scrollInterval = setInterval(function() { " +
    "           currentTop += step; " +
    "           container.scrollTop = currentTop; " +
    "           window.scrollTo(0, currentTop); " +
    "           if (container.scrollHeight > maxScroll) maxScroll = container.scrollHeight; " +
    "           if (currentTop >= maxScroll) { " +
    "               clearInterval(scrollInterval); " +
    "               container.scrollTop = container.scrollHeight; " +
    "               setTimeout(onComplete, 3000); " + // Espera 3s após scroll " +
    "           } " +
    "       }, 100); " +
    "    } " +
    "    " +
    "    /* Navegação */ " +
    "    function clickNextPage() { " +
    "       var nextBtn = document.querySelector('.artdeco-pagination__button--next') || " +
    "                     document.querySelector('button[aria-label=\"Avançar\"]') || " +
    "                     document.querySelector('button[aria-label=\"Next\"]') || " +
    "                     document.querySelector('.search-results-pagination__next-button'); " +
    "       if (nextBtn && !nextBtn.disabled) { nextBtn.click(); return true; } " +
    "       return false; " +
    "    } " +
    "    " +
    "    /* Extração e Assinatura */ " +
    "    function getPageContent() { " +
    "        var items = document.querySelectorAll('.reusable-search__result-container, .artdeco-list__item, tr.artdeco-models-table-row, li.artdeco-list__item'); " +
    "        if (items.length === 0) items = [document.body]; " +
    "        var extractedText = ''; " +
    "        var extractedNames = []; " +
    "        for (var i = 0; i < items.length; i++) { " +
    "            var item = items[i].cloneNode(true); " +
    "            var profileLink = ''; " +
    "            var links = item.querySelectorAll('a'); " +
    "            for (var k = 0; k < links.length; k++) { " +
    "                var href = links[k].getAttribute('href') || ''; " +
    "                if (href.indexOf('/in/') > -1 || href.indexOf('/sales/lead') > -1 || href.indexOf('/sales/people') > -1) { " +
    "                    if (href.indexOf('/company/') === -1 && href.indexOf('/school/') === -1 && href.indexOf('miniProfile') === -1) { " +
    "                        if (href.indexOf('http') === -1) href = 'https://www.linkedin.com' + href; " +
    "                        profileLink = href; " +
    "                        break; " +
    "                    } " +
    "                } " +
    "            } " +
    "            var rawText = item.innerText; " +
    "            var lines = rawText.split('\\n'); " +
    "            var geoKeywords = ['Brasil', 'Brazil', 'São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Paraná', 'Bahia', 'Distrito Federal', 'Ceará', 'Pernambuco', 'Santa Catarina', 'Goiás', 'Região', 'Area', 'Greater']; " +
    "            var eduKeywords = ['Formação', 'Education', 'Estudou', 'Frequentou', 'Degree', 'Universidade', 'Faculdade', 'University', 'College', 'FIAP', 'USP', 'FGV', 'PUC', 'Mackenzie']; " +
    "            " +
    "            for(var l=0; l<lines.length; l++) { " +
    "               var line = lines[l].trim(); " +
    "               if(line.length < 3) continue; " +
    "               var isLoc = false; " +
    "               if (line.includes(',')) { for(var g=0; g<geoKeywords.length; g++) { if(line.includes(geoKeywords[g])) isLoc = true; } } " +
    "               if (line.includes('Santander') || line.includes('Banco') || line.includes('Ltda') || line.includes('S.A')) isLoc = false; " +
    "               if(isLoc) { item.innerText += ' [LOC: ' + line + '] '; } " +
    "               for(var e=0; e<eduKeywords.length; e++) { if(line.includes(eduKeywords[e])) { item.innerText += ' [EDU: ' + line + '] '; } } " +
    "            } " +
    "            /* Limpeza */ " +
    "            var trash = item.querySelectorAll('.artdeco-dropdown, .artdeco-button, script, style, .t-12, .image-container, nav, aside'); " +
    "            for (var t = 0; t < trash.length; t++) trash[t].remove(); " +
    "            var text = item.innerText.replace(/\\s+/g, ' ').trim(); " +
    "            if(text.length > 20) { " +
    "                if (profileLink) text = '[LINK: ' + profileLink + '] ' + text; " +
    "                extractedText += text + '\\n-----------------\\n'; " +
    "                if (extractedNames.length < 5) extractedNames.push(text.substring(0, 30)); " +
    "            } " +
    "        } " +
    "        var sig = extractedNames.join('|'); " +
    "        return { text: extractedText, signature: sig }; " +
    "    } " +
    "    " +
    "    function showModal(statusMsg) { " +
    "      var modal = document.createElement('div'); " +
    "      modal.id = 'li-extractor-v41_2'; " +
    "      modal.style.cssText = 'position:fixed;top:20px;right:20px;width:380px;background:#fff;border:1px solid #000;z-index:2147483647;box-shadow:0 10px 40px rgba(0,0,0,0.4);border-radius:8px;font-family:sans-serif;color:#333;padding:0;overflow:hidden;animation:slideIn 0.3s;'; " +
    "      var stored = getStored(); " +
    "      var pageCount = stored ? (stored.match(/<<<< PAGE_SPLIT_V41_2 >>>>/g) || []).length + 1 : (stored ? 1 : 0); " +
    "      var totalLeads = countTotalLeads(stored); " +
    "      if (!stored) { pageCount = 0; totalLeads = 0; } " +
    "      var isAuto = statusMsg !== null; " +
    "      var headerColor = isAuto ? '#7e22ce' : '#6d28d9'; " +
    "      var content = '<div style=\"padding:15px\">'; " +
    "      content += '<div style=\"background:#f1f5f9;padding:10px;border-radius:6px;text-align:center;margin-bottom:15px;border:1px solid #cbd5e1\">'; " +
    "      content += '<div style=\"font-size:11px;color:#475569;text-transform:uppercase;margin-bottom:4px\">Total Capturado</div>'; " +
    "      content += '<div style=\"font-size:26px;font-weight:900;color:#0f172a;line-height:1\">' + totalLeads + '</div>'; " +
    "      content += '<div style=\"font-size:12px;color:#666;margin-top:4px\">em ' + pageCount + ' páginas</div>'; " +
    "      content += '</div>'; " +
    "      if (statusMsg) { " +
    "         content += '<div style=\"text-align:center;padding:15px;color:#6b21a8;font-weight:bold;background:#f3e8ff;border-radius:4px;border:1px solid #d8b4fe\">' + statusMsg + '</div>'; " +
    "      } else { " +
    "         content += '<button id=\"btn-auto\" style=\"width:100%;padding:12px;background:#7c3aed;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:bold;margin-bottom:8px;\">🚀 ATIVAR AUTO-PILOTO</button>'; " +
    "         content += '<button id=\"btn-add\" style=\"width:100%;padding:10px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:bold;margin-bottom:15px;\">⬇️ Capturar Apenas Esta Página</button>'; " +
    "         content += '<button id=\"btn-copy\" style=\"width:100%;padding:12px;background:#0f172a;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:bold;margin-bottom:10px;\">📋 FINALIZAR E COPIAR TUDO</button>'; " +
    "         content += '<button id=\"btn-clear\" style=\"width:100%;padding:8px;background:none;color:#d11124;border:1px dashed #d11124;border-radius:4px;cursor:pointer;\">🗑️ Limpar Memória</button>'; " +
    "      } " +
    "      content += '</div>'; " +
    "      modal.innerHTML = '<div style=\"background:'+headerColor+';color:white;padding:12px;font-weight:bold;display:flex;justify-content:space-between\"><span>⚡ Sonda Isa (v41.2)</span><button id=\"btn-close\" style=\"background:none;border:none;color:white;cursor:pointer\">×</button></div>' + content; " +
    "      document.body.appendChild(modal); " +
    "      if(modal.querySelector('#btn-close')) modal.querySelector('#btn-close').onclick = function() { setTurbo('false'); modal.remove(); }; " +
    "      if (!isAuto) { " +
    "        if(modal.querySelector('#btn-clear')) modal.querySelector('#btn-clear').onclick = function() { if(confirm('Limpar?')) { clearStored(); modal.remove(); showModal(null); } }; " +
    "        if(modal.querySelector('#btn-add')) modal.querySelector('#btn-add').onclick = function() { runExtraction(this, false); }; " +
    "        if(modal.querySelector('#btn-auto')) modal.querySelector('#btn-auto').onclick = function() { setTurbo('true'); runExtraction(this, true); }; " +
    "        if(modal.querySelector('#btn-copy')) modal.querySelector('#btn-copy').onclick = function() { copyToClipboard(modal); }; " +
    "      } " +
    "    } " +
    "    " +
    "    function copyToClipboard(modal) { " +
    "         var ta = document.createElement('textarea'); ta.value = getStored(); document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); " +
    "         setTurbo('false'); alert('✅ Copiado!'); modal.remove(); " +
    "    } " +
    "    " +
    "    function runExtraction(btn, isAutoMode) { " +
    "         if(isAutoMode) { var m = document.getElementById('li-extractor-v41_2'); if(m) m.remove(); showModal('🔍 VERIFICANDO PÁGINA...'); } " +
    "         /* Espera Inteligente: Verifica se a assinatura mudou antes de prosseguir */ " +
    "         var attempts = 0; " +
    "         var checkInterval = setInterval(function() { " +
    "             var currentData = getPageContent(); " +
    "             var lastSig = getLastSig(); " +
    "             /* Se não for auto ou se assinatura mudou ou se tentou por 20s (timeout) */ " +
    "             if (!isAutoMode || attempts > 20 || currentData.signature !== lastSig) { " +
    "                 clearInterval(checkInterval); " +
    "                 if(isAutoMode) { var m = document.getElementById('li-extractor-v41_2'); if(m) m.remove(); showModal('🔄 ROLANDO PAGINA...'); } " +
    "                 scrollToBottomSlowly(function() { " +
    "                     var freshData = getPageContent(); " +
    "                     var s = getStored(); " +
    "                     if (s) s += SEPARATOR; else s = 'LINKEDIN_EXTRACTOR_BATCH_START_V41_2\\n\\n'; " +
    "                     s += freshData.text; s += '\\n\\n(PAGE_SIGNATURE: ' + freshData.signature + ')'; " +
    "                     setStored(s); " +
    "                     setLastSig(freshData.signature); " +
    "                     if (isAutoMode) { " +
    "                         var m = document.getElementById('li-extractor-v41_2'); if(m) m.remove(); " +
    "                         showModal('➡️ INDO PARA PRÓXIMA PÁGINA...'); " +
    "                         if(clickNextPage()) { setTimeout(function() { runExtraction(null, true); }, 3000); } " +
    "                         else { setTurbo('false'); alert('🏁 FIM!'); var m = document.getElementById('li-extractor-v41_2'); if(m) m.remove(); showModal(null); } " +
    "                     } else { " +
    "                         var m = document.getElementById('li-extractor-v41_2'); if(m) m.remove(); showModal(null); " +
    "                     } " +
    "                 }); " +
    "             } else { " +
    "                 attempts++; " +
    "                 console.log('Aguardando mudança de conteúdo... ' + attempts); " +
    "             } " +
    "         }, 1000); " +
    "    } " +
    "    if (isTurbo()) { runExtraction(null, true); } else { showModal(null); } " +
    "  } catch(e) { alert('Erro v41.2: ' + e.message); } " +
    "})();";

  const bookmarkletHref = `javascript:${encodeURIComponent(consoleScript)}`;

  useEffect(() => {
    if (linkRef.current) {
        linkRef.current.href = bookmarkletHref;
    }
  }, [bookmarkletHref]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(consoleScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-white rounded-lg border-2 border-isa-100 p-6 mb-8 shadow-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="bg-isa-100 text-isa-700 px-2 py-1 rounded text-sm border border-isa-200">PASSO 1</span>
        Captura de Dados (Sonda Isa v41.2)
      </h3>
      <div className="bg-purple-50 border-l-4 border-isa-600 p-4 mb-6">
        <p className="text-sm text-purple-900">
          <strong>SMART AUTO-PILOTO (v41.2):</strong><br/>
          Clique em <strong>"🚀 ATIVAR AUTO-PILOTO"</strong>. <br/>
          O script agora <strong>espera a página mudar</strong> de verdade antes de extrair (timeout 20s), garantindo que não pule páginas e salve todos os contatos.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-300">
          <h4 className="font-bold text-gray-900 mb-2">Opção A: Código via Console</h4>
          <button onClick={handleCopyCode} className={`w-full py-3 px-4 rounded font-bold transition-all ${copied ? 'bg-green-600 text-white' : 'bg-gray-800 text-white hover:bg-black'}`}>
            {copied ? 'Copiado!' : 'Copiar Código'}
          </button>
        </div>
        <div>
           <h4 className="font-bold text-gray-900 mb-2">Opção B: Botão de Favoritos</h4>
           <div className="p-6 bg-gray-100 rounded text-center border border-dashed border-gray-400 mt-4">
              <a ref={linkRef} onClick={(e) => e.preventDefault()} className="inline-block px-6 py-3 bg-isa-600 text-white text-sm font-bold rounded shadow-md hover:bg-isa-700 cursor-grab active:cursor-grabbing" title="Sonda Isa v41.2">
                Sonda Isa (v41.2)
              </a>
           </div>
        </div>
      </div>
    </div>
  );
};