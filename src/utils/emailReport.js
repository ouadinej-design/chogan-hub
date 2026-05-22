import emailjs from '@emailjs/browser';

// EmailJS config — fill in your IDs after creating a free account at emailjs.com
// FREE plan: 200 emails/month
export const EMAIL_CONFIG = {
  serviceId: 'YOUR_EMAILJS_SERVICE_ID',    // e.g. 'service_abc123'
  templateId: 'YOUR_EMAILJS_TEMPLATE_ID',  // e.g. 'template_xyz789'
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',    // e.g. 'abc123XYZ'
};

export async function sendDailyReport({ consultantName, consultantEmail, adminEmail, logs, stats }) {
  const sections = {};
  logs.forEach(l => {
    if (!sections[l.section]) sections[l.section] = 0;
    sections[l.section]++;
  });

  const sectionsHtml = Object.entries(sections)
    .map(([sec, count]) => `<li><strong>${sec}</strong>: ${count} action(s)</li>`)
    .join('');

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  try {
    await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateId,
      {
        to_email: adminEmail,
        consultant_name: consultantName,
        consultant_email: consultantEmail,
        date: today,
        total_actions: logs.length,
        sections_detail: sectionsHtml || '<li>Aucune activité</li>',
        orders_count: stats.orders || 0,
        clients_count: stats.clients || 0,
        revenue: stats.revenue || '0',
      },
      EMAIL_CONFIG.publicKey
    );
    return true;
  } catch (err) {
    console.error('EmailJS error:', err);
    return false;
  }
}

export function shouldSendReport(username) {
  const key = `chogan_hub_last_report_${username}`;
  const last = localStorage.getItem(key);
  const today = new Date().toISOString().split('T')[0];
  if (last !== today) {
    localStorage.setItem(key, today);
    return true;
  }
  return false;
}
