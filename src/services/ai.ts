import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function generateCampaignMessage(
  campaignContext: {
    customerSegment: string;
    objective: string;
    productCategory?: string;
    tone?: 'formal' | 'casual' | 'friendly';
  }
): Promise<string[]> {
  const prompt = `Generate 3 marketing campaign messages for the following context:
- Customer Segment: ${campaignContext.customerSegment}
- Campaign Objective: ${campaignContext.objective}
${campaignContext.productCategory ? `- Product Category: ${campaignContext.productCategory}` : ''}
- Tone: ${campaignContext.tone || 'friendly'}

Each message should be personalized and include {firstName} placeholder.
Messages should be engaging and actionable.`;

  try {
    const systemPrompt = 'You are an expert marketing copywriter specializing in personalized campaign messages.';
    const result = await model.generateContent([systemPrompt, prompt]);
    const response = await result.response;
    const text = response.text();

    const messages = text
      .split('\n')
      .filter((msg: string) => msg.trim().length > 0)
      .slice(0, 3) || [];

    return messages;
  } catch (error) {
    console.error('Error generating campaign messages:', error);
    return [
      'Hi {firstName}, check out our latest offers just for you!',
      'Hi {firstName}, we miss you! Come back and enjoy special discounts.',
      'Hi {firstName}, discover new products we picked for you!'
    ];
  }
}

export async function analyzeCampaignPerformance(
  campaignData: {
    name: string;
    stats: {
      audienceSize: number;
      sent: number;
      delivered: number;
      failed: number;
    };
    segment: {
      name: string;
      rules: Array<{ field: string; operator: string; value: any }>;
    };
  }
): Promise<string> {
  const prompt = `Analyze this campaign performance data and provide insights:
Campaign: ${campaignData.name}
Audience Size: ${campaignData.stats.audienceSize}
Messages Sent: ${campaignData.stats.sent}
Delivered: ${campaignData.stats.delivered}
Failed: ${campaignData.stats.failed}
Segment: ${campaignData.segment.name}
Segment Rules: ${JSON.stringify(campaignData.segment.rules)}

Provide a concise, human-readable summary with key insights and recommendations.`;

  try {
    const systemPrompt = 'You are an expert marketing analyst providing insights on campaign performance.';
    const result = await model.generateContent([systemPrompt, prompt]);
    const response = await result.response;
    return response.text() || 'Analysis not available.';
  } catch (error) {
    console.error('Error analyzing campaign performance:', error);
    return `Campaign reached ${campaignData.stats.delivered} out of ${campaignData.stats.audienceSize} customers with a ${
      ((campaignData.stats.delivered / campaignData.stats.sent) * 100).toFixed(1)
    }% delivery rate.`;
  }
}

export async function suggestSegmentRules(description: string): Promise<Array<{
  field: string;
  operator: string;
  value: any;
  conjunction: 'AND' | 'OR';
}>> {
  const prompt = `Convert this natural language customer segment description into logical rules:
"${description}"

Return only the rules in a JSON array format. Each rule should have:
- field (totalSpent, totalOrders, lastPurchaseDate, or customerSegment)
- operator (>, <, >=, <=, ==, !=)
- value (number for totalSpent/totalOrders, ISO date for lastPurchaseDate, string for customerSegment)
- conjunction (AND/OR)

Example:
[
  {"field": "totalSpent", "operator": ">", "value": 5000, "conjunction": "AND"},
  {"field": "lastPurchaseDate", "operator": ">", "value": "2023-01-01", "conjunction": "OR"}
]`;

  try {
    const systemPrompt = 'You are an expert in converting natural language to logical rules. Respond only with valid JSON.';
    const result = await model.generateContent([systemPrompt, prompt]);
    const response = await result.response;
    const rules = JSON.parse(response.text() || '[]');
    return rules;
  } catch (error) {
    console.error('Error suggesting segment rules:', error);
    return [
      { field: 'totalSpent', operator: '>', value: 1000, conjunction: 'AND' }
    ];
  }
}
