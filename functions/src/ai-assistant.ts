import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { GoogleGenAI } from '@google/genai';

// Requires setting GEMINI_API_KEY config in Firebase
// firebase functions:config:set gemini.key="YOUR_API_KEY"
// or process.env.GEMINI_API_KEY

interface TmertEvaluationData {
  companyInfo: any;
  workstationInfo: any;
  initialAssessment: any; // e.g. the yes/no answers from stage 3
}

export const analyzeTmertEvaluation = onCall(
  { secrets: ['GEMINI_API_KEY'] }, // Request the secret from Secret Manager
  async (request: CallableRequest<TmertEvaluationData>) => {
    const data = request.data;
    const context = request.auth;

    if (!context) {
      throw new HttpsError('unauthenticated', 'Debes estar autenticado para usar el asistente IA');
    }

    if (!data.workstationInfo || !data.initialAssessment) {
      throw new HttpsError('invalid-argument', 'Faltan datos de la evaluación para analizar');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY no configurada en Cloud Secrets o Environment Variables');
      throw new HttpsError('internal', 'El servicio de IA no está configurado correctamente.');
    }

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });

      const prompt = `
Eres un experto prevencionista de riesgos laboral especializado en la norma TMERT (Trastornos Musculoesqueléticos Relacionados al Trabajo) del Ministerio de Salud de Chile.

Te entregaré los antecedentes de una evaluación inicial (Etapa 1, 2 y 3).
Tu trabajo es generar la salida para la Etapa 4 (Identificación Avanzada) determinando si el nivel de riesgo es Aceptable, No Aceptable o Crítico justificando por qué; y la Etapa 5 (Plan de Acción sugerido), sugiriendo medidas técnicas y administrativas a tomar.

Datos de Evaluación:
${JSON.stringify(data, null, 2)}

RESPONDE EXCLUSIVAMENTE CON UN JSON VÁLIDO CON LA SIGUIENTE ESTRUCTURA:
{
  "stage4": {
    "result": "ACCEPTABLE" | "NOT_ACCEPTABLE" | "CRITICAL",
    "justification": "Explica brevemente por qué",
    "alerts": ["Si encuentras inconsistencias en los datos del usuario, enlístalas aquí", ""]
  },
  "stage5": [
    {
      "measure": "Descripción de la medida a tomar",
      "type": "TECHNICAL" | "ADMINISTRATIVE",
      "priority": "HIGH" | "MEDIUM" | "LOW"
    }
  ]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const textResult = response.text || '{}';
      const jsonResult = JSON.parse(textResult);

      return {
        success: true,
        analysis: jsonResult,
      };
    } catch (error: any) {
      console.error('Error in analyzeTmertEvaluation:', error);
      throw new HttpsError(
        'internal',
        'Hubo un error al procesar la evaluación con IA.',
        error.message
      );
    }
  }
);
