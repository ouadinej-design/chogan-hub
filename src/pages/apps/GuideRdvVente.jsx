import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { FAMILLES, PERFUMES } from '../../utils/choganData';

// ─────────────────────────────────────────────────────────────────
// DONNÉES MÉTIER
// ─────────────────────────────────────────────────────────────────

const SONCAS_DATA = [
  { id:'S', label:'Sécurité',   emoji:'🛡️', couleur:'#3d6b9e',
    desc:"La cliente a besoin d'être rassurée. Elle craint de se tromper, de perdre son argent.",
    arguments:["Qualité Made in Italy certifiée","Satisfaction garantie ou remboursée","Des milliers de clientes fidèles","Composition contrôlée, sans allergènes majeurs"],
    questions:["Qu'est-ce qui est important pour vous dans un parfum ?","Avez-vous déjà eu une mauvaise expérience avec un parfum ?","Qu'est-ce qui vous rassurerait pour passer commande ?"] },
  { id:'O', label:'Orgueil',    emoji:'👑', couleur:'#9e7a3d',
    desc:"La cliente veut se sentir unique, valorisée, appartenir à une élite.",
    arguments:["Qualité identique aux grandes maisons (Dior, Chanel…) à prix accessible","Vous faites partie d'un cercle privilégié","Nos parfums ne se trouvent pas en grande surface","Vous serez celle qui aura trouvé la perle rare"],
    questions:["Qu'est-ce qui vous différencie des autres selon vous ?","Aimez-vous les choses exclusives ?","Quelle image souhaitez-vous donner ?"] },
  { id:'N', label:'Nouveauté',  emoji:'✨', couleur:'#9e5a7a',
    desc:"La cliente aime la nouveauté, les tendances, découvrir avant les autres.",
    arguments:["Nouvelles références chaque saison","Collection exclusive non disponible partout","Les dernières tendances olfactives de niche","Vous serez la première à le porter"],
    questions:["Aimez-vous découvrir de nouvelles choses ?","Suivez-vous les tendances en parfumerie ?","Qu'est-ce qui vous attire dans le fait d'essayer quelque chose de nouveau ?"] },
  { id:'C', label:'Confort',    emoji:'🛋️', couleur:'#4a7c59',
    desc:"La cliente veut simplicité, praticité, sans effort. Elle apprécie le service.",
    arguments:["Livraison à domicile sans se déplacer","Commande en quelques clics","Je gère tout pour vous","Paiement simple et rapide"],
    questions:["Qu'est-ce qui vous faciliterait la vie ?","Comment préférez-vous faire vos achats ?","Aimez-vous que quelqu'un s'occupe de tout pour vous ?"] },
  { id:'A', label:'Argent',     emoji:'💰', couleur:'#5a8a5a',
    desc:"La cliente est sensible au rapport qualité/prix, aux économies, aux offres.",
    arguments:["Jusqu'à 80% moins cher qu'un parfum de luxe comparable","70ml pour le prix d'un 30ml en boutique","Programme fidélité : chaque achat rapporte des points","Offres groupées avantageuses"],
    questions:["Quel budget avez-vous en tête ?","Est-ce que le rapport qualité/prix est important pour vous ?","Vous aimez faire de bonnes affaires ?"] },
  { id:'S2', label:'Sympathie', emoji:'🤝', couleur:'#c97c3a',
    desc:"La cliente achète parce qu'elle vous fait confiance, elle vous apprécie.",
    arguments:["Je vous le conseille personnellement","Je porte ce parfum moi-même","Je suis là pour vous accompagner, même après la commande","Mes clientes reviennent toujours vers moi"],
    questions:["Qu'est-ce qui vous a donné envie qu'on se rencontre ?","Comment vous sentez-vous par rapport à notre échange ?","Avez-vous des questions sur moi ou sur mon activité ?"] },
];

const TECHNIQUES_DATA = [
  { id:'reformulation', label:'Reformulation', emoji:'🔄',
    desc:"Répétez les mots de la cliente pour lui montrer que vous l'avez bien compris.",
    exemple:"« Si je comprends bien, vous cherchez un parfum qui dure longtemps et qui vous donne confiance en vous, c'est bien ça ? »",
    quand:"Après qu'elle a exprimé un besoin ou une préférence." },
  { id:'silence', label:'Silence', emoji:'🤫',
    desc:"Après votre argument ou votre proposition, taisez-vous. Laissez le silence travailler.",
    exemple:"« Ce parfum est inspiré d'Angel de Thierry Mugler, à 9€ au lieu de 90€… » [silence]",
    quand:"Après une proposition de prix ou un argument fort. Ne remplissez pas le vide !" },
  { id:'benefice', label:'Bénéfice client', emoji:'💡',
    desc:"Ne parlez pas du produit, parlez de ce que la cliente va RESSENTIR ou GAGNER.",
    exemple:"Pas « Ce parfum a des notes de vanille » → mais « Vous allez sentir ce sillage doux qui fait se retourner les gens sur vous »",
    quand:"À chaque présentation produit. Toujours traduire la caractéristique en bénéfice." },
  { id:'urgence', label:'Urgence douce', emoji:'⏰',
    desc:"Créez un sentiment d'opportunité limitée, sans pression excessive.",
    exemple:"« On a quelques unités disponibles en ce moment » ou « Cette offre se termine en fin de mois »",
    quand:"Quand la cliente hésite, pour la faire passer à l'action naturellement." },
  { id:'preuve', label:'Preuve sociale', emoji:'⭐',
    desc:"Mentionnez que d'autres personnes ont déjà acheté et sont satisfaites.",
    exemple:"« Ma cliente Marie a pris ce même parfum il y a 3 mois, elle vient d'en recommander deux » ou « C'est notre best-seller »",
    quand:"Face aux doutes ou à l'hésitation. La cliente se rassure en sachant qu'elle n'est pas seule." },
];

