import { useState, useEffect } from 'react';
import { store } from '../utils/storage';

export const TUTORIALS = {
  orders:    { title:'Commandes 🛒',      steps:[{icon:'👤',title:'Client',desc:'Entre prénom, nom, email et téléphone. La fiche se crée automatiquement.'},{icon:'🧴',title:'Produits',desc:'Sélectionne les parfums avec taille et quantité.'},{icon:'💶',title:'Montant',desc:'Saisis le montant en € ou DA. La conversion est automatique.'},{icon:'✅',title:'Valider',desc:'Vente enregistrée, client créé, fidélité et agenda mis à jour !'}] },
  ventes:    { title:'Ventes 💰',          steps:[{icon:'➕',title:'Nouvelle vente',desc:'Bouton + pour saisir une vente rapidement.'},{icon:'🔍',title:'Recherche',desc:'Retrouve une vente par client ou produit.'},{icon:'✏️',title:'Modifier',desc:'Modifie ou supprime via les boutons.'},{icon:'📊',title:'Total auto',desc:'Le total et le nombre se calculent automatiquement.'}] },
  clients:   { title:'Clients 👥',         steps:[{icon:'👤',title:'Fiche client',desc:'Coordonnées, historique et carte fidélité.'},{icon:'🔍',title:'Recherche',desc:'Trouve un client en quelques lettres.'},{icon:'📞',title:'Contacter',desc:'Appuie sur le numéro ou email pour contacter directement.'},{icon:'📅',title:'Relance',desc:'La date du dernier achat s\'affiche pour les relances.'}] },
  fidelite:  { title:'Fidélité ⭐',         steps:[{icon:'🥉',title:'Niveaux',desc:'Membre → Bronze → Argent → Or → Platine → Diamant.'},{icon:'💎',title:'Points auto',desc:'10 points par euro. Les niveaux se mettent à jour seuls.'},{icon:'📲',title:'QR Code',desc:'Chaque client a un QR Code personnel.'},{icon:'🔔',title:'Relances',desc:'Clients inactifs 30j dans l\'onglet Agenda.'}] },
  agenda:    { title:'Agenda 📅',           steps:[{icon:'➕',title:'Événement',desc:'Crée des RDV, ateliers, livraisons ou rappels.'},{icon:'🏷️',title:'Types',desc:'Vente, Livraison, Atelier, Rappel, RDV, Autre.'},{icon:'🔄',title:'Sync',desc:'Les ventes via Commandes apparaissent automatiquement.'},{icon:'👁️',title:'Visibilité',desc:'Tu vois tes événements. La marraine voit toute l\'équipe.'}] },
  stats:     { title:'Statistiques 📊',     steps:[{icon:'📈',title:'CA du mois',desc:'Chiffre d\'affaires mensuel et évolution.'},{icon:'📋',title:'Dashboard',desc:'Vue synthétique : ventes, clients, meilleurs produits.'},{icon:'📅',title:'Activité',desc:'Fil chronologique ventes + événements.'},{icon:'🔍',title:'Filtres',desc:'Par semaine, mois ou année.'}] },
  reseau:    { title:'Réseau 🌳',           steps:[{icon:'🌳',title:'Arbre',desc:'Équipe avec CA en temps réel.'},{icon:'⚙️',title:'Gestion',desc:'Ajoute et réorganise les membres.'},{icon:'👥',title:'Équipe',desc:'Performances et statut de chaque consultante.'},{icon:'🏆',title:'Top 5',desc:'Classement des meilleures du mois.'}] },
  formation: { title:'Formation 🎓',        steps:[{icon:'📚',title:'Modules',desc:'Inscription, La Mallette, La Vente — dans l\'ordre.'},{icon:'💬',title:'Scripts',desc:'Scripts prêts à l\'emploi pour chaque situation.'},{icon:'📝',title:'Quiz',desc:'Teste tes connaissances Chogan.'}] },
  wallet:    { title:'Wallet 💼',           steps:[{icon:'💰',title:'Accès VIP',desc:'Sur autorisation de l\'administratrice.'},{icon:'📊',title:'Suivi',desc:'Revenus, commissions et objectifs.'},{icon:'🔒',title:'Sécurisé',desc:'Tes données financières sont protégées.'}] },
};

