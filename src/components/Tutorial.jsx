import { useState, useEffect } from 'react';
import { store } from '../utils/storage';

// ── Tutoriels par app ─────────────────────────────────────────────
export const TUTORIALS = {
  home: {
    title: 'Bienvenue sur Chogan Hub 🌸',
    steps: [
      { icon:'🏠', title:'Page Flux', desc:'Ici tu retrouves les annonces de ta marraine et les succès de l\'équipe. Reste informée en temps réel !' },
      { icon:'⚏',  title:'Page Apps', desc:'Clique sur le bouton APPS en bas à droite pour accéder à toutes tes applications.' },
      { icon:'💰', title:'Ton objectif mensuel', desc:'La barre en haut indique ta progression vers ton objectif du mois. Elle se met à jour automatiquement avec tes ventes.' },
      { icon:'🔑', title:'Quitter sans perdre', desc:'Le bouton QUITTER en bas à gauche te déconnecte. Toutes tes données sont sauvegardées automatiquement dans le cloud.' },
    ]
  },
  orders: {
    title: 'Comment faire une commande 🛒',
    steps: [
      { icon:'👤', title:'Renseigne le client', desc:'Entre le prénom et nom de ton client, son email et son téléphone pour créer sa fiche automatiquement.' },
      { icon:'🧴', title:'Ajoute les produits', desc:'Sélectionne les parfums commandés avec leur taille (15ml, 30ml, 70ml) et quantité.' },
      { icon:'💶', title:'Montant et devise', desc:'Saisis le montant total en € ou DA. Le taux de conversion est appliqué automatiquement.' },
      { icon:'✅', title:'Valider', desc:'En validant, la vente est enregistrée, la fiche client créée, la fidélité mise à jour et un événement ajouté à ton agenda !' },
    ]
  },
  ventes: {
    title: 'Gérer tes ventes 💰',
    steps: [
      { icon:'➕', title:'Nouvelle vente', desc:'Appuie sur le bouton + pour saisir une vente rapide sans bon de commande complet.' },
      { icon:'🔍', title:'Recherche', desc:'Utilise la barre de recherche pour retrouver une vente par nom de client ou produit.' },
      { icon:'✏️', title:'Modifier', desc:'Tu peux modifier ou supprimer une vente en appuyant sur les boutons correspondants.' },
      { icon:'📊', title:'Total automatique', desc:'Le total en € et en DA et le nombre de ventes se calculent automatiquement en haut.' },
    ]
  },
  clients: {
    title: 'Gérer tes clients 👥',
    steps: [
      { icon:'👤', title:'Fiche client', desc:'Chaque client a une fiche avec ses coordonnées, son historique d\'achats et sa carte de fidélité.' },
      { icon:'🔍', title:'Recherche rapide', desc:'Trouve un client en quelques lettres grâce à la barre de recherche.' },
      { icon:'📞', title:'Contacter', desc:'Appuie sur le numéro ou l\'email d\'un client pour le contacter directement depuis ton téléphone.' },
      { icon:'📅', title:'Dernière visite', desc:'La date du dernier achat s\'affiche pour identifier les clients à relancer.' },
    ]
  },
  fidelite: {
    title: 'Programme de fidélité ⭐',
    steps: [
      { icon:'🥉', title:'Niveaux Chogan', desc:'Membre → Bronze → Argent → Or → Platine → Diamant. Les points s\'accumulent à chaque achat.' },
      { icon:'💎', title:'Calcul automatique', desc:'10 points par euro dépensé. Les niveaux se mettent à jour automatiquement.' },
      { icon:'📲', title:'QR Code', desc:'Chaque client a un QR Code personnel pour accéder à sa carte de fidélité.' },
      { icon:'🔔', title:'Relances', desc:'L\'onglet Agenda te montre les clients inactifs depuis plus de 30 jours à relancer.' },
    ]
  },
  agenda: {
    title: 'Ton agenda 📅',
    steps: [
      { icon:'➕', title:'Ajouter un événement', desc:'Crée des rendez-vous, ateliers parfums, livraisons ou rappels directement dans l\'agenda.' },
      { icon:'🏷️', title:'Types d\'événements', desc:'Choisis parmi : Vente, Livraison, Atelier, Rappel, RDV ou Autre.' },
      { icon:'🔄', title:'Sync automatique', desc:'Les ventes créées via Commandes apparaissent automatiquement dans ton agenda.' },
      { icon:'👁️', title:'Visibilité', desc:'Tu ne vois que tes propres événements. Ta marraine voit ceux de toute l\'équipe.' },
    ]
  },
  stats: {
    title: 'Tes statistiques 📊',
    steps: [
      { icon:'📈', title:'CA du mois', desc:'Visualise ton chiffre d\'affaires mensuel et son évolution par rapport au mois précédent.' },
      { icon:'📋', title:'Dashboard', desc:'Vue synthétique : nombre de ventes, clients, meilleurs produits et performances.' },
      { icon:'📅', title:'Activité', desc:'Fil chronologique fusionnant ventes et événements pour voir ton activité complète.' },
      { icon:'🔍', title:'Filtres', desc:'Filtre par période pour analyser une semaine, un mois ou une année.' },
    ]
  },
  reseau: {
    title: 'Ton réseau Chogan 🌳',
    steps: [
      { icon:'🌳', title:'Arbre', desc:'Visualise l\'arborescence de ton équipe avec le CA de chaque consultante en temps réel.' },
      { icon:'⚙️', title:'Gestion', desc:'Ajoute, modifie ou réorganise les membres de ton réseau dans l\'onglet Gestion.' },
      { icon:'👥', title:'Équipe', desc:'Vois les performances de chaque consultante : ventes du mois, statut actif/inactif.' },
      { icon:'🏆', title:'Top 5', desc:'Le classement des meilleures consultantes du mois s\'affiche automatiquement.' },
    ]
  },
  formation: {
    title: 'Ta formation 🎓',
    steps: [
      { icon:'📚', title:'Modules', desc:'3 modules essentiels : Inscription, La Mallette et La Vente. À compléter dans l\'ordre.' },
      { icon:'💬', title:'Scripts', desc:'Des scripts de vente prêts à l\'emploi pour chaque situation : atelier, parrainage, objections.' },
      { icon:'📝', title:'Quiz', desc:'Teste tes connaissances avec le quiz Chogan. 5 questions sur les produits et techniques.' },
      { icon:'🔗', title:'Accès', desc:'Les modules s\'ouvrent dans un nouvel onglet. Clique sur le lien pour visionner.' },
    ]
  },
  wallet: {
    title: 'Wallet Chogan 💼',
    steps: [
      { icon:'💰', title:'Accès VIP', desc:'Cette application est accessible uniquement sur autorisation de l\'administratrice.' },
      { icon:'📊', title:'Suivi financier', desc:'Suis tes revenus, commissions et objectifs financiers en détail.' },
      { icon:'🔒', title:'Sécurisé', desc:'Tes données financières sont protégées et accessibles uniquement par toi.' },
    ]
  },
};

