import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 're_placeholder');
}

export async function sendDailyReport({ consultant, stats, date }) {
  const dateFormatted = new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport Chogan - ${dateFormatted}</title>
  <style>
    body { margin:0; padding:0; background:#07070f; font-family:Arial,sans-serif; }
    .container { max-width:600px; margin:0 auto; background:#0d0d1a; border:1px solid #C9A84C22; }
    .header { background:linear-gradient(135deg,#07070f,#1a1a2e); padding:40px 30px; text-align:center; border-bottom:2px solid #C9A84C; }
    .logo { font-size:28px; font-weight:700; color:#C9A84C; letter-spacing:6px; }
    .content { padding:30px; }
    .stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:30px; }
    .stat-card { background:#12121f; border:1px solid #ffffff0d; border-radius:12px; padding:20px; text-align:center; }
    .stat-number { font-size:32px; font-weight:700; color:#C9A84C; }
    .stat-label { color:#888; font-size:12px; margin-top:4px; text-transform:uppercase; letter-spacing:1px; }
    .cta { text-align:center; margin:30px 0; }
    .cta a { background:linear-gradient(135deg,#C9A84C,#e8c97a); color:#07070f; padding:14px 32px; border-radius:8px; text-decoration:none; font-weight:600; }
    .footer { text-align:center; padding:24px; border-top:1px solid #ffffff0d; }
    .footer p { color:#444; font-size:12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">✦ CHOGAN</div>
      <p style="color:#888;font-size:13px;margin-top:8px">Rapport Quotidien — ${dateFormatted}</p>
    </div>
    <div class="content">
      <p style="color:#fff;font-size:18px;margin-bottom:24px">Bonjour <span style="color:#C9A84C">${consultant.prenom} ${consultant.nom}</span>,</p>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-number">${stats.connexions}</div><div class="stat-label">Connexions</div></div>
        <div class="stat-card"><div class="stat-number">${stats.commandes}</div><div class="stat-label">Commandes</div></div>
        <div class="stat-card"><div class="stat-number">${stats.nouveaux_clients}</div><div class="stat-label">Nouveaux Clients</div></div>
        <div class="stat-card"><div class="stat-number">${stats.rdv_du_jour}</div><div class="stat-label">RDV Aujourd'hui</div></div>
      </div>
      ${stats.rdv_demain && stats.rdv_demain.length > 0 ? `
      <div style="background:#12121f;border-radius:12px;padding:16px;margin-bottom:24px">
        <p style="color:#C9A84C;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">RDV de demain</p>
        ${stats.rdv_demain.map(r => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ffffff0a"><span style="color:#ccc;font-size:14px">${r.titre}</span><span style="color:#C9A84C;font-size:13px">${r.heure}</span></div>`).join('')}
      </div>` : ''}
      <div class="cta">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}/dashboard">Accéder à mon espace →</a>
      </div>
    </div>
    <div class="footer"><p>✦ Chogan Hub — Votre espace consultant</p></div>
  </div>
</body>
</html>`;

  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: 'Chogan Hub <onboarding@resend.dev>',
      to: consultant.email,
      subject: `✦ Chogan — Rapport du ${dateFormatted}`,
      html,
    });
    if (error) throw error;
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Erreur envoi email:', err);
    return { success: false, error: err.message };
  }
}
