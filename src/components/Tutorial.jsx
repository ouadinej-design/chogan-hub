import { useState, useEffect } from 'react';

// ── Tutoriels par app ──────────────────────────────────────────────
export const TUTORIALS = {
  home: [
    { icon:'🏠', title:'Votre espace d\'accueil', text:'C\'est ici que vous retrouvez les annonces de votre marraine et les succès de l\'équipe. Tout est en temps réel !' },
    { icon:'⚏',  title:'Accéder aux applications', text:'Appuyez sur le bouton APPS en bas à droite pour voir toutes vos applications organisées par catégorie.' },
    { icon:'💰', title:'Votre objectif mensuel', text:'La barre en haut indique votre progression vers l\'objectif de 500 € ce mois-ci. Elle se met à jour automatiquement.' },
    { icon:'🌟', title:'Vos points', text:'Chaque euro de vente = 10 points. Les points s\'accumulent et reflètent votre activité globale.' },
    { icon:'⎋',  title:'Quitter en sécurité', text:'Le bouton QUITTER en bas à gauche vous déconnecte. Vos données sont sauvegardées automatiquement avant de partir.' },
  ],
  orders: [
    { icon:'🛒', title:'Créer un bon de commande', text:'Remplissez le nom du client, les produits et le montant. Tout le reste se crée automatiquement !' },
    { icon:'✨', title:'Magie automatique', text:'Quand vous validez une commande : la fiche client est créée, la carte fidélité mise à jour, et un événement apparaît dans votre agenda.' },
    { icon:'💱', title:'Devise €  ou DA', text:'Choisissez € pour l\'Europe ou DA pour l\'Algérie. La conversion est automatique pour les statistiques.' },
    { icon:'📋', title:'Historique des commandes', text:'Retrouvez toutes vos commandes passées dans l\'onglet Ventes. Vous pouvez les modifier ou les supprimer.' },
  ],
  ventes: [
    { icon:'💰', title:'Suivre votre CA', text:'Cette page affiche tout votre chiffre d\'affaires. Le total en haut se met à jour en temps réel.' },
    { icon:'➕', title:'Ajouter une vente', text:'Appuyez sur le bouton + pour saisir une nouvelle vente manuellement (si vous n\'utilisez pas Commandes).' },
    { icon:'🔍', title:'Rechercher', text:'La barre de recherche vous permet de retrouver une vente par nom de client ou produit.' },
    { icon:'✏️', title:'Modifier ou supprimer', text:'Appuyez sur Modifier pour corriger une vente, ou Supprimer pour l\'effacer définitivement.' },
  ],
  clients: [
    { icon:'👥', title:'Votre carnet de clients', text:'Toutes vos clientes sont ici avec leur historique d\'achats, email et téléphone.' },
    { icon:'🔄', title:'Mis à jour automatiquement', text:'Quand vous créez une commande, la fiche client se crée ou se met à jour automatiquement. Rien à faire !' },
    { icon:'📞', title:'Contacter une cliente', text:'Appuyez sur le numéro ou l\'email d\'une cliente pour la contacter directement depuis l\'app.' },
    { icon:'🎯', title:'Clientes à relancer', text:'Dans l\'onglet Fidélité → Agenda, retrouvez les clientes inactives depuis plus de 30 jours à relancer.' },
  ],
  fidelite: [
    { icon:'⭐', title:'Programme fidélité Chogan', text:'6 niveaux : Membre → Bronze → Argent → Or → Platine → Diamant. Plus une cliente achète, plus elle monte !' },
    { icon:'🧮', title:'Calcul automatique', text:'Les points se calculent automatiquement à chaque vente. 10 pts par euro d\'achat.' },
    { icon:'📱', title:'QR Code client', text:'Chaque cliente a un QR code unique. Elle peut le scanner pour voir sa carte de fidélité.' },
    { icon:'🔔', title:'Notifications de niveau', text:'Vous êtes notifiée quand une cliente change de niveau pour pouvoir la féliciter !' },
  ],
  agenda: [
    { icon:'📅', title:'Votre agenda personnel', text:'Notez tous vos rendez-vous, ateliers parfum, événements Chogan. Visible uniquement par vous (et votre marraine).' },
    { icon:'🎯', title:'Types d\'événements', text:'Différents types : Vente, RDV client, Atelier, Formation, Perso. Chacun a sa couleur.' },
    { icon:'🔔', title:'Rappels automatiques', text:'Les événements du jour apparaissent en priorité. Vous ne raterez plus aucun rendez-vous !' },
    { icon:'📊', title:'Lien avec les ventes', text:'Quand vous faites une commande, un événement "Vente" est automatiquement créé dans votre agenda.' },
  ],
  planner: [
    { icon:'🗓', title:'Votre planificateur', text:'Organisez vos semaines à l\'avance. Planifiez vos objectifs, vos appels, vos ateliers.' },
    { icon:'✅', title:'Cocher les tâches', text:'Marquez vos tâches comme accomplies pour suivre votre progression quotidienne.' },
    { icon:'🎯', title:'Objectifs hebdomadaires', text:'Définissez vos objectifs de la semaine : nombre de contacts, ventes visées, formations à faire.' },
  ],
  stats: [
    { icon:'📊', title:'Vos statistiques complètes', text:'Vue globale de votre activité : CA par mois, nombre de ventes, évolution, top produits.' },
    { icon:'📅', title:'Onglet Activité', text:'Le fil chronologique de toutes vos ventes et événements. Votre journal d\'activité.' },
    { icon:'📈', title:'Évolution mensuelle', text:'Le graphique montre votre progression mois par mois. Idéal pour voir votre croissance !' },
  ],
  reseau: [
    { icon:'🌳', title:'Votre arbre Chogan', text:'Visualisez votre réseau en arbre : vous au centre, vos filleuls en dessous. Le CA de chacun s\'affiche.' },
    { icon:'👥', title:'Onglet Équipe', text:'Vue liste de votre équipe avec les stats de chacune : ventes, CA du mois, statut actif/inactif.' },
    { icon:'⚙️', title:'Gérer le réseau', text:'Dans Gestion, ajoutez ou retirez des membres de votre réseau pour maintenir l\'arbre à jour.' },
  ],
  formation: [
    { icon:'🎓', title:'Votre académie Chogan', text:'3 modules essentiels pour démarrer : Inscription, La Mallette, La Vente. Faites-les dans l\'ordre !' },
    { icon:'💬', title:'Scripts de vente', text:'Des scripts prêts à l\'emploi pour chaque situation : présentation produit, objections, closing.' },
    { icon:'📝', title:'Quiz de validation', text:'Testez vos connaissances avec le quiz. 5 questions sur les familles olfactives et les techniques de vente.' },
  ],
  wallet: [
    { icon:'💼', title:'Votre portefeuille Chogan', text:'Suivez vos revenus, commissions et dépenses liés à votre activité Chogan.' },
    { icon:'📊', title:'Bilan financier', text:'Vue claire de vos entrées et sorties. Idéal pour déclarer vos revenus ou préparer votre bilan.' },
    { icon:'🔐', title:'Accès VIP', text:'Cette application est accessible uniquement sur autorisation de votre administratrice.' },
  ],
};

