import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function Login() {
  const [step, setStep] = useState('role');
  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    setStep('credentials');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.firstName.trim()) { setError('Entrez votre prénom.'); return; }
    if (selectedRole !== 'admin' && !form.lastName.trim()) { setError('Entrez votre nom.'); return; }
    if (!form.password) { setError('Entrez votre mot de passe.'); return; }
    setLoading(true);
    // Try to fetch account from Supabase if not in localStorage
    try {
      const SB_URL = 'https://fwcauakszxjrzcexjlvt.supabase.co';
      const SB_KEY = 'sb_publishable_pvQfNMexCi9Y0Sm6onPQoQ_9aIWhow5';
      const res = await fetch(`${SB_URL}/rest/v1/app_data?key=eq.consultants&select=value`, {
        headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data[0] && Array.isArray(data[0].value)) {
          const existing = JSON.parse(localStorage.getItem('consultants') || '[]');
          const cloud = data[0].value;
          const merged = [...existing];
          cloud.forEach(cu => {
            if (!merged.some(lu => lu.firstName?.toLowerCase() === cu.firstName?.toLowerCase() && lu.lastName?.toLowerCase() === cu.lastName?.toLowerCase())) {
              merged.push(cu);
            }
          });
          localStorage.setItem('consultants', JSON.stringify(merged));
        }
      }
    } catch {}
    const result = login(form.firstName, form.lastName, form.password, selectedRole);
    setLoading(false);
    if (result && result.ok) navigate('/');
    else setError((result && result.error) || 'Compte introuvable.');
  };

  const roleInfo = selectedRole ? ROLES[selectedRole] : null;

  return (
    <div style={S.wrap}>
      <div style={S.decor1} /><div style={S.decor2} />

      <div style={S.box} className="fade-in">
        <div style={S.logoWrap}>
          <Logo size={60} />
          <h1 style={S.title}>CHOGAN HUB</h1>
          <p style={S.sub}>Espace Privé Consultantes</p>
        </div>

        {/* STEP 1 — Choix rôle */}
        {step === 'role' && (
          <div>
            <p style={S.question}>Qui êtes-vous ?</p>
            <div style={S.roleGrid}>
              {(['consultante', 'marraine', 'admin']).map(key => { const r = ROLES[key]; return (
                <button key={key}
                  style={{ ...S.roleCard, borderColor: r.color + '66', background: r.bg }}
                  onClick={() => handleRoleSelect(key)}>
                  <span style={{ fontSize: 28 }}>{r.icon}</span>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 16, fontFamily: 'var(--font-display)', color: r.color, letterSpacing: '0.06em' }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                      {key === 'admin' ? 'Accès complet' : key === 'marraine' ? 'Accès étendu' : 'Espace personnel'}
                    </div>
                  </div>
                  <span style={{ color: r.color, fontSize: 18 }}>›</span>
                </button>
              )})}
            </div>
          </div>
        )}

        {/* STEP 2 — Identifiants */}
        {step === 'credentials' && (
          <div className="slide-up">
            <div style={{ ...S.roleBadge, background: roleInfo.bg, borderColor: roleInfo.color + '55' }}>
              <span style={{ fontSize: 20 }}>{roleInfo.icon}</span>
              <span style={{ color: roleInfo.color, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
                {roleInfo.label}
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              {selectedRole === 'admin' ? (
                <div className="field">
                  <label className="label">Prénom</label>
                  <input type="text" placeholder="Votre prénom" value={form.firstName}
                    onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} autoFocus />
                </div>
              ) : (
                <div className="grid-2">
                  <div className="field">
                    <label className="label">Prénom</label>
                    <input type="text" placeholder="Prénom" value={form.firstName}
                      onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} autoFocus />
                  </div>
                  <div className="field">
                    <label className="label">Nom</label>
                    <input type="text" placeholder="Nom" value={form.lastName}
                      onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} />
                  </div>
                </div>
              )}

              <div className="field">
                <label className="label">Mot de passe</label>
                <input type="password" placeholder="••••••••" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              </div>

              {error && <div style={S.error}>{error}</div>}

              <button className="btn-gold" type="submit" disabled={loading} style={{ marginBottom: 10 }}>
                {loading ? '...' : 'SE CONNECTER'}
              </button>
              <button type="button" style={S.backBtn}
                onClick={() => { setStep('role'); setForm({ firstName: '', lastName: '', password: '' }); setError(''); }}>
                ← Changer de rôle
              </button>
            </form>

            {selectedRole !== 'admin' && (
              <div style={S.forgotBox}>
                <span style={{ fontSize: 16 }}>🔒</span>
                <span>Mot de passe oublié ? Contactez votre administratrice pour débloquer votre compte.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg)', position: 'relative', overflow: 'hidden' },
  decor1: { position: 'fixed', top: '-20%', right: '-15%', width: '50%', height: '50%', background: 'radial-gradient(ellipse, rgba(210,183,149,0.3) 0%, transparent 70%)', pointerEvents: 'none' },
  decor2: { position: 'fixed', bottom: '-20%', left: '-15%', width: '50%', height: '50%', background: 'radial-gradient(ellipse, rgba(234,220,201,0.5) 0%, transparent 70%)', pointerEvents: 'none' },
  box: { width: '100%', maxWidth: 400, background: 'rgba(255,255,255,0.8)', border: '1px solid var(--or-border)', borderRadius: 24, padding: '36px 28px', backdropFilter: 'blur(30px)', boxShadow: '0 8px 40px rgba(78,70,63,0.12)' },
  logoWrap: { textAlign: 'center', marginBottom: 28 },
  title: { fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.25em', color: 'var(--taupe)', marginTop: 14 },
  sub: { fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 5 },
  question: { textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 },
  roleGrid: { display: 'flex', flexDirection: 'column', gap: 10 },
  roleCard: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, border: '1px solid', cursor: 'pointer', transition: 'all 0.2s' },
  roleBadge: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, border: '1px solid', marginBottom: 18 },
  error: { background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 8, padding: '10px 14px', color: 'var(--red)', fontSize: 13, marginBottom: 14 },
  backBtn: { width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, padding: '8px', cursor: 'pointer', textAlign: 'center' },
  forgotBox: { display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 14, padding: '10px 12px', background: 'rgba(210,183,149,0.1)', borderRadius: 10, border: '1px solid var(--or-border)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 },
};
