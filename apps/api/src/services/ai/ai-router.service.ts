import OpenAI from 'openai';
import { logger } from '../../utils/logger';

interface AiGenerateOptions {
  systemPrompt: string;
  userPrompt: string;
  complexity: 'simple' | 'medium' | 'complex';
  maxTokens?: number;
}

interface AiGenerateResult {
  content: string;
  model: string;
  tokensUsed: number;
}

// Route model selection based on complexity
const MODEL_ROUTING = {
  simple: 'gpt-4o-mini',
  medium: 'gpt-4o-mini',
  complex: 'gpt-4o',
} as const;

// Fallback chain: primary → fallback
const MODEL_FALLBACK: Record<string, string> = {
  'gpt-4o': 'gpt-4o-mini',
  'gpt-4o-mini': 'gpt-4o-mini',
};

class AiRouterService {
  private openai: OpenAI | null = null;

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return this.openai;
  }

  async generate(options: AiGenerateOptions): Promise<AiGenerateResult> {
    const { systemPrompt, userPrompt, complexity, maxTokens = 8000 } = options;
    const primaryModel = MODEL_ROUTING[complexity];

    // Try primary model, fall back if it fails
    for (const model of [primaryModel, MODEL_FALLBACK[primaryModel]].filter(Boolean)) {
      try {
        const result = await this.callOpenAI(model, systemPrompt, userPrompt, maxTokens);
        return result;
      } catch (error) {
        logger.warn({ model, error }, 'AI model failed, trying fallback');
        if (model === MODEL_FALLBACK[primaryModel]) {
          throw error;
        }
      }
    }

    throw new Error('All AI models failed');
  }

  private async callOpenAI(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    maxTokens: number,
  ): Promise<AiGenerateResult> {
    const openai = this.getOpenAI();

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.3, // Low temp for deterministic code
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from AI');

    return {
      content,
      model: response.model,
      tokensUsed: response.usage?.total_tokens ?? 0,
    };
  }
}

export const aiRouterService = new AiRouterService();
