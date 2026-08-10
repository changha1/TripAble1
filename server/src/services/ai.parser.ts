import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

export const AISearchSchema = z.object({
  tourismTypes: z.array(z.enum(['nature', 'culture', 'history', 'experience', 'performance', 'rest', 'sports', 'shopping'])),
  accessibility: z.array(z.enum(['wheelchair', 'disabled-toilet', 'disabled-parking', 'elevator', 'baby', 'senior', 'rest-area'])),
  partySize: z.number().min(1).max(20).default(1),
  transportation: z.array(z.enum(['public', 'car', 'min-walk', 'parking', 'nearby'])),
  duration: z.enum(['day', 'overnight']).default('day')
});

export type AISearchResult = z.infer<typeof AISearchSchema>;

export class AIParser {
  /**
   * 자연어 입력을 구조화된 조건 JSON으로 변환합니다.
   * API Key가 없을 경우 내장된 규칙 기반 형태소 키워드 분석기를 폴백으로 작동시킵니다.
   */
  public static async parsePrompt(prompt: string): Promise<AISearchResult> {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (anthropicKey) {
      try {
        return await this.parseWithClaude(prompt, anthropicKey);
      } catch (err) {
        console.warn('Claude API parsing failed, falling back to rule-based parser:', err);
      }
    } else if (openaiKey) {
      try {
        return await this.parseWithOpenAI(prompt, openaiKey);
      } catch (err) {
        console.warn('OpenAI API parsing failed, falling back to rule-based parser:', err);
      }
    }

    // API Key가 없거나 에러 발생 시 키워드 분석 실행
    return this.parseWithRules(prompt);
  }

