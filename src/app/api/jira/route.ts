import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { jiraId, jiraUrl, jiraEmail, jiraToken } = await request.json();

    const url = jiraUrl || process.env.jira_url || process.env.JIRA_URL;
    const email = jiraEmail || process.env.jira_email || process.env.JIRA_EMAIL;
    const token = jiraToken || process.env.JIRA_TOKEN || process.env.JIRA_API_TOKEN;

    if (!url || !email || !token) {
      return NextResponse.json({ error: 'Missing Jira configuration in Settings or .env.local.' }, { status: 400 });
    }

    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    const auth = Buffer.from(`${email.trim()}:${token.trim()}`).toString('base64');

    const res = await fetch(`${cleanUrl}/rest/api/3/issue/${jiraId}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Jira API Error: ${res.status} ${text}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
