import { useState, useEffect } from 'react';
import { store } from '../utils/storage';

// ── Tutoriels par app ─────────────────────────────────────────────
export const TUTORIALS = {
  home: {
    title: 'Bienvenue sur Chogan Hub 🌸',
    steps: [
      { icon:'🏠', title:'Page Flux', desc:'Retrouve les annonces de ta marraine et les succès de l\'équipe.' },
      { icon:'⚏',  title:'Page Apps', desc:'Clique sur APPS en bas à droite pour accéder à toutes tes applications.' },
      { icon:'💰', title:'Objectif mensuel', desc:'La barre en haut suit ta progression. Elle se met à jour avec tes ventes.' },
      { icon:'🔑', title:'Quitter sans perdre', desc:'Bouton QUITTER en bas à gauche. Toutes tes données sont sauvegardées automatiquement.' },
    ]
  },
  orders: {
    title: 'Comment faire une commande 🛒',
    steps: [
      { icon:'👤', title:'Renseigne le client', desc:'Entre le prénom, nom, email et téléphone. La fiche client se crée automatiquement.' },
      { icon:'🧴', title:'Ajoute les produits', desc:'Sélectionne les parfums avec leur taille et quantité.' },
      { icon:'💶', title:'Montant et devise', desc:'Saisis le montant en € ou DA. La conversion est automatique.' },
      { icon:'✅', title:'Valider', desc:'La vente est enregistrée, le client créé, la fidélité mise à jour et l\'agenda renseigné !' },
    ]
  },
  ventes: {
    title: 'Gérer tes ventes 💰',
    steps: [
      { icon:'➕', title:'Nouvelle vente', desc:'Bouton + pour saisir une vente rapide.' },
      { icon:'🔍', title:'Recherche', desc:'Retrouve une vente par nom de client ou produit.' },
      { icon:'✏️', title:'Modifier', desc:'Modifie ou supprime une vente via les boutons correspondants.' },
      { icon:'📊', title:'Total automatique', desc:'Le total et le nombre de ventes se calculent automatiquement.' },
    ]
  },
  clients: {
    title: 'Gérer tes clients 👥',
    steps: [
      { icon:'👤', title:'Fiche client', desc:'Coordonnées, historique d\'achats et carte de fidélité.' },
      { icon:'🔍', title:'Recherche rapide', desc:'Trouve un client en quelques lettres.' },
      { icon:'📞', title:'Contacter', desc:'Appuie sur le numéro ou email pour contacter directement.' },
      { icon:'📅', title:'Dernière visite', desc:'La date du dernier achat s\'affiche pour identifier les clients à relancer.' },
    ]
  },
  fidelite: {
    title: 'Programme de fidélité ⭐',
    steps: [
      { icon:'🥉', title:'Niveaux Chogan', desc:'Membre → Bronze → Argent → Or → Platine → Diamant.' },
      { icon:'💎', title:'Calcul automatique', desc:'10 points par euro. Les niveaux se mettent à jour automatiquement.' },
      { icon:'📲', title:'QR Code', desc:'Chaque client a un QR Code pour sa carte de fidélité.' },
      { icon:'🔔', title:'Relances', desc:'Clients inactifs depuis 30 jours à relancer dans l\'onglet Agenda.' },
    ]
  },
  agenda: {
    title: 'Ton agenda 📅',
    steps: [
      { icon:'➕', title:'Ajouter un événement', desc:'Crée des RDV, ateliers, livraisons ou rappels.' },
      { icon:'🏷️', title:'Types d\'événements', desc:'Vente, Livraison, Atelier, Rappel, RDV ou Autre.' },
      { icon:'🔄', title:'Sync automatique', desc:'Les ventes via Commandes apparaissent automatiquement.' },
      { icon:'👁️', title:'Visibilité', desc:'Tu vois tes événements. Ta marraine voit toute l\'équipe.' },
    ]
  },
  stats: {
    title: 'Tes statistiques 📊',
    steps: [
      { icon:'📈', title:'CA du mois', desc:'Ton chiffre d\'affaires mensuel et son évolution.' },
      { icon:'📋', title:'Dashboard', desc:'Vue synthétique : ventes, clients, meilleurs produits.' },
      { icon:'📅', title:'Activité', desc:'Fil chronologique ventes + événements.' },
      { icon:'🔍', title:'Filtres', desc:'Filtre par semaine, mois ou année.' },
    ]
  },
  reseau: {
    title: 'Ton réseau Chogan 🌳',
    steps: [
      { icon:'🌳', title:'Arbre', desc:'Arborescence de l\'équipe avec CA en temps réel.' },
      { icon:'⚙️', title:'Gestion', desc:'Ajoute et réorganise les membres dans l\'onglet Gestion.' },
      { icon:'👥', title:'Équipe', desc:'Performances de chaque consultante : ventes et statut.' },
      { icon:'🏆', title:'Top 5', desc:'Classement des meilleures consultantes du mois.' },
    ]
  },
  formation: {
    title: 'Ta formation 🎓',
    steps: [
      { icon:'📚', title:'Modules', desc:'3 modules : Inscription, La Mallette, La Vente. À compléter dans l\'ordre.' },
      { icon:'💬', title:'Scripts', desc:'Scripts de vente pour chaque situation.' },
      { icon:'📝', title:'Quiz', desc:'Teste tes connaissances avec le quiz Chogan.' },
    ]
  },
  wallet: {
    title: 'Wallet Chogan 💼',
    steps: [
      { icon:'💰', title:'Accès VIP', desc:'Accessible uniquement sur autorisation de l\'administratrice.' },
      { icon:'📊', title:'Suivi financier', desc:'Revenus, commissions et objectifs en détail.' },
      { icon:'🔒', title:'Sécurisé', desc:'Tes données financières sont protégées.' },
    ]
  },
};

