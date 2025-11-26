import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AggregatedBA, AnalysisResult } from '../types';

export const analyzeDataWithGemini = async (data: AggregatedBA[]): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey });

  // Limit data size for prompt context if necessary (top 100 by volume to avoid token limits on huge datasets)
  // For this demo, we assume the dataset is reasonably summarized.
  const dataContext = JSON.stringify(data);

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      clusters: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING, description: "ชื่อกลุ่มภาษาไทยที่สื่อความหมาย (เช่น 'กลุ่มยอดซื้อสูง')" },
            description: { type: Type.STRING, description: "คำอธิบายละเอียดเกี่ยวกับพฤติกรรมของกลุ่มนี้" },
            customerPersona: { type: Type.STRING, description: "อธิบายรายละเอียดประเภทลูกค้า: พวกเขาคือใคร? (Who are they?), มีลักษณะธุรกิจอย่างไร? เจาะลึกโปรไฟล์" },
            characteristics: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "ลักษณะเด่น 3-4 ข้อ"
            },
            memberBAs: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "รายชื่อ BA ที่อยู่ในกลุ่มนี้"
            }
          },
          required: ["id", "name", "description", "customerPersona", "characteristics", "memberBAs"]
        }
      },
      executiveSummary: {
        type: Type.OBJECT,
        properties: {
          overview: { type: Type.STRING, description: "บทสรุปสำหรับผู้บริหาร เน้น Insight ที่สำคัญ" },
          strategicRecommendations: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "คำแนะนำเชิงกลยุทธ์ที่นำไปปฏิบัติได้จริง (Actionable Items)"
          },
          policyImplications: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "นัยยะเชิงนโยบายระยะยาว (Long-term Policy)"
          }
        },
        required: ["overview", "strategicRecommendations", "policyImplications"]
      }
    },
    required: ["clusters", "executiveSummary"]
  };

  const prompt = `
    You are a Senior Data Analyst and Business Strategist for a large enterprise.
    
    I have aggregated transaction data for different Business Areas (BA).
    Data fields:
    - ba: Business Area Name
    - totalAmount: Total transaction value
    - transactionCount: Number of transactions
    - avgAmount: Average value per transaction
    - stdDevAmount: Variance in transaction value

    Task:
    1. Perform a logical clustering analysis on this data to group BAs into 3 distinct segments based on their value and volume patterns.
    2. Assign each BA to one cluster.
    3. Provide a detailed analysis in Thai Language (ภาษาไทย).
    4. **Crucial**: For "customerPersona", explicitly identify WHO these BAs likely represent based on the data pattern (e.g., "Major Dealers", "Small Retailers", "Ad-hoc Contractors") and describe their nature in detail.
    5. Provide high-level executive insights suitable for policy making.

    Input Data:
    ${dataContext}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.3, // Low temperature for more analytical/consistent results
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};