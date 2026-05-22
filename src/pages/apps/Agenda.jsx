import { useState } from 'react';
import { useData } from '../../context/DataContext';
import AppLayout from '../../components/AppLayout';

const TYPE_COLORS = {
  livraison: '#C9A84C', rdv: '#5584e0', appel: '#4caf7d',
  reunion: '#8b5cf6', autre: '#94a3b8',
};
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

export default function Agenda() {
  const { getAgendaEvents, addAgendaEvent, deleteAgendaEvent, updateAgendaEvent } = useData();
  const events = getAgendaEvents();
  const [tab, setTab] = useState('month');
  const [now, setNow] = useState(new Date());
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title:'', description:'', date:new Date().toISOString().split('T')[0], time:'10:00', type:'rdv' });
  const [showAdd, setShowAdd] = useState(false);

  const year = now.getFullYear(), month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const startOffset = (firstDay + 6) % 7; // Monday start

  const getEventsForDay = (d) => {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const selectedDateStr = selected
    ? `${year}-${String(month+1).padStart(2,'0')}-${String(selected).padStart(2,'0')}`
    : null;

  const handleAdd = () => {
    if (!form.title || !form.date) return;
    addAgendaEvent(form);
    setShowAdd(false);
    setForm({ title:'', description:'', date:new Date().toISOString().split('T')[0], time:'10:00', type:'rdv' });
  };

  const upcomingEvents = events
    .filter(e => e.date >= todayStr)
    .sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time))
    .slice(0, 20);

  return (
    <AppLayout title="Agenda" icon="📅"
      actions={<button style={S.addBtn} onClick={()=>setShowAdd(true)}>＋</button>}
    >
      <div style={S.tabs}>
        {['month','list'].map(t => (
          <button key={t} style={{ ...S.tab, ...(tab===t?S.tabActive:{}) }} onClick={()=>setTab(t)}>
            {t==='month' ? '📅 Mois' : '📋 À venir'}
          </button>
        ))}
      </div>

      {tab === 'month' && (
        <div style={{ padding:'12px 12px 0' }}>
          {/* Month nav */}
          <div style={S.monthNav}>
            <button style={S.navBtn} onClick={()=>setNow(new Date(year, month-1, 1))}>‹</button>
            <span style={S.monthLabel}>{MONTHS[month]} {year}</span>
            <button style={S.navBtn} onClick={()=>setNow(new Date(year, month+1, 1))}>›</button>
          </div>

          {/* Day headers */}
          <div style={S.calGrid}>
            {DAYS.map(d => <div key={d} style={S.dayHeader}>{d}</div>)}
          </div>

          {/* Calendar grid */}
          <div style={S.calGrid}>
            {Array(startOffset).fill(null).map((_,i) => <div key={`e${i}`} />)}
            {Array(daysInMonth).fill(null).map((_,i) => {
              const d = i+1;
              const dayStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
              const dayEvents = getEventsForDay(d);
              const isToday = dayStr === todayStr;
              const isSelected = selected === d;
              return (
                <div key={d} style={{
                  ...S.dayCell,
                  background: isSelected ? 'rgba(201,168,76,0.15)' : isToday ? 'rgba(201,168,76,0.07)' : 'transparent',
                  border: isToday ? '1px solid rgba(201,168,76,0.4)' : '1px solid transparent',
                  borderRadius: 8,
                }}
                  onClick={() => setSelected(selected === d ? null : d)}
                >
                  <span style={{ fontSize:12, color: isToday?'var(--gold)':isSelected?'var(--gold)':'var(--text-muted)', fontWeight: isToday?700:400 }}>{d}</span>
                  <div style={S.dotWrap}>
                    {dayEvents.slice(0,3).map((ev,ei) => (
                      <div key={ei} style={{ ...S.dot, background: TYPE_COLORS[ev.type]||'var(--gold)' }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Day detail */}
          {selected && (
            <div style={{ marginTop:12 }} className="slide-up">
              <div style={S.selectedTitle}>{selected} {MONTHS[month]}</div>
              {getEventsForDay(selected).length === 0
                ? <div style={S.noEvent}>Aucun événement</div>
                : getEventsForDay(selected).map(ev => (
                  <EventCard key={ev.id} ev={ev} onDelete={() => deleteAgendaEvent(ev.id)} />
                ))
              }
            </div>
          )}
        </div>
      )}

      {tab === 'list' && (
        <div style={{ padding:16 }}>
          {upcomingEvents.length === 0
            ? <div style={S.empty}>Aucun événement à venir</div>
            : upcomingEvents.map(ev => <EventCard key={ev.id} ev={ev} onDelete={() => deleteAgendaEvent(ev.id)} showDate />)
          }
        </div>
      )}

      {/* Add event modal */}
      {showAdd && (
        <div style={S.modal}>
          <div style={S.modalBox} className="slide-up">
            <div style={S.modalHeader}>
              <span style={{ fontFamily:'var(--font-display)', color:'var(--gold)', fontSize:15 }}>Nouvel événement</span>
              <button style={S.closeBtn} onClick={()=>setShowAdd(false)}>✕</button>
            </div>
            <div className="field">
              <label className="label">Titre *</label>
              <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Ex: Rendez-vous client" />
            </div>
            <div className="grid-2">
              <div className="field">
                <label className="label">Date *</label>
                <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} />
              </div>
              <div className="field">
                <label className="label">Heure</label>
                <input type="time" value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))} />
              </div>
            </div>
            <div className="field">
              <label className="label">Type</label>
              <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                <option value="rdv">Rendez-vous</option>
                <option value="livraison">Livraison</option>
                <option value="appel">Appel</option>
                <option value="reunion">Réunion</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Description</label>
              <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={2} placeholder="Notes..." />
            </div>
            <button className="btn-gold" onClick={handleAdd}>AJOUTER</button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function EventCard({ ev, onDelete, showDate }) {
  const color = TYPE_COLORS[ev.type] || 'var(--gold)';
  return (
    <div style={{ ...S.evCard, borderLeft:`3px solid ${color}` }} className="fade-in">
      <div style={{ flex:1 }}>
        <div style={S.evTitle}>{ev.title}</div>
        {ev.description && <div style={S.evDesc}>{ev.description}</div>}
        <div style={S.evMeta}>
          {showDate && <span>{ev.date} </span>}
          <span>{ev.time}</span>
          <span className="badge" style={{ fontSize:10, padding:'2px 8px', background: color+'22', color, border:`1px solid ${color}44`, marginLeft:6 }}>{ev.type}</span>
          {ev.orderId && <span style={{ marginLeft:6, fontSize:10, color:'var(--text-dim)' }}>→ {ev.orderId}</span>}
        </div>
      </div>
      <button style={S.delBtn} onClick={onDelete}>🗑</button>
    </div>
  );
}

const S = {
  tabs: { display:'flex', borderBottom:'1px solid var(--border)' },
  tab: { flex:1, padding:'12px', background:'none', color:'var(--text-muted)', fontSize:13, borderBottom:'2px solid transparent' },
  tabActive: { color:'var(--gold)', borderBottom:'2px solid var(--gold)' },
  addBtn: { background:'var(--gold-pale)', border:'1px solid var(--border)', color:'var(--gold)', borderRadius:8, padding:'6px 12px', fontSize:18 },
  monthNav: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  navBtn: { background:'var(--bg-card)', border:'1px solid var(--border)', color:'var(--text)', borderRadius:8, padding:'6px 14px', fontSize:18 },
  monthLabel: { fontFamily:'var(--font-display)', fontSize:15, color:'var(--gold)', letterSpacing:'0.08em' },
  calGrid: { display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:3, marginBottom:4 },
  dayHeader: { textAlign:'center', fontSize:10, color:'var(--text-dim)', padding:'6px 0', fontWeight:600 },
  dayCell: { aspectRatio:'1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', gap:2 },
  dotWrap: { display:'flex', gap:2 },
  dot: { width:4, height:4, borderRadius:'50%' },
  selectedTitle: { fontSize:13, fontWeight:700, color:'var(--gold)', marginBottom:10, letterSpacing:'0.06em', textTransform:'uppercase' },
  noEvent: { color:'var(--text-dim)', fontSize:13, padding:'12px 0' },
  evCard: {
    background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10,
    padding:'12px 14px', marginBottom:8, display:'flex', alignItems:'flex-start', gap:10,
  },
  evTitle: { fontSize:14, fontWeight:600, marginBottom:4 },
  evDesc: { fontSize:12, color:'var(--text-muted)', marginBottom:6 },
  evMeta: { display:'flex', alignItems:'center', flexWrap:'wrap', gap:4, fontSize:11, color:'var(--text-dim)' },
  delBtn: { background:'none', border:'none', cursor:'pointer', fontSize:14, flexShrink:0 },
  empty: { textAlign:'center', color:'var(--text-dim)', padding:'40px 0', fontSize:14 },
  modal: { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'flex-end', zIndex:100, backdropFilter:'blur(4px)' },
  modalBox: { width:'100%', background:'var(--bg-dark)', border:'1px solid var(--border)', borderRadius:'20px 20px 0 0', padding:'20px', maxHeight:'90vh', overflowY:'auto' },
  modalHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  closeBtn: { background:'none', color:'var(--text-muted)', fontSize:18, padding:'4px 8px' },
};