// ── Onboarding (première connexion) ──────────────────────────────
export function OnboardingTutorial({ onDone }) {
  const [step, setStep] = useState(0);
  const steps = TUTORIALS.home.steps;
  const isLast = step === steps.length - 1;

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(78,70,63,0.7)',
      display:'flex', alignItems:'flex-end', justifyContent:'center',
      backdropFilter:'blur(4px)',
    }}>
      <div style={{
        width:'100%', maxWidth:480,
        background:'#fff',
        borderRadius:'24px 24px 0 0',
        padding:'28px 24px 44px',
        animation:'slideUp 0.3s ease',
      }}>
        {/* Barre progression */}
        <div style={{ display:'flex', gap:6, marginBottom:24 }}>
          {steps.map((_,i) => (
            <div key={i} style={{
              flex:1, height:3, borderRadius:2,
              background: i<=step ? 'linear-gradient(90deg,#D2B795,#B89A6A)' : 'rgba(210,183,149,0.2)',
              transition:'background 0.3s',
            }}/>
          ))}
        </div>
        {/* Contenu */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{
            width:72, height:72, borderRadius:20, margin:'0 auto 16px',
            background:'rgba(210,183,149,0.15)', border:'1.5px solid rgba(210,183,149,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:32,
          }}>{steps[step].icon}</div>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, color:'#4E463F', marginBottom:10, fontWeight:600 }}>
            {steps[step].title}
          </h2>
          <p style={{ fontSize:14, color:'rgba(78,70,63,0.65)', lineHeight:1.7, maxWidth:320, margin:'0 auto' }}>
            {steps[step].desc}
          </p>
        </div>
        {/* Boutons */}
        <div style={{ display:'flex', gap:10 }}>
          {step > 0 && (
            <button onClick={() => setStep(s=>s-1)} style={{
              flex:1, padding:13, borderRadius:12, background:'transparent',
              border:'1px solid rgba(210,183,149,0.3)', color:'rgba(78,70,63,0.6)',
              fontSize:13, fontWeight:600, cursor:'pointer',
            }}>← Précédent</button>
          )}
          <button onClick={() => isLast ? onDone() : setStep(s=>s+1)} style={{
            flex:2, padding:13, borderRadius:12,
            background:'linear-gradient(135deg,#D2B795,#B89A6A)',
            border:'none', color:'#fff', fontSize:13, fontWeight:700,
            letterSpacing:'0.06em', cursor:'pointer',
            boxShadow:'0 4px 16px rgba(184,154,106,0.3)',
          }}>{isLast ? '✓ Commencer' : 'Suivant →'}</button>
        </div>
        <button onClick={onDone} style={{
          display:'block', margin:'14px auto 0', background:'none',
          border:'none', fontSize:12, color:'rgba(78,70,63,0.35)', cursor:'pointer',
        }}>Passer le tutoriel</button>
      </div>
    </div>
  );
}

