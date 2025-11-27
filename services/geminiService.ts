import { GoogleGenAI, Type } from "@google/genai";
import { LinkedInProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const processSinglePage = async (pageText: string, pageIndex: number): Promise<LinkedInProfile[]> => {
  if (!pageText || pageText.trim().length < 50) return [];

  const CHAR_LIMIT_PER_PAGE = 3000000; 

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Você é um extrator de dados especialista. Analise o texto cru fornecido, que representa UMA PÁGINA de resultados do LinkedIn, e extraia TODOS os perfis.
      
      IMPORTANTE:
      1. Extraia o link do perfil no formato [LINK: ...]
      2. Procure o tempo de permanência no cargo atual. Geralmente aparece como "1 ano 2 meses no cargo" ou "5 meses no cargo". Extraia apenas o tempo (ex: "1 ano 6 meses").
      
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
              tenure: { type: Type.STRING, description: "Tempo no cargo atual (ex: 1 ano, 6 meses, etc)" }
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

export const extractProfilesFromText = async (rawText: string): Promise<LinkedInProfile[]> => {
  if (!rawText || rawText.trim().length === 0) throw new Error("Texto vazio.");

  let pages = rawText.split(/<<<< PAGE_SPLIT_V29_2 >>>>/);
  
  // Fallbacks para versões antigas
  if (pages.length === 1) pages = rawText.split(/<<<< PAGE_SPLIT_V29_1 >>>>/);
  if (pages.length === 1) pages = rawText.split(/<<<< PAGE_SPLIT_V29 >>>>/);
  if (pages.length === 1) pages = rawText.split(/<<<< PAGE_SPLIT_V28 >>>>/);
  if (pages.length === 1) pages = rawText.split(/<<<< PAGE_SPLIT_V27 >>>>/);
  
  console.log(`Detectadas ${pages.length} páginas.`);
  const promises = pages.map((pageContent, index) => processSinglePage(pageContent, index));
  
  try {
    const results = await Promise.all(promises);
    return results.flat(); // Deduplication happens in App.tsx now
  } catch (error) {
    console.error("Erro extração:", error);
    throw error;
  }
};