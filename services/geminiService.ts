import { GoogleGenAI } from "@google/genai";
import { FunnelStage } from "../types";

// This is a placeholder for the API key.
// In a real application, this should be handled securely.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function formatFunnelDataForPrompt(funnelData: FunnelStage[]): string {
  let promptData = "Вот данные по воронке продаж:\n\n";
  funnelData.forEach(stage => {
    if (stage.status !== 'Регионов в работе') {
      promptData += `- **${stage.status}:** ${stage.quantity} регионов\n`;
    }
  });
  return promptData;
}

export async function analyzeFunnelData(funnelData: FunnelStage[]): Promise<string> {
  const model = 'gemini-2.5-pro';
  const formattedData = formatFunnelDataForPrompt(funnelData);
  
  const prompt = `
    Ты — старший аналитик по продажам. Проанализируй следующие данные по воронке продаж для компании, работающей с регионами России.
    
    ${formattedData}
    
    Твоя задача — предоставить краткий, но содержательный анализ на русском языке в формате Markdown. Включи в анализ:
    1.  **Ключевые выводы:** Какие основные тенденции видны? Где концентрация сделок?
    2.  **Потенциальные риски или узкие места:** Есть ли этапы, на которых "застревает" слишком много регионов? На что стоит обратить внимание?
    3.  **Стратегические рекомендации:** Какие 2-3 конкретных шага можно предпринять для улучшения конверсии и ускорения сделок?
    
    Ответ должен быть структурированным, ясным и профессиональным.
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Не удалось связаться с сервисом аналитики Gemini.");
  }
}
