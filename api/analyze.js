export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY manquante.' });

  try {
    const { content, mediaType, isText } = req.body;

    const userContent = isText
      ? [{ type:'text', text:`Liste de parfums Chogan :\n\n${content}` }]
      : mediaType === 'application/pdf'
        ? [
            { type:'document', source:{ type:'base64', media_type:'application/pdf', data:content } },
            { type:'text', text:'Extrais tous les parfums Chogan de ce document.' }
          ]
        : [
            { type:'image', source:{ type:'base64', media_type:mediaType, data:content } },
            { type:'text', text:'Extrais tous les parfums Chogan visibles dans cette image. Pour chaque produit visible, indique aussi la position approximative du flacon dans l\'image en pourcentage (x, y, largeur, hauteur de 0 à 100).' }
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
        system: `Tu es un expert des produits Chogan. Analyse le document et extrais TOUS les parfums.
Réponds UNIQUEMENT en JSON valide, sans markdown.
Format :
{"produits":[{
  "ref":"001",
  "nom":"One Million",
  "marque":"Paco Rabanne",
  "genre":"homme",
  "prix":{"15ml":11.90,"30ml":18.00,"50ml":null,"70ml":35.00},
  "categorie":"Parfum",
  "crop":{"x":5,"y":10,"w":20,"h":25}
}],"date_maj":"2025","source":"document"}
REFS: chiffres uniquement ("076" pas "T076").
CROP: position du flacon dans l'image en % (0-100). Null si pas d'image ou PDF.
Genres: "homme","femme","mixte".
IMPORTANT: ferme toujours avec }]}`,
        messages: [{ role:'user', content:userContent }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error:`API: ${err}` });
    }

    const data = await response.json();
    const rawText = data.content?.find(b=>b.type==='text')?.text || '';
    let text = rawText.replace(/```json|```/g,'').trim();

    // Réparation JSON si tronqué
    let parsed;
    try { parsed = JSON.parse(text); }
    catch {
      const lastBrace = text.lastIndexOf('},');
      const repaired = lastBrace > 0 ? text.substring(0, lastBrace+1)+']}' : null;
      try { if(repaired) parsed = JSON.parse(repaired); }
      catch { return res.status(200).json({ error:'JSON invalide. Essayez avec une image à la place du PDF.' }); }
    }

    return res.status(200).json({ content:[{ type:'text', text:JSON.stringify(parsed) }] });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
