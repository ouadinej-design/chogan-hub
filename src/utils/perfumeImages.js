// Mapping direct des parfums → URL image Wikipedia fiable
const PERFUME_WIKI_IMAGES = {
  // Homme
  'One Million':          'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/1_million.jpg/220px-1_million.jpg',
  'Acqua Di Gio':         'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Acqua_di_Gio.jpg/220px-Acqua_di_Gio.jpg',
  'Fahrenheit':           'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Dior_Fahrenheit_bottle.jpg/220px-Dior_Fahrenheit_bottle.jpg',
  'Le Mâle':              'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Jean_Paul_Gaultier_Le_Male.jpg/220px-Jean_Paul_Gaultier_Le_Male.jpg',
  'Invictus':             'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Invictus_fragrance.jpg/220px-Invictus_fragrance.jpg',
  'Sauvage':              'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Dior_Sauvage.jpg/220px-Dior_Sauvage.jpg',
  'Bleu de Chanel':       'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Bleu_de_Chanel.jpg/220px-Bleu_de_Chanel.jpg',
  'Terre d\'Hermès':      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Terre_d%27Herm%C3%A8s.jpg/220px-Terre_d%27Herm%C3%A8s.jpg',
  // Femme
  'J\'Adore':             'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Jadore_dior_parfum.jpg/220px-Jadore_dior_parfum.jpg',
  'Opium':                'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Opium_YSL.jpg/220px-Opium_YSL.jpg',
  'Coco Mademoiselle':    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Coco_Mademoiselle_Chanel.jpg/220px-Coco_Mademoiselle_Chanel.jpg',
  'Chanel n°5':           'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Chanel_No_5_-_2012.jpg/220px-Chanel_No_5_-_2012.jpg',
  'Angel':                'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Thierry_Mugler_Angel.jpg/220px-Thierry_Mugler_Angel.jpg',
  'La Vie est Belle':     'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/LaVieEstBelle_Lancome.jpg/220px-LaVieEstBelle_Lancome.jpg',
  'Black Opium':          'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Black_Opium_YSL.jpg/220px-Black_Opium_YSL.jpg',
  'Lady Million':         'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Lady_Million.jpg/220px-Lady_Million.jpg',
  'Good Girl':            'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Good_Girl_Perfume.jpg/220px-Good_Girl_Perfume.jpg',
  'Libre':                'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/YSL_Libre.jpg/220px-YSL_Libre.jpg',
};

// Cache localStorage
const CACHE_KEY = 'chogan_img_cache_v2';
const getCache = () => { try { return JSON.parse(localStorage.getItem(CACHE_KEY)||'{}'); } catch { return {}; } };
const setCache = (key, url) => {
  try { const c=getCache(); c[key]={url,ts:Date.now()}; localStorage.setItem(CACHE_KEY,JSON.stringify(c)); } catch {}
};

// Recherche Wikipedia avec requête précise
async function searchWiki(query) {
  try {
    // Encoder et chercher l'article Wikipedia
    const q = encodeURIComponent(query);
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${q}`);
    if (!res.ok) return null;
    const data = await res.json();
    // Vérifier que c'est bien un parfum (pas une plante, un instrument, etc.)
    const desc = (data.description||'').toLowerCase();
    const extract = (data.extract||'').toLowerCase();
    if (
      desc.includes('perfume') || desc.includes('fragrance') || desc.includes('cologne') ||
      desc.includes('eau de') || extract.includes('perfume') || extract.includes('fragrance') ||
      desc.includes('parfum') || extract.includes('parfum')
    ) {
      return data.thumbnail?.source || null;
    }
    return null;
  } catch { return null; }
}

// Obtenir l'image d'un parfum
export async function getPerfumeImage(ref, name, brand) {
  const cacheKey = `${ref}-${name}`;
  const cache = getCache();
  // Cache valide 30 jours
  if (cache[cacheKey] && (Date.now()-cache[cacheKey].ts) < 30*24*3600*1000) {
    return cache[cacheKey].url;
  }

  // 1. Mapping statique fiable
  for (const [key, url] of Object.entries(PERFUME_WIKI_IMAGES)) {
    if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) {
      setCache(cacheKey, url);
      return url;
    }
  }

  // 2. Wikipedia avec requête précise "nom marque perfume"
  const cleanBrand = (brand||'').replace('C. Dior','Dior').replace('Y. Saint Laurent','Yves Saint Laurent')
    .replace('P. Rabanne','Paco Rabanne').replace('G. Armani','Giorgio Armani')
    .replace('JP. Gaultier','Jean Paul Gaultier').replace('T. Mugler','Thierry Mugler')
    .replace('D&G','Dolce Gabbana').replace('N. Rodriguez','Narciso Rodriguez');

  const queries = [
    `${name} ${cleanBrand} perfume`,
    `${name} fragrance ${cleanBrand}`,
    `${name} (perfume)`,
    `${name} perfume`,
  ];

  for (const q of queries) {
    const url = await searchWiki(q);
    if (url) { setCache(cacheKey, url); return url; }
    await new Promise(r => setTimeout(r, 100));
  }

  setCache(cacheKey, null);
  return null;
}

// Précharger en batch
export async function preloadImages(perfumes, onProgress) {
  const results = {};
  for (let i = 0; i < perfumes.length; i++) {
    const p = perfumes[i];
    const url = await getPerfumeImage(p.ref, p.name, p.brand);
    results[p.ref] = url;
    if (onProgress) onProgress(i+1, perfumes.length, url);
    await new Promise(r => setTimeout(r, 200));
  }
  return results;
}
