// =============================================================================
// GEMINI AI CLIENT CONFIGURATION - Module 5: EventPass Pro
// =============================================================================
//
// ## Educational Note: AI Integration in Server Components
//
// Este archivo configura el cliente de Google Generative AI (Gemini).
// La integración con IA generativa en Next.js sigue estos principios:
//
// 1. Las API keys NUNCA deben exponerse al cliente
// 2. Las llamadas a Gemini se hacen desde Server Actions
// 3. El cliente se inicializa una sola vez (singleton pattern)
//
// ## Selección de Modelos
//
// Gemini ofrece varios modelos optimizados para diferentes casos de uso:
//
// - gemini-3-flash-preview: Velocidad optimizada, ideal para generación de texto
//   en tiempo real. Menor costo, respuestas rápidas.
//
// - gemini-3-pro-image-preview: Calidad optimizada para generación de imágenes.
//   Más costoso pero produce mejores resultados visuales.
//
// ## Uso con @google/genai SDK
//
// El SDK @google/genai (v1.34+) usa una API simplificada:
// ```typescript
// const result = await client.models.generateContent({
//   model: 'gemini-2.0-flash',
//   contents: [{ role: 'user', parts: [{ text: prompt }] }]
// });
// ```
// =============================================================================

import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const GEMINI_MODELS = {
  TEXT: 'gemini-3-flash-preview',
  IMAGE: 'gemini-3-pro-image-preview',
} as const;

export const TONE_PROMPTS = {
  formal: 'profesional y formal, usando lenguaje corporativo y estructurado',
  informal: 'cercano e informal, como si hablaras con un amigo, usando lenguaje coloquial',
  emocionante: 'dinámico y emocionante, con energía, usando verbos de acción y generando entusiasmo',
} as const;

export type Tone = keyof typeof TONE_PROMPTS;

export const getGeminiClient = () => genAI;