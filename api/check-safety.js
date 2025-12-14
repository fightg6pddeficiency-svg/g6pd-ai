export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ error: 'Input is required' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are a G6PD deficiency safety expert. Analyze this food/medication for G6PD safety: "${input}"

Respond ONLY with valid JSON in this exact format (no markdown, no backticks):
{
  "item": "name of the item",
  "safety": "safe" or "unsafe" or "caution",
  "reason": "brief explanation",
  "alternatives": ["alternative 1", "alternative 2"],
  "severity": "low" or "medium" or "high"
}

Consider these G6PD triggers: fava beans, mothballs (naphthalene), certain antibiotics (sulfonamides, nitrofurantoin), antimalarials (primaquine), aspirin in high doses, vitamin C supplements in high doses, menthol, henna.`
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content[0].text;
    const cleanText = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanText);
    
    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    return res.status(500).json({
      item: input,
      safety: 'caution',
      reason: 'Unable to verify safety at this time. Please consult with a healthcare provider.',
      alternatives: [],
      severity: 'medium'
    });
  }
}
