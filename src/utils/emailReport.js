// ── Rapport quotidien automatique par EmailJS ─────────────────────────
// EmailJS gratuit : 200 emails/mois — inscription sur https://www.emailjs.com
// CONFIGURATION — à remplir dans Settings > Rapport Email de l'app
// OU directement ici si déploiement fixe :
export function getEmailConfig() {
  try {
    const cfg = JSON.parse(localStorage.getItem('chogan_email_cfg') || 'null');
    if (cfg?.serviceId) return cfg;
  } catch {}
  return {
    serviceId:  localStorage.getItem('emailjs_service_id')  || '',
    templateId: localStorage.getItem('emailjs_template_id') || '',
    publicKey:  localStorage.getItem('emailjs_public_key')  || '',
  };
}

export async function sendDailyReport({ consultantName, consultantEmail, adminEmail, logs, stats }) {
  const cfg = getEmailConfig();
  if (!cfg.serviceId || !cfg.templateId || !cfg.publicKey) {
    console.warn('EmailJS non configuré — rapport non envoyé');
    return false;
  }

  // Grouper les logs par section
  const sections = {};
  (logs || []).forEach(l => {
    if (!sections[l.section]) sections[l.section] = 0;
    sections[l.section]++;
  });
  const sectionsText = Object.entries(sections)
    .map(([sec, count]) => `• ${sec} : ${count} action(s)`)
    .join('\n') || '• Aucune activité enregistrée';

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Construire le HTML du rapport
  const reportHtml = `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#FDFAF6;border:1px solid #E6DCD0;border-radius:12px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#D2B795,#B89A6A);padding:24px;text-align:center">
    <div style="font-size:28px;margin-bottom:6px">✦ CHOGAN HUB</div>
    <div style="color:#fff;font-size:13px;letter-spacing:2px;text-transform:uppercase">Rapport Quotidien</div>
  </div>
  <div style="padding:24px">
    <p style="font-size:15px;color:#4E463F">Bonjour,</p>
    <p style="color:#4E463F">Voici l'activité de <strong>${consultantName}</strong> du <strong>${today}</strong> :</p>
    
    <div style="background:#fff;border:1px solid #E6DCD0;border-radius:10px;padding:16px;margin:16px 0">
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B89A6A;margin-bottom:12px">📊 Résumé</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;text-align:center">
        <div><div style="font-size:24px;font-weight:800;color:#B89A6A">${stats.orders || 0}</div><div style="font-size:11px;color:#888">Commandes</div></div>
        <div><div style="font-size:24px;font-weight:800;color:#3d6b9e">${stats.clients || 0}</div><div style="font-size:11px;color:#888">Clients</div></div>
        <div><div style="font-size:24px;font-weight:800;color:#2d7a4a">${stats.revenue || '0'}</div><div style="font-size:11px;color:#888">CA (DA)</div></div>
      </div>
    </div>

    <div style="background:#fff;border:1px solid #E6DCD0;border-radius:10px;padding:16px;margin:16px 0">
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B89A6A;margin-bottom:10px">📋 Sections visitées</div>
      <pre style="font-family:Georgia,serif;font-size:13px;color:#4E463F;line-height:1.7;white-space:pre-wrap;margin:0">${sectionsText}</pre>
    </div>

    <p style="font-size:11px;color:#999;text-align:center;margin-top:20px">
      Généré automatiquement par Chogan Hub · ${today}
    </p>
  </div>
</div>`;

  try {
    // EmailJS via SDK (chargé dynamiquement si absent)
    const emailjs = window.emailjs;
    if (!emailjs) {
      // Charger EmailJS SDK dynamiquement
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    await window.emailjs.send(
      cfg.serviceId,
      cfg.templateId,
      {
        to_email: adminEmail,
        to_name: 'Administratrice Chogan',
        consultant_name: consultantName,
        consultant_email: consultantEmail || '',
        date: today,
        total_actions: (logs || []).length,
        sections_detail: sectionsText,
        report_html: reportHtml,
        orders_count: stats.orders || 0,
        clients_count: stats.clients || 0,
        revenue: stats.revenue || '0',
      },
      cfg.publicKey
    );
    console.log('✅ Rapport quotidien envoyé à', adminEmail);
    return true;
  } catch (err) {
    console.error('EmailJS error:', err);
    return false;
  }
}

export function shouldSendReport(userId) {
  const key = `chogan_hub_last_report_${userId}`;
  const last = localStorage.getItem(key);
  const today = new Date().toISOString().split('T')[0];
  if (last !== today) {
    localStorage.setItem(key, today);
    return true;
  }
  return false;
}

export function buildDailyStats(userId) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const logs = JSON.parse(localStorage.getItem(`logs_${userId}_${today}`) || '[]');
    const sales = JSON.parse(localStorage.getItem('le_sales') || '[]');
    const clients = JSON.parse(localStorage.getItem('le_clients') || '[]');
    const todaySales = sales.filter(s => (s.date || s.createdAt || '').startsWith(today));
    const revenue = todaySales.reduce((t, s) => t + (parseFloat(s.amount || s.amt) || 0), 0);
    return {
      logs,
      stats: {
        orders: todaySales.length,
        clients: clients.length,
        revenue: revenue.toFixed(0),
      }
    };
  } catch {
    return { logs: [], stats: { orders: 0, clients: 0, revenue: '0' } };
  }
}