// ── Composant Tutoriel Onboarding (première connexion) ────────────
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
        padding:'28px 24px 40px',
        animation:'slideUp 0.3s ease',
      }}>
        {/* Barre de progression */}
        <div style={{ display:'flex', gap:6, marginBottom:24 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              flex:1, height:3, borderRadius:2,
              background: i <= step ? 'linear-gradient(90deg,#D2B795,#B89A6A)' : 'rgba(210,183,149,0.2)',
              transition:'background 0.3s',
            }} />
          ))}
        </div>

        {/* Contenu */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{
            width:72, height:72, borderRadius:20,
            background:'linear-gradient(135deg,rgba(210,183,149,0.15),rgba(184,154,106,0.2))',
            border:'1.5px solid rgba(210,183,149,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:32, margin:'0 auto 16px',
          }}>
            {steps[step].icon}
          </div>
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
            <button onClick={() => setStep(s => s-1)} style={{
              flex:1, padding:'13px', borderRadius:12,
              background:'transparent', border:'1px solid rgba(210,183,149,0.3)',
              color:'rgba(78,70,63,0.6)', fontSize:13, fontWeight:600, cursor:'pointer',
            }}>← Précédent</button>
          )}
          <button onClick={() => isLast ? onDone() : setStep(s => s+1)} style={{
            flex:2, padding:'13px', borderRadius:12,
            background:'linear-gradient(135deg,#D2B795,#B89A6A)',
            border:'none', color:'#fff', fontSize:13, fontWeight:700,
            letterSpacing:'0.06em', cursor:'pointer',
            boxShadow:'0 4px 16px rgba(184,154,106,0.3)',
          }}>
            {isLast ? '✓ Commencer' : 'Suivant →'}
          </button>
        </div>

        <button onClick={onDone} style={{
          display:'block', margin:'14px auto 0',
          background:'none', border:'none', fontSize:12,
          color:'rgba(78,70,63,0.35)', cursor:'pointer',
        }}>Passer le tutoriel</button>
      </div>
    </div>
  );
}