const SOC_TEMPLATES = [
  { id:'amie', label:'🤝 Amie / Proche', type:'amie',
    situation:"[Prénom], on est amies, je sais que tu es sensible aux belles choses.",
    obstacle:"Mais je sais aussi qu'avec tous les parfums en grande surface, difficile de trouver quelque chose d'unique qui tient vraiment.",
    consequence:"Résultat, on finit par avoir les mêmes parfums que tout le monde, et ça coûte une fortune.",
    solution:"Ce que je te propose, c'est de découvrir les parfums Chogan : qualité luxe, à petit prix, et exclusifs." },
  { id:'collegue', label:'💼 Collègue', type:'collegue',
    situation:"On travaille ensemble, et je sais que l'image professionnelle compte pour toi.",
    obstacle:"Mais trouver un parfum discret le matin et qui reste présent toute la journée, c'est pas évident.",
    consequence:"Alors on se retrouve à mettre trop de parfum ou à en changer souvent.",
    solution:"Avec Chogan, la concentration est élevée : quelques sprays le matin et ça tient jusqu'au soir." },
  { id:'rencontre', label:'🌸 Nouvelle rencontre', type:'rencontre',
    situation:"On vient juste de se rencontrer, et je veux être directe avec toi.",
    obstacle:"Souvent quand on parle de parfums ou de cosmétiques, les gens imaginent tout de suite quelque chose de cher ou de compliqué.",
    consequence:"Alors ils passent à côté de quelque chose d'exceptionnel par peur de se tromper.",
    solution:"Je vais juste te montrer 2-3 fragrances, tu me dis ce qui te correspond, et tu décides en toute liberté." },
  { id:'rdv_olfactif', label:'👃 RDV Olfactif', type:'rdv_olfactif',
    situation:"Je t'ai invitée aujourd'hui pour qu'on explore ensemble ce qui te correspond.",
    obstacle:"Le problème avec les parfums classiques, c'est qu'on achète souvent sur le coup, sans vraiment réfléchir à ce qu'on veut.",
    consequence:"Et on se retrouve avec des parfums qu'on n'utilise plus au bout de 3 semaines.",
    solution:"Aujourd'hui, on va prendre le temps de trouver TA fragrance signature, celle qui te ressemble vraiment." },
];

const VAMP_PROFILS = [
  { id:'v', label:'Valeurs', emoji:'💎', couleur:'#9e7a3d',
    desc:"Ce qui compte profondément pour elle (famille, élégance, authenticité, nature...)",
    questions:["Qu'est-ce qui est important pour vous dans votre quotidien ?","Quelles valeurs vous guident dans vos choix ?","Qu'est-ce qui vous rend fière ?"],
    familles_suggerees:['fleurie','ambree','boisee'] },
  { id:'a', label:'Ambitions', emoji:'🚀', couleur:'#4a7c59',
    desc:"Ce qu'elle aspire à être ou à atteindre (carrière, image, lifestyle...)",
    questions:["Où vous voyez-vous dans 2 ans ?","Quel style de vie vous inspire ?","Quelle image souhaitez-vous projeter ?"],
    familles_suggerees:['boisee','chypree','aromatique'] },
  { id:'m', label:'Motivations', emoji:'💡', couleur:'#3d6b9e',
    desc:"Ce qui la fait agir aujourd'hui (événement, occasion, envie de changement...)",
    questions:["Qu'est-ce qui vous a donné envie de me rencontrer aujourd'hui ?","Y a-t-il un événement particulier pour lequel vous cherchez un parfum ?","Qu'est-ce qui vous a poussée à changer de parfum ?"],
    familles_suggerees:['hesperidee','fleurie','ambree'] },
  { id:'p', label:'Problèmes', emoji:'🎯', couleur:'#8a4d4d',
    desc:"Ses frustrations avec ses parfums actuels (tenue, prix, originalité...)",
    questions:["Qu'est-ce qui ne vous satisfait pas dans vos parfums actuels ?","Qu'est-ce que vous voudriez éviter ?","Qu'est-ce qui vous a déçue par le passé ?"],
    familles_suggerees:['hesperidee','fougere','aromatique'] },
];