// ── Composant Tutoriel ─────────────────────────────────────────────
export default function Tutorial({ appId, onClose }) {
  const steps = TUTORIALS[appId] || [];
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  if (!steps.length) return null;

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(78,70,63,0.6)',
      backdropFilter:'blur(4px)',
      display:'flex', alignItems:'flex-end', justifyContent:'center',
      padding:'0 0 24px',
    }}>
      <div style={{
        width:'100%', maxWidth:480,
        background:'#FDFAF7',
        borderRadius:'24px 24px 0 0',
        padding:'28px 24px 32px',
        animation:'slideUp 0.3s ease',
        position:'relative',
      }}>
        {/* Barre de progression */}
        <div style={{ display:'flex', gap:4, marginBottom:24 }}>
          {steps.map((_,i) => (
            <div key={i} style={{
              flex:1, height:3, borderRadius:2,
              background: i <= step ? 'linear-gradient(90deg,#D2B795,#B89A6A)' : 'rgba(210,183,149,0.25)',
              transition:'background 0.3s',
            }} />
          ))}
        </div>

        {/* Icône */}
        <div style={{
          width:64, height:64, borderRadius:20,
          background:'linear-gradient(135deg,rgba(210,183,149,0.2),rgba(184,154,106,0.15))',
          border:'1.5px solid rgba(210,183,149,0.3)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:30, marginBottom:18,
        }}>{current.icon}</div>

        {/* Contenu */}
        <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, fontWeight:600, color:'#4E463F', marginBottom:10, lineHeight:1.2 }}>
          {current.title}
        </div>
        <div style={{ fontSize:14, color:'rgba(78,70,63,0.7)', lineHeight:1.8, marginBottom:28 }}>
          {current.text}
        </div>

        {/* Compteur */}
        <div style={{ fontSize:11, color:'rgba(78,70,63,0.4)', letterSpacing:'0.1em', marginBottom:20, textAlign:'center' }}>
          {step + 1} / {steps.length}
        </div>

        {/* Boutons */}
        <div style={{ display:'flex', gap:10 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s-1)} style={{
              flex:1, padding:'13px', borderRadius:12,
              background:'rgba(210,183,149,0.15)', border:'1px solid rgba(210,183,149,0.3)',
              color:'#B89A6A', fontSize:13, fontWeight:700, cursor:'pointer',
            }}>← Précédent</button>
          )}
          {!isLast ? (
            <button onClick={() => setStep(s => s+1)} style={{
              flex:2, padding:'13px', borderRadius:12,
              background:'linear-gradient(135deg,#D2B795,#B89A6A)',
              border:'none', color:'#fff',
              fontSize:13, fontWeight:700, letterSpacing:'0.06em', cursor:'pointer',
              boxShadow:'0 4px 16px rgba(184,154,106,0.3)',
            }}>SUIVANT →</button>
          ) : (
            <button onClick={onClose} style={{
              flex:2, padding:'13px', borderRadius:12,
              background:'linear-gradient(135deg,#4E463F,#2E2822)',
              border:'none', color:'#fff',
              fontSize:13, fontWeight:700, letterSpacing:'0.06em', cursor:'pointer',
              boxShadow:'0 4px 16px rgba(78,70,63,0.3)',
            }}>✓ COMMENCER</button>
          )}
          <button onClick={onClose} style={{
            padding:'13px 14px', borderRadius:12,
            background:'none', border:'1px solid rgba(210,183,149,0.3)',
            color:'rgba(78,70,63,0.4)', fontSize:12, cursor:'pointer',
          }}>Passer</button>
        </div>
      </div>
    </div>
  );
}

// ── Hook pour gérer l'affichage automatique ────────────────────────
export function useTutorial(appId) {
  const key = `chogan_tuto_${appId}`;
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Afficher au 1er accès seulement
    const seen = localStorage.getItem(key);
    if (!seen) {
      setTimeout(() => setShow(true), 600); // petit délai pour que la page charge
    }
  }, [key]);

  const close = () => {
    localStorage.setItem(key, '1');
    setShow(false);
  };

  const reset = () => {
    localStorage.removeItem(key);
    setShow(true);
  };

  return { show, close, reset };
}
