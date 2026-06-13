import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(request: Request) {
  try {
    const { groqKey } = await request.json();
    let apiKey = groqKey || process.env.GROQ_API_KEY;
    if (apiKey && apiKey.startsWith('Groq-')) {
      apiKey = apiKey.replace('Groq-', '');
    }
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Groq API Key.' }, { status: 400 });
    }

    const groq = new Groq({ apiKey });
    const models = await groq.models.list();
    
    // Filter only active, queryable models (optional, returning all for flexibility)
    return NextResponse.json({ models: models.data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
