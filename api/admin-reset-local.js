// Page HTML pour vider le localStorage des doublons
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Reset Cache</title>
<style>body{background:#1a1a1a;color:#F7EBE1;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:20px;}
button{background:#D2B795;color:#4E463F;border:none;padding:16px 32px;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;}
.ok{color:#64B464;font-size:18px;font-weight:700;}</style>
</head>
<body>
<p style="font-size:22px">🧹 Nettoyer le cache local</p>
<button onclick="clean()">Vider les doublons</button>
<div id="result"></div>
<script>
function clean() {
  // Dédoublonner chogan_hub_consultants dans le localStorage
  try {
    const raw = localStorage.getItem('chogan_hub_consultants');
    if (!raw) { document.getElementById('result').innerHTML='<p>Rien à nettoyer</p>'; return; }
    const list = JSON.parse(raw);
    const seen = new Map();
    list.forEach(c => {
      const key = [c.firstName||'', c.lastName||''].map(s=>s.trim().toLowerCase()).sort().join('_');
      if (!seen.has(key)) seen.set(key, c);
    });
    const clean = Array.from(seen.values());
    localStorage.setItem('chogan_hub_consultants', JSON.stringify(clean));
    document.getElementById('result').innerHTML = 
      '<p class="ok">✅ Nettoyé ! ' + list.length + ' → ' + clean.length + ' comptes</p>' +
      '<p>' + clean.map(c=>c.firstName+' '+c.lastName).join(', ') + '</p>' +
      '<br><button onclick="window.location=\\'https://chogan-hub-j63w.vercel.app\\'">Retourner à l\\'app</button>';
  } catch(e) {
    document.getElementById('result').innerHTML = '<p style="color:red">Erreur: '+e.message+'</p>';
  }
}
// Auto-clean au chargement
window.onload = clean;
</script>
</body>
</html>`);
}
