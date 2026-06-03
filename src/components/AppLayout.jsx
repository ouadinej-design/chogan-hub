import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AppLayout({ title, icon, children, actions }) {
  const navigate = useNavigate();

  // Injecter le titre dans la topbar LMS
  useEffect(() => {
    const el = document.getElementById('lms-page-title');
    if (el) el.textContent = title || '';
  }, [title]);

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header visible uniquement sur mobile (desktop: topbar LMS) */}
      <div className="app-header app-header-mobile">
        <button className="app-header-back" onClick={() => navigate(-1)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
        <span className="app-header-title">{title}</span>
        {actions && <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>{actions}</div>}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