/* ── Onboarding première connexion ── */
export function OnboardingTutorial({ onDone }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon:'🏠', title:'Page Flux', desc:'Les annonces de ta marraine et les succès de l\'équipe.' },
    { icon:'⚏',  title:'Page Apps', desc:'Bouton APPS en bas à droite pour toutes tes applications.' },
    { icon:'💰', title:'Objectif mensuel', desc:'La barre du haut suit ta progression. Mise à jour automatique avec tes ventes.' },
    { icon:'🔑', title:'Quitter', desc:'Bouton QUITTER en bas à gauche. Toutes tes données sont sauvegardées dans le cloud.' },
  ];
  const isLast = step === steps.length - 1;
  return (
    <div style={{ position:'fixed',inset:0,zIndex:1000,background:'rgba(78,70,63,0.75)',display:'flex',alignItems:'flex-end',justifyContent:'center',backdropFilter:'blur(4px)' }}>
      <div style={{ width:'100%',maxWidth:480,background:'#fff',borderRadius:'24px 24px 0 0',padding:'28px 24px 44px',animation:'slideUp 0.3s ease' }}>
        <div style={{ display:'flex',gap:6,marginBottom:24 }}>
          {steps.map((_,i) => <div key={i} style={{ flex:1,height:3,borderRadius:2,background:i<=step?'linear-gradient(90deg,#D2B795,#B89A6A)':'rgba(210,183,149,0.2)',transition:'background 0.3s' }}/>)}
        </div>
        <div style={{ textAlign:'center',marginBottom:28 }}>
          <div style={{ width:72,height:72,borderRadius:20,margin:'0 auto 16px',background:'rgba(210,183,149,0.15)',border:'1.5px solid rgba(210,183,149,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32 }}>{steps[step].icon}</div>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif',fontSize:22,color:'#4E463F',marginBottom:10,fontWeight:600 }}>{steps[step].title}</h2>
          <p style={{ fontSize:14,color:'rgba(78,70,63,0.65)',lineHeight:1.7,maxWidth:320,margin:'0 auto' }}>{steps[step].desc}</p>
        </div>
        <div style={{ display:'flex',gap:10 }}>
          {step > 0 && <button onClick={()=>setStep(s=>s-1)} style={{ flex:1,padding:13,borderRadius:12,background:'transparent',border:'1px solid rgba(210,183,149,0.3)',color:'rgba(78,70,63,0.6)',fontSize:13,fontWeight:600,cursor:'pointer' }}>← Précédent</button>}
          <button onClick={()=>isLast?onDone():setStep(s=>s+1)} style={{ flex:2,padding:13,borderRadius:12,background:'linear-gradient(135deg,#D2B795,#B89A6A)',border:'none',color:'#fff',fontSize:13,fontWeight:700,letterSpacing:'0.06em',cursor:'pointer',boxShadow:'0 4px 16px rgba(184,154,106,0.3)' }}>{isLast?'✓ Commencer':'Suivant →'}</button>
        </div>
        <button onClick={onDone} style={{ display:'block',margin:'14px auto 0',background:'none',border:'none',fontSize:12,color:'rgba(78,70,63,0.35)',cursor:'pointer' }}>Passer</button>
      </div>
    </div>
  );
}

/* ── Bouton aide ? — hooks TOUJOURS avant tout return ── */
export function HelpButton({ appId }) {
  const [open, setOpen]   = useState(false);
  const [active, setActive] = useState(0);
  // ↑ Tous les hooks EN PREMIER, avant toute condition
  const tuto = TUTORIALS[appId];
  if (!tuto) return null;
  const close = () => { setOpen(false); setActive(0); };
  return (
    <>
      <button onClick={()=>setOpen(true)} style={{ width:30,height:30,borderRadius:15,background:'rgba(210,183,149,0.15)',border:'1.5px solid rgba(210,183,149,0.4)',color:'#B89A6A',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0 }}>?</button>
      {open && (
        <div style={{ position:'fixed',inset:0,zIndex:500,background:'rgba(78,70,63,0.6)',display:'flex',alignItems:'flex-end',justifyContent:'center',backdropFilter:'blur(3px)' }} onClick={close}>
          <div style={{ width:'100%',maxWidth:480,background:'#fff',borderRadius:'24px 24px 0 0',padding:'24px 20px 40px',animation:'slideUp 0.25s ease' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
              <h3 style={{ fontFamily:'Cormorant Garamond,serif',fontSize:18,color:'#4E463F',fontWeight:600 }}>{tuto.title}</h3>
              <button onClick={close} style={{ background:'none',border:'none',fontSize:18,color:'rgba(78,70,63,0.3)',cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:20 }}>
              {tuto.steps.map((s,i) => (
                <div key={i} onClick={()=>setActive(i)} style={{ display:'flex',gap:12,alignItems:'flex-start',padding:'10px 12px',background:i===active?'rgba(210,183,149,0.1)':'transparent',border:`1px solid ${i===active?'rgba(210,183,149,0.3)':'transparent'}`,borderRadius:12,cursor:'pointer' }}>
                  <div style={{ width:32,height:32,borderRadius:10,flexShrink:0,fontSize:15,background:i===active?'rgba(210,183,149,0.2)':'rgba(210,183,149,0.08)',display:'flex',alignItems:'center',justifyContent:'center' }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize:13,fontWeight:700,color:'#4E463F',marginBottom:2 }}>{s.title}</div>
                    <div style={{ fontSize:12,color:'rgba(78,70,63,0.6)',lineHeight:1.5 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={close} style={{ width:'100%',padding:13,borderRadius:12,background:'linear-gradient(135deg,#D2B795,#B89A6A)',border:'none',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer' }}>✓ J'ai compris</button>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Hook onboarding ── */
export function useOnboarding() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      const done = store.get('onboarding_done', false);
      if (!done) setTimeout(() => setShow(true), 1000);
    } catch {}
  }, []);
  const complete = () => {
    try { store.set('onboarding_done', true); } catch {}
    setShow(false);
  };
  return { show, complete };
}
