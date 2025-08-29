import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Gemini API key is not defined");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function extractContractData(contractText: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const prompt = `
  You are a contract data extractor.
  Output ONLY valid JSON. No text, no explanations, no code fences.
  Extract structured contract information in JSON.
  Follow this schema exactly:
  Schema:
  {
    "parties": { "customer": "", "vendor": "", "third_parties": [] },
    "account_info": { "billing_address": "", "account_number": "", "contact_email": "" },
    "financial_details": { "line_items": [], "total_value": "", "currency": "" },
    "payment_structure": { "terms": "", "due_dates": [], "methods": [] },
    "revenue_classification": { "type": "", "renewal_terms": "" },
    "sla": { "metrics": [], "penalties": "" }
  }
  Only return valid JSON.
  `;

  const result = await model.generateContent([prompt, contractText]);

  const raw = result.response.text();
  const cleaned = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    console.log("Extracted Contract Data:", parsed);
    return parsed;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw new Error("Invalid JSON from Gemini");
  }
}