// ── Bouton aide ? (TOUS les hooks AVANT tout return) ──────────────
export function HelpButton({ appId }) {
  const [open, setOpen] = useState(false);  // ← hook TOUJOURS en premier
  const [step, setStep] = useState(0);       // ← hook TOUJOURS en premier

  const tuto = TUTORIALS[appId];
  if (!tuto) return null;                    // ← return conditionnel APRÈS les hooks

  const close = () => { setOpen(false); setStep(0); };

  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        width:32, height:32, borderRadius:16,
        background:'rgba(210,183,149,0.15)',
        border:'1.5px solid rgba(210,183,149,0.4)',
        color:'#B89A6A', fontSize:14, fontWeight:700,
        display:'flex', alignItems:'center', justifyContent:'center',
        cursor:'pointer', flexShrink:0,
      }}>?</button>

      {open && (
        <div style={{
          position:'fixed', inset:0, zIndex:500,
          background:'rgba(78,70,63,0.6)',
          display:'flex', alignItems:'flex-end', justifyContent:'center',
          backdropFilter:'blur(3px)',
        }} onClick={close}>
          <div style={{
            width:'100%', maxWidth:480, background:'#fff',
            borderRadius:'24px 24px 0 0', padding:'24px 20px 40px',
            animation:'slideUp 0.25s ease',
          }} onClick={e=>e.stopPropagation()}>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:18, color:'#4E463F', fontWeight:600 }}>
                {tuto.title}
              </h3>
              <button onClick={close} style={{ background:'none', border:'none', fontSize:18, color:'rgba(78,70,63,0.3)', cursor:'pointer' }}>✕</button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
              {tuto.steps.map((s,i) => (
                <div key={i} onClick={() => setStep(i)} style={{
                  display:'flex', gap:12, alignItems:'flex-start', padding:'11px 12px',
                  background: i===step ? 'rgba(210,183,149,0.1)' : 'transparent',
                  border:`1px solid ${i===step ? 'rgba(210,183,149,0.3)' : 'transparent'}`,
                  borderRadius:12, cursor:'pointer', transition:'all 0.15s',
                }}>
                  <div style={{
                    width:34, height:34, borderRadius:10, flexShrink:0, fontSize:16,
                    background: i===step ? 'rgba(210,183,149,0.2)' : 'rgba(210,183,149,0.08)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#4E463F', marginBottom:2 }}>{s.title}</div>
                    <div style={{ fontSize:12, color:'rgba(78,70,63,0.6)', lineHeight:1.5 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={close} style={{
              width:'100%', padding:13, borderRadius:12,
              background:'linear-gradient(135deg,#D2B795,#B89A6A)',
              border:'none', color:'#fff', fontSize:13, fontWeight:700,
              letterSpacing:'0.06em', cursor:'pointer',
            }}>✓ J'ai compris</button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Hook onboarding ───────────────────────────────────────────────
export function useOnboarding() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const done = store.get('onboarding_done', false);
    if (!done) setTimeout(() => setShow(true), 800);
  }, []);
  const complete = () => { store.set('onboarding_done', true); setShow(false); };
  return { show, complete };
}