  private static async parseWithClaude(prompt: string, apiKey: string): Promise<AISearchResult> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.0,
        system: `You are a helpful travel assistant. Parse the user's natural language Korean travel request into a structured JSON query object that strictly follows this JSON schema:
{
  "tourismTypes": Array of ("nature" | "culture" | "history" | "experience" | "performance" | "rest" | "sports" | "shopping"),
  "accessibility": Array of ("wheelchair" | "disabled-toilet" | "disabled-parking" | "elevator" | "baby" | "senior" | "rest-area"),
  "partySize": Number (minimum 1, maximum 20),
  "transportation": Array of ("public" | "car" | "min-walk" | "parking" | "nearby"),
  "duration": "day" | "overnight"
}
ONLY return the raw JSON object, without markdown code block styling or any conversational text.`,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic HTTP error! status: ${response.status}`);
    }

    const result = await response.json() as { content: { text: string }[] };
    const text = result.content[0].text;
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);
    return AISearchSchema.parse(parsed);
  }

  private static async parseWithOpenAI(prompt: string, apiKey: string): Promise<AISearchResult> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Parse the user's Korean travel request into a JSON query object. Strictly follow this JSON schema:
{
  "tourismTypes": Array of ("nature" | "culture" | "history" | "experience" | "performance" | "rest" | "sports" | "shopping"),
  "accessibility": Array of ("wheelchair" | "disabled-toilet" | "disabled-parking" | "elevator" | "baby" | "senior" | "rest-area"),
  "partySize": Number (minimum 1),
  "transportation": Array of ("public" | "car" | "min-walk" | "parking" | "nearby"),
  "duration": "day" | "overnight"
}`
          },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI HTTP error! status: ${response.status}`);
    }

    const result = await response.json() as { choices: { message: { content: string } }[] };
    const content = result.choices[0].message.content;
    const parsed = JSON.parse(content);
    return AISearchSchema.parse(parsed);
  }

  /**
   * 로컬 키워드 매칭 기반 폴백 분석기
   */
  private static parseWithRules(prompt: string): AISearchResult {
    const tourismTypes: AISearchResult['tourismTypes'] = [];
    const accessibility: AISearchResult['accessibility'] = [];
    const transportation: AISearchResult['transportation'] = [];
    let duration: AISearchResult['duration'] = 'day';
    let partySize = 1;

    const lower = prompt.toLowerCase();

    // 1. 관광 유형
    if (lower.includes('자연') || lower.includes('산') || lower.includes('바다') || lower.includes('폭포') || lower.includes('경치') || lower.includes('숲')) {
      tourismTypes.push('nature');
    }
    if (lower.includes('미술관') || lower.includes('박물관') || lower.includes('문화') || lower.includes('전시')) {
      tourismTypes.push('culture');
    }
    if (lower.includes('역사') || lower.includes('궁궐') || lower.includes('유적') || lower.includes('경복궁') || lower.includes('한옥')) {
      tourismTypes.push('history');
    }
    if (lower.includes('체험') || lower.includes('민속촌') || lower.includes('만들기') || lower.includes('공방')) {
      tourismTypes.push('experience');
    }
    if (lower.includes('축제') || lower.includes('공연') || lower.includes('음악회') || lower.includes('콘서트')) {
      tourismTypes.push('performance');
    }
    if (lower.includes('휴식') || lower.includes('힐링') || lower.includes('카페') || lower.includes('조용한')) {
      tourismTypes.push('rest');
    }
    if (lower.includes('스포츠') || lower.includes('등산') || lower.includes('레포츠') || lower.includes('액티비티')) {
      tourismTypes.push('sports');
    }
    if (lower.includes('쇼핑') || lower.includes('시장') || lower.includes('마트')) {
      tourismTypes.push('shopping');
    }

    // 2. 무장애 편의시설
    if (lower.includes('휠체어') || lower.includes('장애인 전용')) {
      accessibility.push('wheelchair');
    }
    if (lower.includes('화장실') && (lower.includes('장애인') || lower.includes('배리어프리'))) {
      accessibility.push('disabled-toilet');
    }
    if (lower.includes('장애인 주차') || lower.includes('전용 주차')) {
      accessibility.push('disabled-parking');
    }
    if (lower.includes('엘리베이터') || lower.includes('승강기')) {
      accessibility.push('elevator');
    }
    if (lower.includes('유모차') || lower.includes('아기') || lower.includes('아이동반') || lower.includes('수유')) {
      accessibility.push('baby');
    }
    if (lower.includes('부모님') || lower.includes('고령자') || lower.includes('할머니') || lower.includes('할아버지') || lower.includes('노인')) {
      accessibility.push('senior');
    }
    if (lower.includes('쉼터') || lower.includes('벤치') || lower.includes('휴식 공간') || lower.includes('쉬어갈')) {
      accessibility.push('rest-area');
    }

    // 3. 이동 조건
    if (lower.includes('버스') || lower.includes('지하철') || lower.includes('대중교통')) {
      transportation.push('public');
    }
    if (lower.includes('차') || lower.includes('자동차') || lower.includes('드라이브') || lower.includes('운전')) {
      transportation.push('car');
    }
    if (lower.includes('적게 걷는') || lower.includes('도보 최소') || lower.includes('많이 걷지 않는')) {
      transportation.push('min-walk');
    }
    if (lower.includes('주차장') || lower.includes('주차 필요')) {
      transportation.push('parking');
    }
    if (lower.includes('가까운') || lower.includes('인접한') || lower.includes('주변의')) {
      transportation.push('nearby');
    }

    // 4. 여행 기간
    if (lower.includes('1박2일') || lower.includes('숙박') || lower.includes('펜션') || lower.includes('호텔')) {
      duration = 'overnight';
    }

    // 5. 인원 매칭 (간단 정규식)
    const partyMatch = lower.match(/(\d+)\s*명/);
    if (partyMatch) {
      partySize = Math.min(20, Math.max(1, parseInt(partyMatch[1])));
    } else if (lower.includes('혼자') || lower.includes('나홀로')) {
      partySize = 1;
    } else if (lower.includes('부부') || lower.includes('둘이서')) {
      partySize = 2;
    }

    return {
      tourismTypes,
      accessibility,
      partySize,
      transportation,
      duration
    };
  }
}