const CIBLE_PROFILS = [
  { id:'femme_elegante', label:'Femme élégante', emoji:'👗', genre:'femme',
    ages:['adulte','mature'],
    familles_principales:['fleurie','ambree','chypree'],
    notes_preferees:'Rose, jasmin, vanille, patchouli, bois précieux',
    refs_suggerees:['007','027','042','051','054','055','085','095'],
    soncas_dominant:'O',
    desc:"Femme sûre d'elle, qui soigne son image, sensible à l'exclusivité et au prestige." },
  { id:'femme_jeune', label:'Jeune femme tendance', emoji:'🌸', genre:'femme',
    ages:['jeune'],
    familles_principales:['hesperidee','fleurie','ambree'],
    notes_preferees:'Agrumes, fruits rouges, fleurs légères, musc doux',
    refs_suggerees:['009','021','026','029','090'],
    soncas_dominant:'N',
    desc:"Jeune femme qui suit les tendances, aime la nouveauté et les parfums légers et fruités." },
  { id:'femme_naturelle', label:'Femme naturelle', emoji:'🌿', genre:'femme',
    ages:['jeune','adulte'],
    familles_principales:['aromatique','hesperidee','boisee'],
    notes_preferees:'Lavande, menthe, bergamote, cèdre',
    refs_suggerees:['002','063','065','086'],
    soncas_dominant:'C',
    desc:"Femme authentique, proche de la nature, qui préfère les fragrances simples et vraies." },
  { id:'homme_classique', label:'Homme classique', emoji:'👔', genre:'homme',
    ages:['adulte','mature'],
    familles_principales:['boisee','fougere','aromatique'],
    notes_preferees:'Bois de santal, cuir, cèdre, lavande, vétiver',
    refs_suggerees:['003','004','016','017','018','038','043','086'],
    soncas_dominant:'O',
    desc:"Homme de caractère, mature, qui apprécie les parfums virils et raffinés." },
  { id:'homme_sportif', label:'Homme sportif', emoji:'💪', genre:'homme',
    ages:['jeune','adulte'],
    familles_principales:['aromatique','hesperidee','fougere'],
    notes_preferees:'Menthe, romarin, agrumes, bois frais',
    refs_suggerees:['002','020','044','065','084','087','091'],
    soncas_dominant:'C',
    desc:"Homme dynamique et actif, recherche fraîcheur et vitalité." },
  { id:'homme_seducteur', label:'Homme séducteur', emoji:'✨', genre:'homme',
    ages:['jeune','adulte'],
    familles_principales:['ambree','boisee','chypree'],
    notes_preferees:'Ambre, épices, vétiver, muscs chauds',
    refs_suggerees:['001','006','010','014','019','030','037','055'],
    soncas_dominant:'O',
    desc:"Homme charismatique qui aime marquer les esprits avec un sillage envoûtant." },
  { id:'mixte_frais', label:'Profil mixte / Frais', emoji:'💧', genre:'mixte',
    ages:['jeune','adulte'],
    familles_principales:['hesperidee','aromatique'],
    notes_preferees:'Agrumes, bergamote, aromates',
    refs_suggerees:['009','012','021','062','091','099'],
    soncas_dominant:'C',
    desc:"Profil universel qui aime les fragrances légères et fraîches, sans genre défini." },
];

const OBJECTIONS_DATA = [
  { objection:"C'est trop cher",
    reponses:["En grande surface, un parfum de luxe équivalent coûte 80 à 150€. Ici, vous l'avez pour 9 à 35€, c'est 80% d'économie.",
      "Pour un parfum de luxe à ce prix-là, j'ai des clientes qui en commandent 2 ou 3 en une seule fois.",
      "Et si on regardait ensemble ce que ça représente par jour ? 70ml qui dure 6 mois, c'est moins de 10 centimes par jour."] },
  { objection:"Je dois réfléchir",
    reponses:["Bien sûr, c'est important de prendre son temps. Qu'est-ce qui vous freine encore ?",
      "Pour vous aider à décider, qu'est-ce qui serait important que vous sachiez ?",
      "Je comprends. Ce qui fait que la plupart de mes clientes se décident, c'est qu'elles peuvent sentir avant d'acheter."] },
  { objection:"Je ne connais pas la marque",
    reponses:["Chogan est une maison italienne fondée en 2013, référence dans la parfumerie de niche en Europe.",
      "Nos parfums sont fabriqués par les mêmes nez que les grandes maisons, avec les mêmes matières premières.",
      "La différence, c'est qu'on ne paie pas la publicité et les vitrines des boutiques chic. Donc vous payez le parfum, pas l'image."] },
  { objection:"J'ai déjà mon parfum",
    reponses:["C'est justement pour ça que je pense à vous. Vous méritez d'avoir plusieurs parfums selon votre humeur, votre tenue.",
      "Beaucoup de mes clientes ont gardé leur parfum habituel et ont découvert un parfum de soirée ou de saison en plus.",
      "Et si je vous trouvais quelque chose de complémentaire à ce que vous portez déjà ?"] },
  { objection:"Je veux sentir avant",
    reponses:["Absolument, c'est indispensable ! Je peux vous faire sentir directement sur la peau pour voir comment ça évolue.",
      "Je vous conseille toujours d'attendre 5 minutes après le spray, c'est là qu'on voit la vraie signature du parfum.",
      "Quel est le meilleur moment cette semaine pour qu'on se rencontre avec ma mallette ?"] },
  { objection:"Mon mari décide",
    reponses:["Je comprends tout à fait. Et si on lui réservait une petite surprise ? Je peux vous conseiller quelque chose qui vous différencie.",
      "Vous savez, souvent les hommes adorent quand leur femme sent bon. Je peux vous aider à choisir quelque chose qu'il va adorer.",
      "Si vous le souhaitez, je peux aussi vous montrer notre gamme masculine, pour faire une belle découverte en couple."] },
];

// ─────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────

const ONGLETS = [
  { id:'rdv',    label:'🎯 Préparer', desc:'Mon RDV' },
  { id:'soncas', label:'🧠 SONCAS',   desc:'Motivation' },
  { id:'olfactif',label:'👃 Olfactif', desc:'Trouver le parfum' },
  { id:'objections',label:'💬 Objections', desc:'Arguments' },
];

