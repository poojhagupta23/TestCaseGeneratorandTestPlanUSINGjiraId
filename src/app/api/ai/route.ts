import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

export async function POST(request: Request) {
  try {
    const { prompt, systemPrompt, groqKey, groqModel } = await request.json();
    
    let apiKey = groqKey || process.env.GROQ_API_KEY;
    if (apiKey && apiKey.startsWith('Groq-')) {
      apiKey = apiKey.replace('Groq-', '');
    }
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Groq API Key.' }, { status: 400 });
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      model: groqModel || 'llama-3.3-70b-versatile',
      temperature: 0.1, // Low temperature for deterministic test planning
    });

    const content = completion.choices[0]?.message?.content;
    return NextResponse.json({ content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
