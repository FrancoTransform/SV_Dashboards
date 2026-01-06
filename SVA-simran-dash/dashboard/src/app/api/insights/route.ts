import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fundData from '@/data/fund_data.json';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { summary } = body;

        if (!summary) {
            return NextResponse.json(
                { error: 'No summary data provided' },
                { status: 400 }
            );
        }

        const prompt = `
      You are an expert venture capital analyst. Analyze the following fund performance data and provide a comprehensive executive summary.
      
      Structure your response as a JSON object with the following fields:
      1. "executive_summary": A concise 2-3 sentence overview of the fund's current status.
      2. "key_takeaways": An array of 3-5 bullet points highlighting the most important findings.
      3. "action_items": An array of 3 specific, actionable recommendations for the investment team.
      4. "detailed_insights": An array of 3-4 deeper analysis points, each with:
         - "title": Short headline
         - "description": Detailed explanation
         - "impact": "High", "Medium", or "Low"
         - "sentiment": "Positive", "Neutral", or "Negative"

      Focus on:
      - Overall fund health (TVPI, IRR, etc.)
      - Top performing assets and their drivers
      - Portfolio composition (Realized vs Unrealized)
      - Any notable risks or opportunities based on the data
      
      Data:
      ${JSON.stringify(summary, null, 2)}
    `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4o",
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content returned from OpenAI");

        return NextResponse.json(JSON.parse(content));
    } catch (error) {
        console.error('Error generating insights:', error);
        return NextResponse.json(
            { error: 'Failed to generate insights' },
            { status: 500 }
        );
    }
}
