// Vercel Serverless Function — proxy Anthropic avec gestion PDF large

export default async function handler(req, res) {
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
      ? [{ type: 'text', text: `Liste de parfums Chogan à extraire :\n\n${content}` }]
      : mediaType === 'application/pdf'
        ? [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: content } },
            { type: 'text', text: 'Extrais TOUS les parfums de ce catalogue Chogan.' }
          ]
        : [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: content } },
            { type: 'text', text: 'Extrais TOUS les parfums Chogan visibles dans cette image.' }
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
        max_tokens: 8000,
        system: `Tu es un expert des produits Chogan.
Extrais TOUS les produits du document avec leurs prix.
Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans balises markdown.
Format STRICT :
{"produits":[{"ref":"001","nom":"One Million","marque":"Paco Rabanne","genre":"homme","prix":{"15ml":11.90,"30ml":18.00,"50ml":null,"70ml":35.00,"100ml":null},"categorie":"Parfum","img":null}],"date_maj":"2025","source":"document"}
Genres: "homme", "femme" ou "mixte". Mets null si le format n'existe pas.
REFS: Utilise UNIQUEMENT les chiffres. Exemples: "076" pas "T076", "147" pas "147M".
IMG: Si tu vois une URL d'image dans le document, mets-la dans "img", sinon null.
IMPORTANT: Termine TOUJOURS par }]} pour fermer le JSON correctement.`,
        messages: [{ role: 'user', content: userContent }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: `Anthropic API: ${err}` });
    }

    const data = await response.json();
    const rawText = data.content?.find(b => b.type === 'text')?.text || '';

    // Nettoyage et réparation JSON robuste
    let text = rawText.replace(/```json|```/g, '').trim();

    // Si le JSON est tronqué, on répare en coupant au dernier produit complet
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Tentative de réparation : couper au dernier "}" complet dans le tableau
      const lastBrace = text.lastIndexOf('},');
      const lastBraceEnd = text.lastIndexOf('}');
      
      // Essai 1 : fermer le tableau + objet
      const repaired = text.substring(0, lastBrace + 1) + ']}';
      try {
        parsed = JSON.parse(repaired);
      } catch {
        // Essai 2 : chercher le dernier objet complet
        const match = text.match(/^(.*\})\s*[,\s]*$/s);
        if (match) {
          try {
            const rep2 = text.substring(0, lastBraceEnd + 1) + ']}';
            parsed = JSON.parse(rep2);
          } catch {
            // Essai 3 : extraction par regex
            const produits = [];
            const regex = /\{[^{}]*"ref"\s*:\s*"([^"]+)"[^{}]*"nom"\s*:\s*"([^"]+)"[^{}]*\}/g;
            let m;
            while ((m = regex.exec(text)) !== null) {
              try {
                produits.push(JSON.parse(m[0]));
              } catch {}
            }
            if (produits.length > 0) {
              parsed = { produits, date_maj: '2025', source: 'document', note: 'JSON partiellement récupéré' };
            } else {
              return res.status(200).json({ 
                error: `JSON invalide — essayez avec des images à la place du PDF, ou utilisez "Coller du texte".`,
                rawPreview: text.substring(0, 200)
              });
            }
          }
        }
      }
    }

    return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(parsed) }] });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
