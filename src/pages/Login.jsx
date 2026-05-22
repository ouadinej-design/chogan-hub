import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function Login() {
  const [step, setStep] = useState('role'); // 'role' | 'credentials'
  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState({ username: '', password: '' });
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
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = login(form.username.trim(), form.password);
    setLoading(false);
    if (result.ok) navigate('/');
    else setError(result.error);
  };

  const roleInfo = selectedRole ? ROLES[selectedRole] : null;

  return (
    <div style={S.wrap}>
      <div style={S.bg1} /><div style={S.bg2} />

      <div style={S.box} className="fade-in">
        {/* Logo */}
        <div style={S.logoWrap}>
          <Logo size={64} />
          <h1 style={S.title}>CHOGAN HUB</h1>
          <p style={S.sub}>Espace Privé</p>
        </div>

        {/* STEP 1 — Choix du rôle */}
        {step === 'role' && (
          <div>
            <p style={S.question}>Qui êtes-vous ?</p>
            <div style={S.roleGrid}>
              {Object.entries(ROLES).map(([key, r]) => (
                <button key={key} style={{ ...S.roleCard, borderColor: r.border, background: r.bg }}
                  onClick={() => handleRoleSelect(key)}>
                  <span style={S.roleIcon}>{r.icon}</span>
                  <span style={{ ...S.roleLabel, color: r.color }}>{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — Connexion */}
        {step === 'credentials' && (
          <div className="slide-up">
            {/* Badge rôle */}
            <div style={{ ...S.roleBadge, background: roleInfo.bg, borderColor: roleInfo.border }}>
              <span>{roleInfo.icon}</span>
              <span style={{ color: roleInfo.color, fontWeight: 700 }}>{roleInfo.label}</span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="label">Identifiant</label>
                <input
                  type="text"
                  placeholder="Votre identifiant"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  autoFocus
                />
              </div>
              <div className="field">
                <label className="label">Mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                />
              </div>
              {error && <div style={S.error}>{error}</div>}
              <button className="btn-gold" type="submit" disabled={loading} style={{ marginBottom: 12 }}>
                {loading ? '...' : 'SE CONNECTER'}
              </button>
              <button type="button" style={S.backBtn} onClick={() => { setStep('role'); setForm({ username:'', password:'' }); setError(''); }}>
                ← Changer de rôle
              </button>
            </form>
          </div>
        )}

        {/* Hint identifiants par défaut */}
        <div style={S.hint}>
          <div>👑 admin / Admin#2025</div>
          <div>🌸 marraine / Marraine#2025</div>
          <div>💼 consultante / Consultante#2025</div>
        </div>
      </div>
    </div>
  );
}

const S = {
  wrap: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20, background:'var(--bg-deep)', position:'relative', overflow:'hidden' },
  bg1: { position:'fixed', top:'-30%', left:'-20%', width:'60%', height:'60%', background:'radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 70%)', pointerEvents:'none' },
  bg2: { position:'fixed', bottom:'-20%', right:'-15%', width:'50%', height:'50%', background:'radial-gradient(ellipse, rgba(201,168,76,0.05) 0%, transparent 70%)', pointerEvents:'none' },
  box: { width:'100%', maxWidth:400, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', borderRadius:24, padding:'36px 28px', backdropFilter:'blur(30px)', boxShadow:'0 0 60px rgba(201,168,76,0.08)' },
  logoWrap: { textAlign:'center', marginBottom:28 },
  title: { fontFamily:'var(--font-display)', fontSize:24, letterSpacing:'0.25em', color:'var(--gold)', marginTop:14 },
  sub: { fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text-muted)', marginTop:5 },
  question: { textAlign:'center', fontSize:14, color:'var(--text-muted)', marginBottom:20, letterSpacing:'0.05em' },
  roleGrid: { display:'flex', flexDirection:'column', gap:12 },
  roleCard: { display:'flex', alignItems:'center', gap:16, padding:'18px 20px', borderRadius:16, border:'1px solid', cursor:'pointer', transition:'all 0.2s', textAlign:'left' },
  roleIcon: { fontSize:32, flexShrink:0 },
  roleLabel: { fontSize:17, fontWeight:700, fontFamily:'var(--font-display)', letterSpacing:'0.08em' },
  roleBadge: { display:'flex', alignItems:'center', gap:10, padding:'10px 16px', borderRadius:12, border:'1px solid', marginBottom:20, fontSize:15 },
  error: { background:'rgba(224,85,85,0.1)', border:'1px solid rgba(224,85,85,0.3)', borderRadius:8, padding:'10px 14px', color:'var(--red)', fontSize:13, marginBottom:14 },
  backBtn: { width:'100%', background:'none', border:'none', color:'var(--text-muted)', fontSize:13, padding:'8px', cursor:'pointer', textAlign:'center' },
  hint: { marginTop:20, padding:'12px 16px', background:'rgba(255,255,255,0.02)', borderRadius:12, border:'1px solid var(--border)', fontSize:11, color:'var(--text-dim)', lineHeight:2, textAlign:'center' },
};
