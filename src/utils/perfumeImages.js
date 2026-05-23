// Cache des images en localStorage
const CACHE_KEY = 'chogan_img_cache';

const getCache = () => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; }
};
const setCache = (key, url) => {
  try {
    const cache = getCache();
    cache[key] = { url, ts: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
};

// Cherche une image via l'API Wikipedia (gratuite, CORS autorisé)
async function searchWikipedia(query) {
  try {
    const q = encodeURIComponent(query);
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${q}`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.thumbnail?.source || data.originalimage?.source || null;
  } catch { return null; }
}

// Construire des variantes de recherche pour un parfum
function buildQueries(name, brand) {
  const cleanBrand = brand?.replace(/[^a-zA-Z0-9\s]/g, '').trim() || '';
  const cleanName  = name?.replace(/[^a-zA-Z0-9\s]/g, '').trim() || '';
  return [
    `${cleanName} ${cleanBrand} perfume`,
    `${cleanName} fragrance`,
    `${cleanBrand} ${cleanName}`,
    cleanName,
  ].filter(Boolean);
}

// Fonction principale : retourne l'URL de l'image ou null
export async function getPerfumeImage(ref, name, brand) {
  const cacheKey = `${ref}-${name}`;
  const cache    = getCache();

  // Retourner le cache si < 7 jours
  if (cache[cacheKey] && (Date.now() - cache[cacheKey].ts) < 7 * 24 * 3600 * 1000) {
    return cache[cacheKey].url;
  }

  const queries = buildQueries(name, brand);
  for (const q of queries) {
    const url = await searchWikipedia(q);
    if (url) {
      setCache(cacheKey, url);
      return url;
    }
  }

  // Pas d'image trouvée — on cache null pour éviter de retenter
  setCache(cacheKey, null);
  return null;
}

// Précharger un batch de parfums (appelé en arrière-plan)
export async function preloadImages(perfumes, onProgress) {
  const results = {};
  for (let i = 0; i < perfumes.length; i++) {
    const p = perfumes[i];
    const url = await getPerfumeImage(p.ref, p.name, p.brand);
    results[p.ref] = url;
    if (onProgress) onProgress(i + 1, perfumes.length, url);
    // Pause courte pour ne pas surcharger Wikipedia
    await new Promise(r => setTimeout(r, 150));
  }
  return results;
}
