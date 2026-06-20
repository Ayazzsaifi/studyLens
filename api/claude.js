// api/claude.js
// Vercel Serverless Function — proxies requests to Google's Gemini API.
// The API key lives only here, as an environment variable (GEMINI_API_KEY),
// never in the browser/frontend code.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfigured: GEMINI_API_KEY is not set in Vercel environment variables.' });
  }

  try {
    const { prompt, maxTokens } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing "prompt" in request body.' });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens || 800 }
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'Gemini API error' });
    }

    const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('\n').trim();
    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unexpected server error' });
  }
}