export default function GuideRdvVente() {
  const [tab, setTab] = useState('rdv');

  return (
    <AppLayout title="Guide RDV Vente" icon="🎯">
      {/* Onglets */}
      <div style={S.tabBar}>
        {ONGLETS.map(t => (
          <button key={t.id} style={{ ...S.tabBtn, ...(tab===t.id ? S.tabActive : {}) }}
            onClick={() => setTab(t.id)}>
            <span style={S.tabLabel}>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'rdv'        && <TabRdv />}
      {tab === 'soncas'     && <TabSoncas />}
      {tab === 'olfactif'   && <TabOlfactif />}
      {tab === 'objections' && <TabObjections />}
    </AppLayout>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB 1 — PRÉPARER MON RDV (SOC + CIBLE + VAMP)
// ─────────────────────────────────────────────────────────────────

function TabRdv() {
  const [section, setSection] = useState('cible'); // 'cible' | 'vamp' | 'soc'
  const [cibleChoisi, setCibleChoisi] = useState(null);
  const [vampReponses, setVampReponses] = useState({});
  const [socChoisi, setSocChoisi]   = useState(null);
  const [socPerso, setSocPerso]     = useState({});
  const [showSocModal, setShowSocModal] = useState(false);

  const savedSocs = (() => { try { return JSON.parse(localStorage.getItem('chogan_socs_perso')||'[]'); } catch { return []; } })();

  function saveSoc(soc) {
    const newSoc = { ...soc, ...socPerso, id: Date.now() };
    const list = [...savedSocs, newSoc];
    localStorage.setItem('chogan_socs_perso', JSON.stringify(list));
    setShowSocModal(false);
    alert('✅ SOC sauvegardé !');
  }

  const cible = CIBLE_PROFILS.find(c => c.id === cibleChoisi);

  return (
    <div style={S.pad}>
      {/* Sous-navigation */}
      <div style={S.subNav}>
        {[['cible','🎯 Cible'],['vamp','💎 VAMP'],['soc','📝 SOC']].map(([id,l]) => (
          <button key={id} style={{ ...S.subBtn, ...(section===id ? S.subActive : {}) }}
            onClick={() => setSection(id)}>{l}</button>
        ))}
      </div>

      {/* ── CIBLE ── */}
      {section === 'cible' && (
        <>
          <div style={S.infoCard}>
            <p style={S.infoTitle}>🎯 La Cible — Qui est face à moi ?</p>
            <p style={S.infoText}>Identifiez le profil de votre cliente AVANT le RDV. Chaque profil guide vos questions, vos arguments et vos recommandations parfums.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
            {CIBLE_PROFILS.map(c => (
              <div key={c.id}
                style={{ ...S.cibleCard, ...(cibleChoisi===c.id ? { border:'2px solid var(--or-deep)', background:'rgba(210,183,149,0.15)' } : {}) }}
                onClick={() => setCibleChoisi(cibleChoisi===c.id ? null : c.id)}>
                <span style={{ fontSize:28, marginBottom:4, display:'block' }}>{c.emoji}</span>
                <p style={{ fontSize:11, fontWeight:700, color:'var(--taupe)', textAlign:'center', lineHeight:1.3 }}>{c.label}</p>
                <span style={{ fontSize:9, color:'var(--text-muted)', background:'rgba(0,0,0,0.04)', borderRadius:10, padding:'2px 6px', marginTop:4, display:'inline-block' }}>
                  {c.genre}
                </span>
              </div>
            ))}
          </div>

          {cible && (
            <div style={{ background:'var(--bg-card)', border:'2px solid var(--or-deep)', borderRadius:16, padding:16, marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <span style={{ fontSize:32 }}>{cible.emoji}</span>
                <div>
                  <p style={{ fontSize:15, fontWeight:700, color:'var(--taupe)', fontFamily:'var(--font-display)' }}>{cible.label}</p>
                  <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{cible.desc}</p>
                </div>
              </div>
              <Row label="🧠 SONCAS dominant" val={SONCAS_DATA.find(s=>s.id===cible.soncas_dominant||s.id===cible.soncas_dominant)?.label || cible.soncas_dominant} />
              <Row label="🎵 Notes préférées" val={cible.notes_preferees} />
              <div style={{ marginTop:10 }}>
                <p style={S.rowLabel}>💐 Familles recommandées</p>
                <div style={S.tags}>
                  {cible.familles_principales.map(f => {
                    const fam = FAMILLES.find(x=>x.id===f);
                    return fam ? (
                      <span key={f} style={{ ...S.tag, borderColor: fam.couleur+'66', color: fam.couleur }}>{fam.emoji} {fam.nom}</span>
                    ) : null;
                  })}
                </div>
              </div>
              <div style={{ marginTop:10 }}>
                <p style={S.rowLabel}>✨ Références suggérées</p>
                <div style={S.tags}>
                  {cible.refs_suggerees.slice(0,6).map(ref => {
                    const p = PERFUMES.find(x=>String(x.ref)===ref||x.ref===parseInt(ref));
                    return (
                      <span key={ref} style={S.tagRef}>{ref}{p?` · ${p.name}`:''}</span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── VAMP ── */}
      {section === 'vamp' && (
        <>
          <div style={S.infoCard}>
            <p style={S.infoTitle}>💎 Méthode VAMP</p>
            <p style={S.infoText}>Creusez les 4 dimensions pour comprendre profondément ce qui motive votre cliente. Posez 1-2 questions par dimension, écoutez, notez.</p>
          </div>
          {VAMP_PROFILS.map(v => (
            <div key={v.id} style={{ ...S.vampCard, borderLeftColor: v.couleur }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <span style={{ fontSize:24 }}>{v.emoji}</span>
                <div>
                  <p style={{ fontSize:14, fontWeight:700, color: v.couleur }}>{v.label}</p>
                  <p style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.4 }}>{v.desc}</p>
                </div>
              </div>
              <p style={S.rowLabel}>❓ Questions à poser</p>
              {v.questions.map((q,i) => (
                <div key={i} style={S.questionItem}>
                  <span style={{ fontSize:12, color:'var(--text-muted)', marginRight:6 }}>›</span>
                  <p style={{ fontSize:12, color:'var(--taupe)', fontStyle:'italic', flex:1 }}>« {q} »</p>
                </div>
              ))}
              <textarea
                placeholder={`Notes sur ses ${v.label.toLowerCase()}...`}
                style={S.textarea}
                value={vampReponses[v.id]||''}
                onChange={e => setVampReponses(r => ({ ...r, [v.id]: e.target.value }))}
              />
              <p style={S.rowLabel}>💐 Familles olfactives suggérées</p>
              <div style={S.tags}>
                {v.familles_suggerees.map(f => {
                  const fam = FAMILLES.find(x=>x.id===f);
                  return fam ? <span key={f} style={{ ...S.tag, borderColor: fam.couleur+'66', color: fam.couleur }}>{fam.emoji} {fam.nom}</span> : null;
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── SOC ── */}
      {section === 'soc' && (
        <>
          <div style={S.infoCard}>
            <p style={S.infoTitle}>📝 Méthode SOC</p>
            <p style={S.infoText}>Situation → Obstacle → Conséquence → Solution. Sélectionnez un modèle selon le contexte, personnalisez et sauvegardez vos SOC favoris.</p>
          </div>

          {/* SOC sauvegardés */}
          {savedSocs.length > 0 && (
            <div style={{ marginBottom:12 }}>
              <p style={{ ...S.rowLabel, marginBottom:6 }}>⭐ MES SOC SAUVEGARDÉS</p>
              {savedSocs.map((s,i) => (
                <div key={i} style={{ ...S.socCard, border:'2px solid var(--or-deep)' }}>
                  <p style={{ fontSize:13, fontWeight:700, color:'var(--taupe)', marginBottom:8 }}>{s.label}</p>
                  <SocDetail soc={s} />
                </div>
              ))}
            </div>
          )}

          <p style={{ ...S.rowLabel, marginBottom:6 }}>📋 MODÈLES PAR CONTEXTE</p>
          {SOC_TEMPLATES.map(t => (
            <div key={t.id} style={{ ...S.socCard, ...(socChoisi===t.id ? { border:'2px solid var(--or-deep)' } : {}) }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <p style={{ fontSize:13, fontWeight:700, color:'var(--taupe)' }}>{t.label}</p>
                <button style={S.btnSmall} onClick={() => setSocChoisi(socChoisi===t.id?null:t.id)}>
                  {socChoisi===t.id ? 'Fermer' : 'Voir'}
                </button>
              </div>
              {socChoisi === t.id && (
                <>
                  <SocDetail soc={t} />
                  <div style={{ marginTop:12 }}>
                    <p style={{ ...S.rowLabel, marginBottom:6 }}>✏️ PERSONNALISER</p>
                    {['situation','obstacle','consequence','solution'].map(k => (
                      <div key={k} style={{ marginBottom:8 }}>
                        <p style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', marginBottom:3 }}>{k}</p>
                        <textarea
                          style={S.textarea}
                          placeholder={t[k]}
                          value={socPerso[k]||''}
                          onChange={e => setSocPerso(p => ({ ...p, [k]: e.target.value }))}
                        />
                      </div>
                    ))}
                    <button style={S.btnSave} onClick={() => saveSoc(t)}>💾 Sauvegarder ce SOC</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function SocDetail({ soc }) {
  return (
    <>
      {[
        ['🔵 Situation', soc.situation],
        ['🔴 Obstacle',  soc.obstacle],
        ['🟡 Conséquence', soc.consequence],
        ['🟢 Solution',  soc.solution],
      ].map(([l,v]) => (
        <div key={l} style={{ background:'rgba(210,183,149,0.08)', borderRadius:8, padding:'8px 10px', marginBottom:6 }}>
          <p style={{ fontSize:10, fontWeight:700, color:'var(--or-deep)', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.06em' }}>{l}</p>
          <p style={{ fontSize:12, color:'var(--taupe)', lineHeight:1.6, fontStyle:'italic' }}>« {v} »</p>
        </div>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB 2 — SONCAS + PCA + 5 TECHNIQUES
// ─────────────────────────────────────────────────────────────────

function TabSoncas() {
  const [section, setSection] = useState('soncas');
  const [openId, setOpenId] = useState(null);

  return (
    <div style={S.pad}>
      <div style={S.subNav}>
        {[['soncas','🧠 SONCAS'],['pca','💡 PCA'],['techniques','🎯 5 Techniques']].map(([id,l]) => (
          <button key={id} style={{ ...S.subBtn, ...(section===id ? S.subActive : {}) }}
            onClick={() => setSection(id)}>{l}</button>
        ))}
      </div>

      {/* ── SONCAS ── */}
      {section === 'soncas' && (
        <>
          <div style={S.infoCard}>
            <p style={S.infoTitle}>🧠 SONCAS — La motivation d'achat</p>
            <p style={S.infoText}>Identifiez le moteur principal de votre cliente et adaptez vos arguments. Cliquez sur chaque lettre pour voir les arguments et questions associés.</p>
          </div>
          {SONCAS_DATA.map(s => (
            <div key={s.id} style={{ ...S.soncasCard, borderLeftColor: s.couleur }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}
                onClick={() => setOpenId(openId===s.id ? null : s.id)}>
                <div style={{ width:40, height:40, borderRadius:20, background: s.couleur, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:18 }}>{s.emoji}</span>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:15, fontWeight:700, color: s.couleur }}>{s.id.replace('2','')} — {s.label}</p>
                  <p style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.4, marginTop:2 }}>{s.desc}</p>
                </div>
                <span style={{ color:'var(--text-muted)', fontSize:14 }}>{openId===s.id?'▲':'▼'}</span>
              </div>
              {openId === s.id && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid var(--or-border)' }}>
                  <p style={S.rowLabel}>💬 Arguments</p>
                  {s.arguments.map((a,i) => (
                    <div key={i} style={S.argItem}>
                      <span style={{ color: s.couleur, fontWeight:700, marginRight:6 }}>✓</span>
                      <p style={{ fontSize:12, color:'var(--taupe)', flex:1, lineHeight:1.5 }}>{a}</p>
                    </div>
                  ))}
                  <p style={{ ...S.rowLabel, marginTop:10 }}>❓ Questions révélatrices</p>
                  {s.questions.map((q,i) => (
                    <div key={i} style={S.questionItem}>
                      <span style={{ fontSize:12, color:'var(--text-muted)', marginRight:6 }}>›</span>
                      <p style={{ fontSize:12, color:'var(--taupe)', fontStyle:'italic', flex:1 }}>« {q} »</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* ── PCA ── */}
      {section === 'pca' && (
        <>
          <div style={S.infoCard}>
            <p style={S.infoTitle}>💡 Méthode PCA</p>
            <p style={S.infoText}>Pour chaque produit présenté : Produit → Caractéristique → Avantage client. Transformez chaque caractéristique en bénéfice concret.</p>
          </div>
          {[
            { produit:'Parfum 70ml', car:'Concentration 25-35% (Extrait de Parfum)', avantage:'Tient toute la journée avec seulement 2-3 sprays. Économique sur le long terme.' },
            { produit:'Parfum Chogan', car:'Inspiré des grandes maisons (Dior, Chanel, YSL...)', avantage:'Vous avez l\'essence du parfum de luxe, sans payer la publicité et les boutiques.' },
            { produit:'Gamme Chogan', car:'Fabriqué en Italie, certifié', avantage:'Qualité garantie, composition contrôlée. Vous portez quelque chose de sérieux.' },
            { produit:'Prix Chogan', car:'5 à 35€ selon le format', avantage:'Vous pouvez vous permettre plusieurs parfums : un quotidien, un pour les soirées, un pour l\'été.' },
            { produit:'Service consultant', car:'Commande personnalisée et livrée', avantage:'Vous n\'avez rien à faire. Je m\'occupe de tout, de la commande à la livraison.' },
            { produit:'Programme fidélité', car:'Points cumulés à chaque achat', avantage:'Plus vous achetez, plus vous économisez. Vos prochains parfums vous coûteront encore moins.' },
          ].map((item,i) => (
            <div key={i} style={S.pcaCard}>
              <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                <span style={{ fontSize:14, fontWeight:700, color:'var(--or-deep)', background:'rgba(210,183,149,0.2)', borderRadius:20, padding:'3px 10px' }}>
                  {item.produit}
                </span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:6 }}>
                <div style={S.pcaRow}>
                  <p style={{ fontSize:9, fontWeight:700, color:'#3d6b9e', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>📦 Produit / Caractéristique</p>
                  <p style={{ fontSize:12, color:'var(--taupe)' }}>{item.car}</p>
                </div>
                <div style={S.pcaRow}>
                  <p style={{ fontSize:9, fontWeight:700, color:'#4a7c59', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>✨ Avantage pour la cliente</p>
                  <p style={{ fontSize:12, color:'var(--taupe)' }}>{item.avantage}</p>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── 5 TECHNIQUES ── */}
      {section === 'techniques' && (
        <>
          <div style={S.infoCard}>
            <p style={S.infoTitle}>🎯 Les 5 Techniques de Vente</p>
            <p style={S.infoText}>Ces techniques s'utilisent EN SITUATION, pendant le RDV. Maîtrisez-les et votre taux de transformation va exploser.</p>
          </div>
          {TECHNIQUES_DATA.map((t,i) => (
            <div key={t.id} style={{ ...S.techCard, borderLeftColor:['#3d6b9e','#4a7c59','#9e7a3d','#8a4d4d','#9e5a7a'][i]+'cc' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <span style={{ fontSize:28 }}>{t.emoji}</span>
                <div>
                  <p style={{ fontSize:14, fontWeight:700, color:'var(--taupe)', fontFamily:'var(--font-display)' }}>
                    {i+1}. {t.label}
                  </p>
                  <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2, lineHeight:1.4 }}>{t.desc}</p>
                </div>
              </div>
              <div style={{ background:'rgba(210,183,149,0.1)', borderRadius:10, padding:'10px 12px', marginBottom:8 }}>
                <p style={{ fontSize:9, fontWeight:700, color:'var(--or-deep)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>💬 Exemple concret</p>
                <p style={{ fontSize:12, color:'var(--taupe)', fontStyle:'italic', lineHeight:1.6 }}>« {t.exemple} »</p>
              </div>
              <div style={{ background:'rgba(74,124,89,0.08)', borderRadius:10, padding:'8px 12px' }}>
                <p style={{ fontSize:9, fontWeight:700, color:'#4a7c59', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>⏱ Quand l'utiliser</p>
                <p style={{ fontSize:11, color:'var(--taupe)' }}>{t.quand}</p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB 3 — GUIDE OLFACTIF (familles → parfum)
// ─────────────────────────────────────────────────────────────────

function TabOlfactif() {
  const [genre, setGenre] = useState('tous');
  const [age, setAge] = useState('tous');
  const [notesPref, setNotesPref] = useState([]);
  const [famChoisie, setFamChoisie] = useState(null);
  const [selection, setSelection] = useState([]);

  const NOTES_OPTIONS = [
    { id:'fruite', label:'🍓 Fruité', familles:['hesperidee','fleurie'] },
    { id:'floral', label:'🌸 Floral', familles:['fleurie','chypree'] },
    { id:'boise', label:'🪵 Boisé', familles:['boisee','fougere','aromatique'] },
    { id:'chaud', label:'🔥 Chaud / Épicé', familles:['ambree'] },
    { id:'frais', label:'💧 Frais', familles:['hesperidee','aromatique'] },
    { id:'musque', label:'☁️ Musqué / Doux', familles:['ambree','fleurie'] },
    { id:'viril', label:'💪 Viril / Puissant', familles:['fougere','boisee'] },
    { id:'sucre', label:'🍬 Sucré', familles:['ambree','fleurie'] },
  ];

  const toggleNote = (id) => {
    setNotesPref(n => n.includes(id) ? n.filter(x=>x!==id) : [...n, id]);
  };

  // Calculer les familles recommandées
  const famReccos = (() => {
    const scores = {};
    FAMILLES.forEach(f => { scores[f.id] = 0; });

    // Bonus genre
    const genreBonus = { femme:['fleurie','ambree','chypree','hesperidee'], homme:['boisee','fougere','aromatique','chypree'], mixte:['hesperidee','aromatique'] };
    if (genre !== 'tous') {
      (genreBonus[genre]||[]).forEach(f => { scores[f] = (scores[f]||0) + 2; });
    }

    // Bonus age
    const ageBonus = { jeune:['hesperidee','fleurie','aromatique'], adulte:['ambree','boisee','fleurie','chypree'], mature:['boisee','ambree','chypree'] };
    if (age !== 'tous') {
      (ageBonus[age]||[]).forEach(f => { scores[f] = (scores[f]||0) + 2; });
    }

    // Bonus notes
    notesPref.forEach(noteId => {
      const note = NOTES_OPTIONS.find(n=>n.id===noteId);
      if (note) note.familles.forEach(f => { scores[f] = (scores[f]||0) + 3; });
    });

    return FAMILLES.map(f => ({ ...f, score: scores[f.id]||0 }))
      .sort((a,b) => b.score - a.score)
      .filter(f => f.score > 0 || notesPref.length === 0);
  })();

  const famActive = famChoisie ? FAMILLES.find(f=>f.id===famChoisie) : null;
  const parfumsFam = famActive ? PERFUMES.filter(p => {
    const refStr = String(p.ref).padStart(3,'0');
    return famActive.refs.includes(refStr) || famActive.refs.includes(String(p.ref));
  }).slice(0, 12) : [];

  return (
    <div style={S.pad}>
      <div style={S.infoCard}>
        <p style={S.infoTitle}>👃 Guide Olfactif Personnalisé</p>
        <p style={S.infoText}>Renseignez le profil de votre cliente pour obtenir une recommandation parfum sur-mesure. Les familles les plus adaptées s'affichent en premier.</p>
      </div>

      {/* GENRE */}
      <div style={S.filterSection}>
        <p style={S.rowLabel}>👤 Genre</p>
        <div style={S.btnRow}>
          {[['tous','Tous'],['femme','♀ Femme'],['homme','♂ Homme'],['mixte','⚧ Mixte']].map(([v,l]) => (
            <button key={v} style={{ ...S.filterBtn, ...(genre===v ? S.filterActive : {}) }} onClick={() => setGenre(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* AGE */}
      <div style={S.filterSection}>
        <p style={S.rowLabel}>🎂 Âge approximatif</p>
        <div style={S.btnRow}>
          {[['tous','Tous'],['jeune','Jeune (- 30)'],['adulte','Adulte (30-55)'],['mature','Mature (55+)']].map(([v,l]) => (
            <button key={v} style={{ ...S.filterBtn, ...(age===v ? S.filterActive : {}) }} onClick={() => setAge(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* NOTES */}
      <div style={S.filterSection}>
        <p style={S.rowLabel}>🎵 Notes préférées (peut en choisir plusieurs)</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {NOTES_OPTIONS.map(n => (
            <button key={n.id} style={{ ...S.filterBtn, ...(notesPref.includes(n.id) ? S.filterActive : {}) }}
              onClick={() => toggleNote(n.id)}>{n.label}</button>
          ))}
        </div>
      </div>

      {/* FAMILLES RECOMMANDÉES */}
      <div style={{ marginBottom:16 }}>
        <p style={{ ...S.rowLabel, marginBottom:8 }}>💐 Familles recommandées</p>
        {famReccos.slice(0,4).map((f,i) => (
          <div key={f.id}
            style={{ ...S.famCard, borderLeftColor: f.couleur, ...(famChoisie===f.id ? { background:'rgba(210,183,149,0.12)', border:`1px solid ${f.couleur}` } : {}) }}
            onClick={() => setFamChoisie(famChoisie===f.id ? null : f.id)}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {i===0 && <span style={{ fontSize:10, background:'var(--or-deep)', color:'#fff', borderRadius:10, padding:'2px 8px', fontWeight:700 }}>⭐ TOP</span>}
              <span style={{ fontSize:22 }}>{f.emoji}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:700, color: f.couleur }}>{f.nom}</p>
                <p style={{ fontSize:10, color:'var(--text-muted)' }}>{f.style}</p>
              </div>
              <p style={{ fontSize:10, color:'var(--text-muted)' }}>{f.refs.length} réf.</p>
              <span style={{ color:'var(--text-muted)', fontSize:12 }}>{famChoisie===f.id?'▲':'▼'}</span>
            </div>
            {famChoisie === f.id && (
              <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid var(--or-border)' }}>
                <Row label="🎵 Notes" val={f.notes} />
                <Row label="👤 Pour qui" val={f.pourQui} />
                <p style={{ ...S.rowLabel, marginTop:10, marginBottom:6 }}>✨ Nos références</p>
                <div style={S.tags}>
                  {parfumsFam.map(p => (
                    <span key={p.ref} style={S.tagRef}>{String(p.ref).padStart(3,'0')} · {p.name}</span>
                  ))}
                </div>
                {parfumsFam.length === 0 && (
                  <p style={{ fontSize:11, color:'var(--text-muted)', fontStyle:'italic' }}>Voir catalogue pour les références de cette famille.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB 4 — OBJECTIONS
// ─────────────────────────────────────────────────────────────────

function TabObjections() {
  const [openId, setOpenId] = useState(null);

  return (
    <div style={S.pad}>
      <div style={S.infoCard}>
        <p style={S.infoTitle}>💬 Répondre aux objections</p>
        <p style={S.infoText}>Une objection n'est pas un refus — c'est une demande d'informations supplémentaires. Voici comment rebondir avec élégance.</p>
      </div>
      {OBJECTIONS_DATA.map((o,i) => (
        <div key={i} style={S.objCard}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}
            onClick={() => setOpenId(openId===i ? null : i)}>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--taupe)' }}>❝ {o.objection}</p>
            <span style={{ fontSize:14, color:'var(--text-muted)' }}>{openId===i?'▲':'▼'}</span>
          </div>
          {openId === i && (
            <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid var(--or-border)' }}>
              {o.reponses.map((r,j) => (
                <div key={j} style={S.argItem}>
                  <span style={{ color:'var(--or-deep)', fontWeight:700, marginRight:6, fontSize:14 }}>{j+1}</span>
                  <p style={{ fontSize:12, color:'var(--taupe)', flex:1, lineHeight:1.6 }}>« {r} »</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// COMPOSANTS UTILITAIRES
// ─────────────────────────────────────────────────────────────────

function Row({ label, val }) {
  return (
    <div style={{ background:'rgba(210,183,149,0.08)', borderRadius:8, padding:'8px 10px', marginBottom:6 }}>
      <p style={{ fontSize:10, fontWeight:700, color:'var(--or-deep)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>{label}</p>
      <p style={{ fontSize:12, color:'var(--taupe)', lineHeight:1.5 }}>{val}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────
const S = {
  pad:        { padding:16, paddingBottom:40 },
  tabBar:     { display:'flex', overflowX:'auto', gap:0, background:'var(--bg-card)', borderBottom:'1px solid var(--or-border)', scrollbarWidth:'none', flexShrink:0 },
  tabBtn:     { flexShrink:0, padding:'10px 14px', border:'none', background:'transparent', fontSize:11, fontWeight:600, color:'var(--text-muted)', cursor:'pointer', whiteSpace:'nowrap', borderBottom:'2px solid transparent', fontFamily:'inherit' },
  tabActive:  { color:'var(--or-deep)', borderBottom:'2px solid var(--or-deep)', background:'rgba(210,183,149,0.08)' },
  tabLabel:   { display:'block' },
  subNav:     { display:'flex', gap:6, marginBottom:14 },
  subBtn:     { flex:1, padding:'8px 6px', border:'1px solid var(--or-border)', borderRadius:10, background:'var(--bg-card)', fontSize:11, fontWeight:600, color:'var(--text-muted)', cursor:'pointer', fontFamily:'inherit' },
  subActive:  { background:'rgba(210,183,149,0.2)', borderColor:'var(--or-deep)', color:'var(--or-deep)' },
  infoCard:   { background:'rgba(210,183,149,0.1)', border:'1px solid var(--or-border)', borderRadius:12, padding:'12px 14px', marginBottom:14 },
  infoTitle:  { fontSize:12, fontWeight:700, color:'var(--or-deep)', marginBottom:4 },
  infoText:   { fontSize:12, color:'var(--text-muted)', lineHeight:1.6 },
  rowLabel:   { fontSize:10, fontWeight:700, color:'var(--or-deep)', textTransform:'uppercase', letterSpacing:'0.08em' },
  tags:       { display:'flex', flexWrap:'wrap', gap:6, marginTop:4 },
  tag:        { fontSize:10, padding:'3px 10px', borderRadius:20, border:'1px solid', background:'transparent', display:'inline-block', fontWeight:600 },
  tagRef:     { fontSize:10, padding:'3px 8px', borderRadius:20, border:'1px solid var(--or-border)', background:'rgba(210,183,149,0.1)', color:'var(--taupe)', display:'inline-block' },
  textarea:   { width:'100%', minHeight:52, border:'1px solid var(--or-border)', borderRadius:10, padding:'8px 10px', fontSize:12, color:'var(--taupe)', fontFamily:'inherit', background:'var(--bg-card)', resize:'vertical', outline:'none', boxSizing:'border-box' },
  questionItem:{ display:'flex', alignItems:'flex-start', gap:4, marginBottom:4 },
  argItem:    { display:'flex', alignItems:'flex-start', gap:4, marginBottom:6 },
  // Cards
  cibleCard:  { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:'12px 10px', display:'flex', flexDirection:'column', alignItems:'center', cursor:'pointer' },
  vampCard:   { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderLeft:'3px solid', borderRadius:14, padding:14, marginBottom:10 },
  socCard:    { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:14, marginBottom:10 },
  soncasCard: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderLeft:'4px solid', borderRadius:14, padding:14, marginBottom:10 },
  pcaCard:    { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:14, marginBottom:10 },
  techCard:   { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderLeft:'4px solid', borderRadius:14, padding:14, marginBottom:10 },
  famCard:    { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderLeft:'3px solid', borderRadius:14, padding:14, marginBottom:10, cursor:'pointer' },
  objCard:    { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:14, padding:14, marginBottom:10 },
  pcaRow:     { background:'rgba(210,183,149,0.07)', borderRadius:8, padding:'8px 10px' },
  // Filtres
  filterSection: { marginBottom:14 },
  btnRow:     { display:'flex', flexWrap:'wrap', gap:6, marginTop:6 },
  filterBtn:  { padding:'6px 12px', border:'1px solid var(--or-border)', borderRadius:20, background:'var(--bg-card)', fontSize:11, fontWeight:600, color:'var(--text-muted)', cursor:'pointer', fontFamily:'inherit' },
  filterActive:{ background:'rgba(210,183,149,0.25)', borderColor:'var(--or-deep)', color:'var(--or-deep)' },
  btnSmall:   { padding:'4px 10px', border:'1px solid var(--or-border)', borderRadius:8, background:'transparent', fontSize:11, color:'var(--or-deep)', cursor:'pointer', fontFamily:'inherit' },
  btnSave:    { width:'100%', padding:'12px', border:'none', borderRadius:12, background:'var(--or-deep)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', marginTop:4 },
};
