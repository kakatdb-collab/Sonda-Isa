import { GoogleGenAI, Type } from "@google/genai";
import { LinkedInProfile } from "../types";

// NOTE: process.env removed completely to avoid Vercel build crashes

const processSinglePage = async (pageText: string, pageIndex: number, apiKey: string): Promise<LinkedInProfile[]> => {
  if (!pageText || pageText.trim().length < 50) return [];

  const CHAR_LIMIT_PER_PAGE = 3000000; 

  try {
    // Initialize AI instance dynamically with the user's key
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Você é um extrator de dados especialista. Analise o texto cru fornecido, que representa UMA PÁGINA de resultados do LinkedIn, e extraia TODOS os perfis.
      
      IMPORTANTE:
      1. Extraia o link do perfil no formato [LINK: ...] (Se estiver no início do bloco).
      2. Procure o tempo de permanência no cargo atual (ex: "1 ano 6 meses").
      3. Extraia a Instituição de Ensino ou Formação. Priorize o texto marcado com [EDU: ...] ou [EDU_IMG: ...]. Caso contrário, procure por frases como "frequentou FIAP", "estudou em USP".
      4. Extraia o Estado ou Região. Priorize o texto marcado com [LOC: ...]. Se não houver, infira o Estado baseado na cidade (Ex: "Curitiba" -> "Paraná", "Belo Horizonte" -> "Minas Gerais").
      
      Texto da Página ${pageIndex + 1}:
      ${pageText.slice(0, CHAR_LIMIT_PER_PAGE)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              role: { type: Type.STRING },
              company: { type: Type.STRING },
              location: { type: Type.STRING },
              profileUrl: { type: Type.STRING },
              tenure: { type: Type.STRING, description: "Tempo no cargo atual" },
              education: { type: Type.STRING, description: "Instituição de ensino ou curso principal" },
              state: { type: Type.STRING, description: "Estado ou Região geográfica extraída da localização" }
            },
            required: ["name", "role"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    return JSON.parse(jsonText) as LinkedInProfile[];
  } catch (error) {
    console.warn(`Erro ao processar página ${pageIndex + 1}:`, error);
    return []; 
  }
};

export const extractProfilesFromText = async (rawText: string, apiKey: string): Promise<LinkedInProfile[]> => {
  if (!apiKey) throw new Error("Chave de API não configurada.");
  if (!rawText || rawText.trim().length === 0) throw new Error("Texto vazio.");

  // Update split logic for v41.2
  let pages = rawText.split(/<<<< PAGE_SPLIT_V41_2 >>>>/);
  
  // Fallbacks for older versions
  if (pages.length === 1) pages = rawText.split(/<<<< PAGE_SPLIT_V41_1 >>>>/);
  if (pages.length === 1) pages = rawText.split(/<<<< PAGE_SPLIT_V41 >>>>/);
  if (pages.length === 1) pages = rawText.split(/<<<< PAGE_SPLIT_V40 >>>>/);
  
  console.log(`Detectadas ${pages.length} páginas.`);
  // Pass apiKey down to the single page processor
  const promises = pages.map((pageContent, index) => processSinglePage(pageContent, index, apiKey));
  
  try {
    const results = await Promise.all(promises);
    return results.flat(); 
  } catch (error) {
    console.error("Erro extração:", error);
    throw error;
  }
};