import React, { useState, useEffect, useRef } from 'react';

export const Bookmarklet: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  const consoleScript = 
    "(function() { " +
    "  try { " +
    "    /* Limpeza de versões anteriores */ " +
    "    var ids = ['li-extractor-v29-2', 'li-extractor-v29-1', 'li-extractor-v29', 'li-extractor-v28']; " +
    "    for(var i=0; i<ids.length; i++) { var el = document.getElementById(ids[i]); if(el) el.remove(); } " +
    "    " +
    "    /* Configurações v29.2 */ " +
    "    var STORAGE_KEY = 'li_extractor_batch_v29_2'; " +
    "    var TURBO_KEY = 'li_extractor_turbo_v29_2'; " +
    "    var SEPARATOR = '\\n\\n<<<< PAGE_SPLIT_V29_2 >>>>\\n\\n'; " +
    "    " +
    "    /* Funções Auxiliares */ " +
    "    function getStored() { return localStorage.getItem(STORAGE_KEY) || ''; } " +
    "    function setStored(v) { localStorage.setItem(STORAGE_KEY, v); } " +
    "    function clearStored() { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(TURBO_KEY); } " +
    "    function isTurbo() { return localStorage.getItem(TURBO_KEY) === 'true'; } " +
    "    function setTurbo(v) { localStorage.setItem(TURBO_KEY, v); } " +
    "    " +
    "    function countTotalLeads(text) { " +
    "       var matches = text.match(/\\[LINK:/g); " +
    "       return matches ? matches.length : 0; " +
    "    } " +
    "    " +
    "    /* Lógica de Scroll Suave */ " +
    "    function scrollToBottomSlowly(onComplete) { " +
    "       var container = document.querySelector('#search-results-container') || document.querySelector('.search-results-container') || document.body; " +
    "       container.scrollTop = 0; /* Hard Reset */ " +
    "       var currentTop = 0; " +
    "       var maxScroll = container.scrollHeight; " +
    "       var step = 100; " +
    "       if (maxScroll < 500) { setTimeout(onComplete, 1500); return; } " +
    "       var scrollInterval = setInterval(function() { " +
    "           currentTop += step; " +
    "           container.scrollTop = currentTop; " +
    "           window.scrollTo(0, currentTop); " +
    "           if (container.scrollHeight > maxScroll) maxScroll = container.scrollHeight; " +
    "           if (currentTop >= maxScroll) { " +
    "               clearInterval(scrollInterval); " +
    "               container.scrollTop = container.scrollHeight; " +
    "               setTimeout(onComplete, 3000); /* Espera 3s */ " +
    "           } " +
    "       }, 100); " +
    "    } " +
    "    " +
    "    /* Lógica de Navegação */ " +
    "    function clickNextPage() { " +
    "       var nextBtn = document.querySelector('.artdeco-pagination__button--next') || " +
    "                     document.querySelector('button[aria-label=\"Avançar\"]') || " +
    "                     document.querySelector('button[aria-label=\"Next\"]') || " +
    "                     document.querySelector('.search-results-pagination__next-button'); " +
    "       if (nextBtn && !nextBtn.disabled) { nextBtn.click(); return true; } " +
    "       return false; " +
    "    } " +
    "    " +
    "    /* Lógica de Extração */ " +
    "    function getPageContent() { " +
    "        var items = document.querySelectorAll('.reusable-search__result-container, .artdeco-list__item, tr.artdeco-models-table-row, li.artdeco-list__item'); " +
    "        if (items.length === 0) items = [document.body]; " +
    "        var extractedText = ''; " +
    "        var uniquePageLinks = new Set(); " +
    "        var extractedNames = []; " +
    "        for (var i = 0; i < items.length; i++) { " +
    "            var item = items[i].cloneNode(true); " +
    "            var trash = item.querySelectorAll('.artdeco-dropdown, .artdeco-button, script, style, .t-12, .image-container, nav, aside'); " +
    "            for (var t = 0; t < trash.length; t++) trash[t].remove(); " +
    "            var links = item.querySelectorAll('a'); " +
    "            var itemLinkFound = false; " +
    "            for (var k = 0; k < links.length; k++) { " +
    "                var a = links[k]; " +
    "                var href = a.href || ''; " +
    "                if ((href.indexOf('/in/') > -1 || href.indexOf('/sales/lead') > -1 || href.indexOf('/sales/people') > -1) && href.indexOf('linkedin.com') > -1) { " +
    "                    var clean = href.split('?')[0]; " +
    "                    if (clean.indexOf('/company/') === -1 && !itemLinkFound) { " +
    "                        itemLinkFound = true; " +
    "                        if (!uniquePageLinks.has(clean)) { " +
    "                            uniquePageLinks.add(clean); " +
    "                            a.innerText = ' [LINK: ' + clean + '] ' + a.innerText; " +
    "                        } " +
    "                    } " +
    "                } " +
    "            } " +
    "            var text = item.innerText.replace(/\\s+/g, ' ').trim(); " +
    "            if(text.length > 20) { " +
    "                extractedText += text + '\\n-----------------\\n'; " +
    "                if (extractedNames.length < 5) extractedNames.push(text.substring(0, 20)); " +
    "            } " +
    "        } " +
    "        var sig = extractedNames.join('|'); " +
    "        return { text: extractedText, count: uniquePageLinks.size, signature: sig }; " +
    "    } " +
    "    " +
    "    /* Interface Visual */ " +
    "    function showModal(statusMsg) { " +
    "      var modal = document.createElement('div'); " +
    "      modal.id = 'li-extractor-v29-2'; " +
    "      modal.style.cssText = 'position:fixed;top:20px;right:20px;width:380px;background:#fff;border:1px solid #000;z-index:2147483647;box-shadow:0 10px 40px rgba(0,0,0,0.4);border-radius:8px;font-family:sans-serif;color:#333;padding:0;overflow:hidden;animation:slideIn 0.3s;'; " +
    "      " +
    "      var stored = getStored(); " +
    "      var pageCount = stored ? (stored.match(/<<<< PAGE_SPLIT_V29_2 >>>>/g) || []).length + 1 : (stored ? 1 : 0); " +
    "      var totalLeads = countTotalLeads(stored); " +
    "      if (!stored) { pageCount = 0; totalLeads = 0; } " + 
    "      " +
    "      var isAuto = statusMsg !== null; " +
    "      var headerColor = isAuto ? '#7e22ce' : '#0a66c2'; " +
    "      var title = '⚡ Sonda Isa 3.1 (v29.2)'; " +
    "      " +
    "      var header = '<div style=\"background:'+headerColor+';color:white;padding:12px;font-weight:bold;font-size:14px;display:flex;justify-content:space-between;align-items:center\"><span>'+title+'</span><button id=\"btn-close\" style=\"background:none;border:none;color:white;font-size:18px;cursor:pointer\">×</button></div>'; " +
    "      " +
    "      var content = '<div style=\"padding:15px\">'; " +
    "      content += '<div style=\"background:#f1f5f9;padding:10px;border-radius:6px;text-align:center;margin-bottom:15px;border:1px solid #cbd5e1\">'; " +
    "      content += '<div style=\"font-size:11px;color:#475569;text-transform:uppercase;margin-bottom:4px\">Total Capturado</div>'; " +
    "      content += '<div id=\"lbl-stats\" style=\"font-size:26px;font-weight:900;color:#0f172a;line-height:1\">' + totalLeads + '</div>'; " +
    "      content += '<div id=\"lbl-pages\" style=\"font-size:12px;color:#666;margin-top:4px\">em ' + pageCount + ' páginas</div>'; " +
    "      content += '</div>'; " +
    "      " +
    "      if (statusMsg) { " +
    "         content += '<div style=\"text-align:center;padding:15px;color:#6b21a8;font-weight:bold;background:#f3e8ff;border-radius:4px;border:1px solid #d8b4fe\">' + statusMsg + '</div>'; " +
    "         content += '<div style=\"margin-top:10px;font-size:11px;color:#64748b;text-align:center\">⚠️ Modo Lento Ativo: Aguardando carregamento total...</div>'; " +
    "      } else { " +
    "         content += '<button id=\"btn-auto\" style=\"width:100%;padding:12px;background:#7c3aed;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:bold;margin-bottom:8px;font-size:13px;box-shadow:0 2px 5px rgba(0,0,0,0.1)\">🚀 ATIVAR AUTO-PILOTO</button>'; " +
    "         content += '<button id=\"btn-add\" style=\"width:100%;padding:10px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:bold;margin-bottom:15px;font-size:13px;\">⬇️ Capturar Apenas Esta Página</button>'; " +
    "         content += '<button id=\"btn-copy\" style=\"width:100%;padding:12px;background:#0f172a;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:bold;margin-bottom:10px;font-size:14px;\">📋 FINALIZAR E COPIAR TUDO</button>'; " +
    "         content += '<button id=\"btn-clear\" style=\"width:100%;padding:8px;background:none;color:#d11124;border:1px dashed #d11124;border-radius:4px;cursor:pointer;font-size:12px;\">🗑️ Limpar Memória</button>'; " +
    "      } " +
    "      content += '</div>'; " +
    "      " +
    "      modal.innerHTML = header + content; " +
    "      document.body.appendChild(modal); " +
    "      " +
    "      /* Correção v29.2: Binding seguro via modal.querySelector */ " +
    "      if (modal.querySelector('#btn-close')) modal.querySelector('#btn-close').onclick = function() { setTurbo('false'); modal.remove(); }; " +
    "      " +
    "      if (!isAuto) { " +
    "        if(modal.querySelector('#btn-clear')) modal.querySelector('#btn-clear').onclick = function() { if(confirm('Limpar?')) { clearStored(); modal.remove(); showModal(null); } }; " +
    "        if(modal.querySelector('#btn-add')) modal.querySelector('#btn-add').onclick = function() { runExtraction(this, false); }; " +
    "        if(modal.querySelector('#btn-auto')) modal.querySelector('#btn-auto').onclick = function() { setTurbo('true'); runExtraction(this, true); }; " +
    "        if(modal.querySelector('#btn-copy')) modal.querySelector('#btn-copy').onclick = function() { copyToClipboard(modal); }; " +
    "      } " +
    "      return modal; " +
    "    } " +
    "    " +
    "    function copyToClipboard(modal) { " +
    "         var finalData = getStored(); " +
    "         if (!finalData) { alert('Vazio!'); return; } " +
    "         var ta = document.createElement('textarea'); ta.value = finalData; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); " +
    "         setTurbo('false'); " +
    "         alert('✅ Copiado com sucesso!'); " +
    "         modal.remove(); " +
    "    } " +
    "    " +
    "    function runExtraction(btn, isAutoMode) { " +
    "         if(btn) { btn.disabled = true; btn.innerText = '⏳ ROLANDO (LENTO)...'; } " +
    "         if(isAutoMode) { var m = document.getElementById('li-extractor-v29-2'); if(m) m.remove(); showModal('🔄 ROLANDO PAGINA...'); } " +
    "         " +
    "         scrollToBottomSlowly(function() { " +
    "             if(btn) btn.innerText = '⏳ LENDO...'; " +
    "             setTimeout(function() { " +
    "                 var freshData = getPageContent(); " +
    "                 var s = getStored(); " +
    "                 var signature = freshData.signature; " +
    "                 " +
    "                 if (!signature) { setTimeout(function() { runExtraction(btn, isAutoMode); }, 1000); return; } " +
    "                 " +
    "                 if (s && s.indexOf(signature) > -1) { console.log('Pagina duplicada ignorada'); } " +
    "                 else { " +
    "                    if(s) s += SEPARATOR; else s = 'LINKEDIN_EXTRACTOR_BATCH_START_V29_2\\n\\n'; " +
    "                    s += freshData.text; s += '\\n\\n(PAGE_SIGNATURE: ' + signature + ')'; " +
    "                    setStored(s); " +
    "                 } " +
    "                 " +
    "                 if (isAutoMode) { " +
    "                     var m = document.getElementById('li-extractor-v29-2'); if(m) m.remove(); " +
    "                     showModal('✅ DADOS SALVOS! AGUARDANDO...'); " +
    "                     setTimeout(function() { " +
    "                         showModal('➡️ INDO PARA PRÓXIMA PÁGINA...'); " +
    "                         if(clickNextPage()) { " +
    "                             setTimeout(function() { runExtraction(null, true); }, 4000); " +
    "                         } else { " +
    "                             setTurbo('false'); " +
    "                             var finalM = document.getElementById('li-extractor-v29-2'); if(finalM) finalM.remove(); " +
    "                             alert('🏁 FIM DA PESQUISA!\\n\\nTotal Capturado: ' + countTotalLeads(getStored()) + ' leads.'); " +
    "                             showModal(null); /* Reabre menu manual */ " +
    "                         } " +
    "                     }, 2500); " +
    "                 } else { " +
    "                     if(btn) { btn.innerText = '✅ SALVO!'; setTimeout(function(){ btn.disabled=false; btn.innerText='⬇️ Capturar Apenas Esta Página'; }, 1000); } " +
    "                     var m = document.getElementById('li-extractor-v29-2'); if(m) m.remove(); showModal(null); " +
    "                 } " +
    "             }, 500); " +
    "         }); " +
    "    } " +
    "    " +
    "    if (isTurbo()) { runExtraction(null, true); } else { showModal(null); } " +
    "  } catch(e) { alert('Erro Sonda Isa v29.2: ' + e.message); } " +
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
    <div className="bg-white rounded-lg border-2 border-indigo-100 p-6 mb-8 shadow-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-sm border border-indigo-200">PASSO 1</span>
        Captura de Dados (Sonda Isa 3.1)
      </h3>
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>NOVO PILOTO AUTOMÁTICO (v29.2):</strong><br/>
          Clique em <strong>"🚀 ATIVAR AUTO-PILOTO"</strong>.<br/>
          O script rola suavemente, salva e avança. <br/>
          <strong>Correção:</strong> Botões de Copiar e Limpar agora respondem instantaneamente após o término.
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
              <a ref={linkRef} onClick={(e) => e.preventDefault()} className="inline-block px-6 py-3 bg-indigo-700 text-white text-sm font-bold rounded shadow-md hover:bg-indigo-800 cursor-grab active:cursor-grabbing" title="Sonda Isa 3.1">
                Sonda Isa 3.1 (v29.2)
              </a>
           </div>
        </div>
      </div>
    </div>
  );
};