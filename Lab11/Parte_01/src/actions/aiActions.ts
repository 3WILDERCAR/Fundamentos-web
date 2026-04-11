// =============================================================================
// AI ACTIONS - Module 5: EventPass Pro
// =============================================================================
//
// ## Educational Note: Server Actions para IA Generativa
//
// Este archivo contiene Server Actions que integran Gemini AI para generar
// contenido de eventos. Usamos Server Actions en lugar de API Routes porque:
//
// 1. **Seguridad**: Las API keys NUNCA llegan al cliente
// 2. **Simplicidad**: No necesitamos crear endpoints REST
// 3. **Type Safety**: TypeScript end-to-end sin serializacion manual
// 4. **Caching**: Next.js puede cachear resultados automaticamente
//
// ### Flujo de Generación con Gemini
//
// ```
// ┌─────────────────────────────────────────────────────────────────────────┐
// │                    FLUJO: CLIENTE → SERVER ACTION → GEMINI              │
// ├─────────────────────────────────────────────────────────────────────────┤
// │                                                                          │
// │   1. Usuario escribe título ────────────────────────────────────────┐    │
// │      "Conferencia de React 2025"                                    │    │
// │                                                                     │    │
// │   2. Click "Generar con IA" ────────────────────────────────────────┤    │
// │                                                                     │    │
// │   3. EventForm llama generateEventDetailsAction(title) ─────────────┤    │
// │      (Server Action, ejecuta en el servidor)                        │    │
// │                                                                     │    │
// │   4. Server Action construye prompt ────────────────────────────────┤    │
// │      + Envía a Gemini API                                           │    │
// │                                                                     │    │
// │   5. Gemini retorna JSON ───────────────────────────────────────────┤    │
// │      { description, category, tags }                                │    │
// │                                                                     │    │
// │   6. Server Action parsea y valida ─────────────────────────────────┤    │
// │                                                                     │    │
// │   7. Retorna datos al cliente ──────────────────────────────────────┘    │
// │      EventForm actualiza campos automáticamente                          │
// │                                                                          │
// └─────────────────────────────────────────────────────────────────────────┘
// ```
//
// ### Prompt Engineering
//
// El prompt está diseñado para:
// 1. Dar contexto claro al modelo (eres un experto en eventos)
// 2. Especificar el formato exacto de salida (JSON)
// 3. Incluir restricciones (categorías válidas, límite de caracteres)
// 4. Pedir respuesta sin formato markdown (solo JSON)
//
// =============================================================================

'use server';

import { getGeminiClient, GEMINI_MODELS, TONE_PROMPTS, type Tone } from '@/lib/gemini';
import { EVENT_CATEGORIES } from '@/types/event';

export interface GeneratedEventDetails {
  descriptions: string[];
  category: string;
  tags: string[];
}

export interface GeneratedEventDetailsLegacy {
  description: string;
  category: string;
  tags: string[];
}

export async function generateEventDetailsAction(
  title: string,
  tone: Tone = 'formal'
): Promise<{ success: boolean; data?: GeneratedEventDetails; error?: string }> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY no está configurada');
    }

    if (!title || title.length < 3) {
      return { success: false, error: 'Por favor proporciona un título válido' };
    }

    const client = getGeminiClient();
    const toneDescription = TONE_PROMPTS[tone];

    const prompt = `
Eres un experto organizador de eventos con más de 10 años de experiencia creando descripciones 
persuasivas y atractivas para todo tipo de eventos en Latinoamérica.

El título del evento es: "${title}"
El tono debe ser: ${toneDescription}

Tu tarea es generar 3 descripciones DIFERENTES y ÚNICAS para este evento. Cada descripción debe:
- Tener una descripción clara y atractiva del evento que no pasen de los 1000 carácteres 
- Estar escrita completamente en español
- Usar el tono indicado de forma consistente
- Destacar los beneficios para el asistente
- Incluir un llamado a la acción al final
- Ser completamente diferente a las otras dos en estructura y enfoque

También determina:
- La categoría más apropiada de esta lista: ${EVENT_CATEGORIES.join(', ')}
- 5 etiquetas relevantes en minúsculas

Responde ÚNICAMENTE con este JSON válido, sin markdown, sin explicaciones:
{
  "descriptions": [
    "primera descripción completa aquí",
    "segunda descripción completamente diferente aquí", 
    "tercera descripción con enfoque distinto aquí"
  ],
  "category": "categoría aquí",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}
    `;

    const result = await client.models.generateContent({
      model: GEMINI_MODELS.TEXT,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });

    const text = result.text;
    if (!text) throw new Error('No se generó contenido');

    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const data = JSON.parse(cleanedText) as GeneratedEventDetails;

    if (!EVENT_CATEGORIES.includes(data.category as any)) {
      data.category = 'otro';
    }

    data.tags = (data.tags || []).slice(0, 5);
    data.descriptions = (data.descriptions || []).slice(0, 3);

    return { success: true, data };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return { success: false, error: 'Error al generar contenido. Intenta de nuevo.' };
  }
}

export async function generateEventPosterAction(
  prompt: string,
  eventId?: string
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY no está configurada');
    }

    const client = getGeminiClient();

    const result = await client.models.generateContent({
      model: GEMINI_MODELS.IMAGE,
      contents: [
        {
          role: 'user',
          parts: [{ text: `Create a professional, modern, and clean business event poster for: ${prompt}. Style: High-quality photorealistic imagery, elegant typography. Avoid futuristic, sci-fi, or neon aesthetics. 16:9 aspect ratio. Minimal text.` }],
        },
      ],
    });

    const candidates = result.candidates;
    const part = candidates?.[0]?.content?.parts?.[0];

    if (!part?.inlineData?.data) {
      throw new Error('No se generó imagen');
    }

    const buffer = Buffer.from(part.inlineData.data, 'base64');
    const targetId = eventId || crypto.randomUUID();

    const { uploadPosterToStorage } = await import('@/lib/firebase/storage');
    const imageUrl = await uploadPosterToStorage(targetId, buffer, 'image/png');

    if (!imageUrl) throw new Error('Error al subir imagen');

    return { success: true, imageUrl };
  } catch (error) {
    console.error('Gemini Image Error:', error);
    return { success: false, error: 'Error al generar poster.' };
  }
}