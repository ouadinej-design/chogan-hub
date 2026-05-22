import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div style={styles.wrap}>
      <div style={styles.bg1} />
      <div style={styles.bg2} />
      <div style={styles.container} className="fade-in">
        <div style={styles.logoWrap}>
          <Logo size={72} />
          <h1 style={styles.title}>CHOGAN HUB</h1>
          <p style={styles.subtitle}>Espace Consultantes</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="field">
            <label className="label">Identifiant</label>
            <input
              type="text"
              placeholder="Votre identifiant"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              autoComplete="username"
            />
          </div>
          <div className="field">
            <label className="label">Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              autoComplete="current-password"
            />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button className="btn-gold" type="submit" disabled={loading}>
            {loading ? '...' : 'SE CONNECTER'}
          </button>
        </form>

        <p style={styles.hint}>
          Première connexion — identifiant: <span style={{ color: 'var(--gold)' }}>admin</span><br />
          mot de passe: <span style={{ color: 'var(--gold)' }}>Chogan2025!</span>
        </p>
        <p style={styles.hint} >Changez votre mot de passe dans les Paramètres.</p>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    background: 'var(--bg-deep)',
  },
  bg1: {
    position: 'fixed', top: '-30%', left: '-20%', width: '60%', height: '60%',
    background: 'radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bg2: {
    position: 'fixed', bottom: '-20%', right: '-15%', width: '50%', height: '50%',
    background: 'radial-gradient(ellipse, rgba(201,168,76,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    width: '100%', maxWidth: 400,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border)',
    borderRadius: 24,
    padding: '40px 32px',
    backdropFilter: 'blur(30px)',
    boxShadow: '0 0 60px rgba(201,168,76,0.08)',
  },
  logoWrap: { textAlign: 'center', marginBottom: 36 },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 26,
    letterSpacing: '0.25em',
    color: 'var(--gold)',
    marginTop: 16,
  },
  subtitle: {
    fontFamily: 'var(--font-body)',
    fontSize: 12,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginTop: 6,
  },
  form: { marginBottom: 20 },
  error: {
    background: 'rgba(224,85,85,0.1)',
    border: '1px solid rgba(224,85,85,0.3)',
    borderRadius: 8,
    padding: '10px 14px',
    color: 'var(--red)',
    fontSize: 13,
    marginBottom: 14,
  },
  hint: {
    textAlign: 'center',
    fontSize: 11,
    color: 'var(--text-dim)',
    lineHeight: 1.8,
    marginTop: 8,
  },
};
