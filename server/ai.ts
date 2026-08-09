import { GoogleGenAI, Type } from '@google/genai';

export interface ClassifyInput {
  description: string;
  imageBase64?: string;
  type?: string;
  peopleAffected?: number;
  address?: string;
}

export interface ClassifyResult {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  confidence: number;
  summary: string;
  immediateActions: string[];
  resourcesNeeded: string[];
  estimatedResponseTime: number; // minutes
}

export class AIService {
  private aiClient: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        this.aiClient = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      } catch (err) {
        console.warn('AIService initialization warning:', err);
      }
    }
  }

  private getClient(): GoogleGenAI | null {
    if (!this.aiClient && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
      try {
        this.aiClient = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      } catch (e) {
        // ignore
      }
    }
    return this.aiClient;
  }

  public async classifyEmergency(input: ClassifyInput): Promise<ClassifyResult> {
    const ai = this.getClient();

    if (ai) {
      try {
        const prompt = `Analyze this emergency incident report carefully:
Description: "${input.description || 'Emergency incident reported'}"
User-selected Type: "${input.type || 'unknown'}"
People Affected: ${input.peopleAffected || 1}
Address/Location: "${input.address || 'Unknown'}"

Evaluate the crisis level and provide structured classification JSON:
1. severity: MUST be one of ["low", "medium", "high", "critical"].
2. type: standardized category e.g. "road_accident", "fire", "medical_emergency", "flood", "building_collapse", "electrical", "violence", "missing_person", "gas_leak", "other".
3. confidence: score between 0.75 and 0.99.
4. summary: 2 concise sentences summarizing the situation and core risks.
5. immediateActions: 3 to 5 clear, urgent instructions for victims/bystanders on scene.
6. resourcesNeeded: array of required emergency units e.g. ["ambulance", "fire_truck", "police", "trauma_team"].
7. estimatedResponseTime: estimated dispatch resolution time in minutes (max 6 minutes).`;

        const parts: any[] = [{ text: prompt }];

        if (input.imageBase64) {
          const cleanBase64 = input.imageBase64.replace(/^data:image\/\w+;base64,/, '');
          parts.unshift({
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          });
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: { parts },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                severity: { type: Type.STRING, description: 'low, medium, high, or critical' },
                type: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                summary: { type: Type.STRING },
                immediateActions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                resourcesNeeded: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                estimatedResponseTime: { type: Type.NUMBER },
              },
              required: ['severity', 'type', 'confidence', 'summary', 'immediateActions', 'resourcesNeeded'],
            },
          },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            severity: ['low', 'medium', 'high', 'critical'].includes(parsed.severity)
              ? parsed.severity
              : 'high',
            type: parsed.type || input.type || 'medical_emergency',
            confidence: Math.min(0.99, Math.max(0.6, Number(parsed.confidence) || 0.92)),
            summary: parsed.summary || 'Emergency situation requiring immediate attention and dispatched units.',
            immediateActions: Array.isArray(parsed.immediateActions) && parsed.immediateActions.length > 0
              ? parsed.immediateActions
              : [
                  'Stay calm and ensure personal safety.',
                  'Keep the line clear and remain near a safe landmark.',
                  'Provide clear path for incoming emergency responders.',
                ],
            resourcesNeeded: Array.isArray(parsed.resourcesNeeded) && parsed.resourcesNeeded.length > 0
              ? parsed.resourcesNeeded
              : ['ambulance', 'police'],
            estimatedResponseTime: Math.min(6, Math.max(1, Number(parsed.estimatedResponseTime) || 6)),
          };
        }
      } catch (err) {
        console.warn('Gemini classification fallback triggered:', err);
      }
    }

    // Heuristic Fallback Engine if AI key is missing or network fails
    return this.fallbackClassify(input);
  }

  public async generateFirstAid(emergencyType: string, severity: string): Promise<string[]> {
    const ai = this.getClient();

    if (ai) {
      try {
        const prompt = `Provide 4-6 concise step-by-step first aid and survival instructions for a "${emergencyType}" emergency with "${severity}" severity. Return a JSON array of strings.`;
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        });

        if (response.text) {
          const steps = JSON.parse(response.text);
          if (Array.isArray(steps) && steps.length > 0) {
            return steps;
          }
        }
      } catch (err) {
        console.warn('First aid generation fallback:', err);
      }
    }

    return this.getFallbackFirstAid(emergencyType);
  }

  private fallbackClassify(input: ClassifyInput): ClassifyResult {
    const desc = (input.description || '').toLowerCase();
    const type = input.type || 'medical_emergency';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'high';

    if (desc.includes('unconscious') || desc.includes('bleeding heavily') || desc.includes('explosion') || desc.includes('trapped') || desc.includes('critical') || desc.includes('cardiac')) {
      severity = 'critical';
    } else if (desc.includes('fire') || desc.includes('smoke') || desc.includes('crash') || desc.includes('head injury')) {
      severity = 'high';
    } else if (desc.includes('minor') || desc.includes('cut') || desc.includes('sprain')) {
      severity = 'low';
    } else {
      severity = 'medium';
    }

    return {
      severity,
      type,
      confidence: 0.91,
      summary: `Automated analysis for ${type.replace('_', ' ')}: ${input.description.slice(0, 120)}...`,
      immediateActions: [
        'Move to a safe position away from traffic or hazardous structures.',
        'Keep the victim calm, warm, and motionless.',
        'Do not give food or drink to injured individuals.',
        'Clear access pathways for incoming emergency responders.',
      ],
      resourcesNeeded: type === 'fire' ? ['fire_truck', 'ambulance'] : ['ambulance', 'police_unit'],
      estimatedResponseTime: 6,
    };
  }

  private getFallbackFirstAid(type: string): string[] {
    switch (type) {
      case 'fire':
        return [
          'Stay low under smoke and crawl towards the nearest exit.',
          'Touch doors with the back of your hand before opening; if hot, do not open.',
          'If clothes catch fire: STOP, DROP, and ROLL.',
          'Once outside, do not re-enter the burning structure.',
        ];
      case 'road_accident':
        return [
          'Turn on hazard lights and set warning markers if safe.',
          'Do not move severely injured victims unless immediate danger (fire/explosion) exists.',
          'Apply firm pressure with a clean cloth to severe bleeding.',
          'Keep victims warm with blankets and reassure them until help arrives.',
        ];
      case 'medical_emergency':
        return [
          'Check responsiveness and breathing.',
          'If non-responsive and trained, begin CPR (100-120 chest compressions per min).',
          'Loosen restrictive clothing around neck and chest.',
          'If breathing normally, place victim in safe recovery position on their side.',
        ];
      default:
        return [
          'Ensure surrounding environment is safe before offering assistance.',
          'Stay calm and speak reassuringly to affected persons.',
          'Control any bleeding with direct compression.',
          'Wait for official emergency response personnel on scene.',
        ];
    }
  }
}

export const aiService = new AIService();
