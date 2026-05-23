// Vercel Serverless Function — proxy vers l'API Anthropic
// La clé API est stockée en variable d'environnement Vercel (ANTHROPIC_API_KEY)

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurée dans Vercel.' });

  try {
    const { content, mediaType, isText } = req.body;

    const userContent = isText
      ? [{ type: 'text', text: `Voici une liste de parfums Chogan. Extrais TOUS les produits avec leurs informations.\n\n${content}` }]
      : mediaType === 'application/pdf'
        ? [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: content } },
            { type: 'text', text: 'Extrais tous les parfums/produits Chogan de ce document.' }
          ]
        : [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: content } },
            { type: 'text', text: 'Extrais tous les parfums/produits Chogan visibles dans cette image.' }
          ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: `Tu es un assistant spécialisé dans les produits Chogan.
Analyse le document fourni et extrais TOUS les produits avec leurs prix.
Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans balises markdown.
Format attendu :
{
  "produits": [
    {
      "ref": "001",
      "nom": "One Million",
      "genre": "homme",
      "prix": { "15ml": 11.90, "30ml": 18.00, "50ml": null, "70ml": 35.00, "100ml": null },
      "categorie": "Parfum"
    }
  ],
  "date_maj": "2025",
  "source": "document"
}
Si un format n'existe pas, mets null. Genre: "homme", "femme" ou "mixte".`,
        messages: [{ role: 'user', content: userContent }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: `Anthropic API: ${err}` });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