// ── Bouton d'aide contextuelle (?) dans chaque app ────────────────
export function HelpButton({ appId }) {
  const [open, setOpen] = useState(false);
  const tuto = TUTORIALS[appId];
  if (!tuto) return null;
  const [step, setStep] = useState(0);

  const close = () => { setOpen(false); setStep(0); };

  return (
    <>
      {/* Bouton ? */}
      <button
        onClick={() => setOpen(true)}
        style={{
          width:32, height:32, borderRadius:50,
          background:'rgba(210,183,149,0.15)',
          border:'1.5px solid rgba(210,183,149,0.4)',
          color:'#B89A6A', fontSize:14, fontWeight:700,
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', flexShrink:0,
        }}
        title="Aide"
      >?</button>

      {/* Modal aide */}
      {open && (
        <div style={{
          position:'fixed', inset:0, zIndex:500,
          background:'rgba(78,70,63,0.6)',
          display:'flex', alignItems:'flex-end', justifyContent:'center',
          backdropFilter:'blur(3px)',
        }} onClick={close}>
          <div
            style={{
              width:'100%', maxWidth:480,
              background:'#fff',
              borderRadius:'24px 24px 0 0',
              padding:'24px 20px 36px',
              animation:'slideUp 0.25s ease',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:18, color:'#4E463F', fontWeight:600 }}>
                {tuto.title}
              </h3>
              <button onClick={close} style={{ background:'none', border:'none', fontSize:18, color:'rgba(78,70,63,0.3)', cursor:'pointer' }}>✕</button>
            </div>

            {/* Étapes */}
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
              {tuto.steps.map((s, i) => (
                <div key={i} style={{
                  display:'flex', gap:14, alignItems:'flex-start',
                  padding:'12px 14px',
                  background: i === step ? 'rgba(210,183,149,0.1)' : 'transparent',
                  border:`1px solid ${i === step ? 'rgba(210,183,149,0.3)' : 'transparent'}`,
                  borderRadius:12,
                  cursor:'pointer',
                  transition:'all 0.2s',
                }} onClick={() => setStep(i)}>
                  <div style={{
                    width:36, height:36, borderRadius:10, flexShrink:0,
                    background: i === step ? 'linear-gradient(135deg,rgba(210,183,149,0.2),rgba(184,154,106,0.25))' : 'rgba(210,183,149,0.08)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:18,
                  }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#4E463F', marginBottom:3 }}>{s.title}</div>
                    <div style={{ fontSize:12, color:'rgba(78,70,63,0.6)', lineHeight:1.6 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={close} style={{
              width:'100%', padding:'13px',
              background:'linear-gradient(135deg,#D2B795,#B89A6A)',
              border:'none', borderRadius:12,
              color:'#fff', fontSize:13, fontWeight:700,
              letterSpacing:'0.06em', cursor:'pointer',
            }}>
              ✓ J'ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Hook : afficher l'onboarding à la première connexion ──────────
export function useOnboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const done = store.get('onboarding_done', false);
    if (!done) {
      setTimeout(() => setShow(true), 800);
    }
  }, []);

  const complete = () => {
    store.set('onboarding_done', true);
    setShow(false);
  };

  return { show, complete };
}
