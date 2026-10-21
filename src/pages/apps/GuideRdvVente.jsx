import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { FAMILLES, PERFUMES } from '../../utils/choganData';

// ─────────────────────────────────────────────────────────────────
// DONNÉES MÉTIER — tirées du prompteur-formateur (oser-proposer.json)
// ─────────────────────────────────────────────────────────────────

// VAMP = Vente · Accueil · Méthodes · Personnalité
// Autodiagnostic 20 questions, 5 par lettre (source : vamp.html + j1 du prompteur)
const VAMP_CATS = [
  { k:'V', label:'Vente', emoji:'💰', couleur:'#c0392b',
    desc:"Est-ce que j'ose proposer mes parfums ?",
    items:[
      { q:"Je propose systématiquement les parfums", ex:"À chaque personne que je vois, je parle de mes parfums." },
      { q:"Je fais des ventes complémentaires", ex:"Avec un parfum, je propose aussi la brume ou la crème." },
      { q:"Je propose un choix au client", ex:"« Tu préfères le 30 ou le 70 ml ? »" },
      { q:"J'utilise les promos pour vendre", ex:"« Ce mois-ci, il y a une promo. »" },
      { q:"Je continue à proposer même après un refus", ex:"Après un « non », je propose autre chose." },
    ]},
  { k:'A', label:'Accueil', emoji:'😊', couleur:'#2980b9',
    desc:"Est-ce que je mets les gens à l'aise ?",
    items:[
      { q:"J'accueille avec le sourire", ex:"Je souris dès le premier mot." },
      { q:"Je suis à l'aise avec les inconnus", ex:"Je parle facilement à quelqu'un que je ne connais pas." },
      { q:"Je crée une bonne ambiance", ex:"La cliente se sent bien, on rit ensemble." },
      { q:"Je varie mes approches", ex:"En vrai, par message, en soirée, au travail…" },
      { q:"Je remercie même sans achat", ex:"« Merci pour ton temps ! », même si elle n'achète pas." },
    ]},
  { k:'M', label:'Méthodes', emoji:'🎯', couleur:'#27ae60',
    desc:"Est-ce que j'utilise les bonnes techniques de vente ?",
    items:[
      { q:"J'argumente sur mes produits systématiquement", ex:"Je donne une bonne raison d'acheter (30 % d'essence…)." },
      { q:"Je détecte le SONCAS du client", ex:"Je devine ce qui lui donne envie : être rassurée, le prix, la nouveauté…" },
      { q:"Je reformule pour comprendre le besoin du client", ex:"« Si je comprends bien, tu cherches un parfum léger ? »" },
      { q:"Je sais conclure une vente", ex:"« Je te le mets de côté ? »" },
      { q:"J'observe les détails qui comptent", ex:"Je remarque son style, ce qu'elle porte, ce qu'elle dit." },
    ]},
  { k:'P', label:'Personnalité', emoji:'✨', couleur:'#8e44ad',
    desc:"Est-ce que j'ai la bonne attitude ?",
    items:[
      { q:"J'ai de l'énergie chaque jour", ex:"Je suis motivée, même les jours difficiles." },
      { q:"Je suis confiante et rassurante", ex:"La cliente me fait confiance." },
      { q:"J'argumente même mon produit non préféré", ex:"Je sais parler d'un parfum que je n'aime pas." },
      { q:"J'ose proposer sans timidité", ex:"Je propose sans avoir peur du « non »." },
      { q:"J'utilise l'humour naturellement", ex:"Je fais sourire la cliente." },
    ]},
];

// SOC = Sujet · Objectif · Comment
// Présentation en 30 secondes (source : j1 pages 15-16 du prompteur)
const SOC_SCENARIOS = [
  { id:'amie', label:'🤝 Une amie en ville', type:'amie',
    sujet:"Bonjour [Prénom] ! Moi c'est [Ton prénom]. Je suis consultante Chogan.",
    objectif:"J'adore aider les femmes à trouver leur parfum signature.",
    comment:"Tu as 5 minutes ? On prend un café, je te fais sentir mes trois préférés.",
    exemple:"Amina ! Ça fait longtemps ! Moi ? Je suis consultante Chogan. Je fais découvrir des parfums de qualité, à petit prix. J'adore aider les femmes à trouver leur parfum. Tu as cinq minutes ? On prend un café, je te fais sentir mes trois préférés." },
  { id:'gouter', label:'☕ Un goûter / Soirée', type:'gouter',
    sujet:"Bonjour à toutes ! Moi c'est [Prénom]. Je suis consultante Chogan. Je fais découvrir des parfums de qualité, à petit prix.",
    objectif:"J'aime aider chacune à trouver son parfum.",
    comment:"Pendant le café, je fais tourner trois testeurs. Vous sentez, vous me dites ce que vous aimez, et je vous conseille.",
    exemple:"Bonjour à toutes, moi c'est Nej. Je suis consultante Chogan. Je fais découvrir des parfums de qualité, à petit prix. J'aime aider chacune à trouver son parfum. Pendant le café, je fais tourner trois testeurs. Vous sentez, vous me dites ce que vous aimez, et je vous conseille." },
  { id:'demo', label:'🌸 Une démonstration cliente', type:'demo',
    sujet:"Merci de m'accueillir ! Je suis consultante Chogan.",
    objectif:"Mon but, c'est de t'aider à trouver le parfum qui te ressemble vraiment.",
    comment:"Je t'ai préparé une sélection. On va sentir ensemble, et tu me dis ce qui te parle.",
    exemple:"Merci de m'accueillir ! Je suis consultante Chogan. Mon but, c'est de t'aider à trouver le parfum qui te ressemble vraiment. Je t'ai préparé une sélection. On va sentir ensemble, et tu me dis ce qui te parle." },
  { id:'commercant', label:'🏪 Un commerçant / Pro', type:'commercant',
    sujet:"Bonjour ! Je suis consultante Chogan, parfumerie italienne de niche.",
    objectif:"Je travaille avec des professionnels comme vous pour développer une offre complémentaire à votre activité.",
    comment:"Est-ce que vous avez 5 minutes pour que je vous présente notre gamme ? Je vous laisse un testeur.",
    exemple:"Bonjour ! Je suis consultante Chogan, parfumerie italienne de niche. Je travaille avec des professionnels comme vous pour développer une offre complémentaire. Est-ce que vous avez 5 minutes pour que je vous présente notre gamme ? Je vous laisse un testeur." },
];

// SONCAS — source : j2 page 10 du prompteur (phrases exactes)
const SONCAS_DATA = [
  { id:'S', label:'Sécurité', emoji:'🛡️', couleur:'#3d6b9e',
    signal:"Elle veut être rassurée. Elle pose des questions sur la qualité.",
    phrase_cle:"« Nos essences viennent de Grasse, la référence. »",
    arguments:["Haute concentration : 30 % d'essence, comme les grandes maisons","Fabriqué en Italie, contrôlé, sans allergènes majeurs","Des milliers de clientes fidèles — et elles reviennent"],
    questions:["Qu'est-ce qui est important pour vous dans un parfum ?","Avez-vous déjà eu une mauvaise expérience avec un parfum ?"] },
  { id:'O', label:'Orgueil', emoji:'👑', couleur:'#9e7a3d',
    signal:"Elle parle de marques, de luxe. Elle compare.",
    phrase_cle:"« C'est de l'extrait de parfum, le plus noble. »",
    arguments:["Qualité identique aux grandes maisons (Dior, Chanel…) à prix accessible","Nos parfums ne se trouvent pas en grande surface — c'est exclusif","Vous serez celle qui a trouvé la perle rare"],
    questions:["Aimez-vous les choses exclusives ?","Quelle image souhaitez-vous donner ?"] },
  { id:'N', label:'Nouveauté', emoji:'✨', couleur:'#9e5a7a',
    signal:"« C'est nouveau ? » Elle aime être parmi les premières.",
    phrase_cle:"« Il vient de sortir. Tu serais parmi les premières. »",
    arguments:["Nouvelles références chaque saison","Collection exclusive non disponible partout","Les dernières tendances olfactives de niche"],
    questions:["Aimez-vous découvrir de nouvelles choses ?","Suivez-vous les tendances en parfumerie ?"] },
  { id:'C', label:'Confort', emoji:'🛋️', couleur:'#4a7c59',
    signal:"« Je n'ai pas le temps. » Elle veut que ce soit simple.",
    phrase_cle:"« C'est simple : tu testes, je livre. »",
    arguments:["Livraison à domicile, sans se déplacer","Je gère tout pour vous — commande, livraison, suivi","Paiement simple et rapide"],
    questions:["Comment préférez-vous faire vos achats ?","Aimez-vous que quelqu'un s'occupe de tout pour vous ?"] },
  { id:'A', label:'Argent', emoji:'💰', couleur:'#5a8a5a',
    signal:"« C'est combien ? » Elle est sensible au rapport qualité/prix.",
    phrase_cle:"« Tu paies le parfum, pas la publicité. »",
    arguments:["Jusqu'à 80 % moins cher qu'un parfum de luxe comparable","70 ml pour le prix d'un 30 ml en boutique","Programme fidélité : chaque achat rapporte des points"],
    questions:["Quel budget avez-vous en tête ?","Vous aimez faire de bonnes affaires ?"] },
  { id:'S2', label:'Sympathie', emoji:'🤝', couleur:'#c97c3a',
    signal:"Elle sourit, elle discute. Elle achète parce qu'elle vous apprécie.",
    phrase_cle:"« On prend le temps de trouver le tien. »",
    arguments:["Je vous le conseille personnellement — je porte ce parfum moi-même","Je suis là pour vous accompagner, même après la commande","Mes clientes reviennent toujours vers moi"],
    questions:["Comment vous sentez-vous par rapport à notre échange ?","Qu'est-ce qui vous a donné envie qu'on se rencontre ?"] },
];

// PCA = Promo · Complément · Additionnel
// Pour vendre PLUS à la même cliente (source : j2 pages 4-9 du prompteur)
const PCA_DATA = [
  { id:'P', label:'Promo', emoji:'🎁', couleur:'#c0392b',
    desc:"Tu ne proposes pas la promo ? Tu laisses de l'argent sur la table.",
    quand:"Dès qu'elle a dit oui à un premier achat.",
    exemple:"« Ce mois-ci : deux achetés, le troisième à moitié prix. »",
    conseil:"Ne pas attendre qu'elle demande — proposer systématiquement." },
  { id:'C', label:'Complément', emoji:'➕', couleur:'#2980b9',
    desc:"La cliente a déjà dit oui. Tu proposes un produit qui va avec.",
    quand:"Après la première vente conclue.",
    exemple:"« Pour garder l'odeur plus longtemps, la brume assortie est parfaite. »",
    conseil:"Elle a dit oui une fois. Elle peut dire oui deux fois." },
  { id:'A', label:'Additionnel', emoji:'🔓', couleur:'#27ae60',
    desc:"Un autre produit, pour ouvrir une nouvelle porte.",
    quand:"Quand la vente principale est faite.",
    exemple:"« Au fait, tu connais nos parfums d'ambiance ? C'est parfait pour la maison. »",
    conseil:"Ce n'est pas forcer. C'est penser à ce dont elle aura besoin." },
];

// OBJECTIONS — méthode 4 temps (source : j2 pages 13-14 du prompteur)
const OBJECTIONS_DATA = [
  { objection:"C'est trop cher",
    reformulation:"Tu trouves que c'est un budget.",
    reponse:"C'est un extrait de parfum — il tient toute la journée. Une goutte suffit, il dure longtemps.",
    reproposer:"On part sur le 30 ml, à 18 € ?",
    plus:["En grande surface, un équivalent luxe coûte 80 à 150 €. Ici, c'est 80 % d'économie.","Pour un parfum à ce prix, mes clientes en commandent souvent 2 ou 3 d'un coup.","Ça fait moins de 10 centimes par jour pour 6 mois de plaisir."] },
  { objection:"Je dois réfléchir",
    reformulation:"Tu veux prendre le temps d'être sûre.",
    reponse:"C'est sage. Qu'est-ce qui te freine encore ? Je peux t'aider à décider.",
    reproposer:"On peut commencer par le 15 ml pour tester sans engagement ?",
    plus:["Ce qui fait que la plupart de mes clientes se décident, c'est qu'elles peuvent sentir avant d'acheter.","Pour vous aider à décider, qu'est-ce qui serait important que vous sachiez ?"] },
  { objection:"Je ne connais pas la marque",
    reformulation:"Tu veux être sûre de la qualité.",
    reponse:"Chogan est une maison italienne fondée en 2013. Les mêmes nez que les grandes maisons, les mêmes matières premières.",
    reproposer:"Tu veux que je te laisse un testeur pour sentir par toi-même ?",
    plus:["La différence : on ne paie pas la pub ni les vitrines chic. Tu paies le parfum, pas l'image.","Nos essences viennent de Grasse — la même référence que Chanel ou Dior."] },
  { objection:"J'ai déjà mon parfum",
    reformulation:"Tu as déjà un parfum que tu aimes.",
    reponse:"Justement — vous méritez d'avoir plusieurs parfums selon votre humeur et votre tenue.",
    reproposer:"Et si je vous trouvais quelque chose de complémentaire à ce que vous portez déjà ?",
    plus:["Beaucoup de mes clientes ont gardé leur parfum habituel et ont découvert un parfum de soirée en plus.","On peut trouver votre parfum du quotidien ET votre parfum signature."] },
  { objection:"Je veux sentir avant",
    reformulation:"Tu veux être certaine avant de te décider.",
    reponse:"Absolument, c'est indispensable ! Je vous conseille toujours de sentir sur la peau — le vrai parfum apparaît après 5 minutes.",
    reproposer:"Quel est le meilleur moment cette semaine pour qu'on se rencontre avec ma mallette ?",
    plus:["Je peux faire tourner des testeurs chez vous ou chez vos amies.","Le parfum évolue sur la peau — ce que vous sentez dans le flacon n'est pas ce que vous porterez."] },
  { objection:"Mon mari / ma famille décide",
    reformulation:"Tu veux leur en parler avant.",
    reponse:"Je comprends tout à fait. Et si on lui réservait une petite surprise ?",
    reproposer:"Je peux aussi vous montrer notre gamme masculine — une belle découverte en couple ?",
    plus:["Les hommes adorent souvent quand leur femme sent bon — je peux vous conseiller quelque chose qu'il va adorer.","Si vous souhaitez, je vous envoie une fiche cadeau à lui montrer."] },
];

// ─────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────

const TABS = [
  { id:'soc',       label:'📝 Mon SOC',    desc:'Présentation 30s' },
  { id:'vamp',      label:'🪞 VAMP',       desc:'Autodiagnostic' },
  { id:'soncas',    label:'🧠 SONCAS',     desc:'Motivations' },
  { id:'pca',       label:'💡 PCA',        desc:'Vendre plus' },
  { id:'olfactif',  label:'🌸 Olfactif',   desc:'Guide parfum' },
  { id:'objections',label:'🛡️ Objections', desc:'4 temps' },
];

export default function GuideRdvVente() {
  const [tab, setTab] = useState('soc');

  return (
    <AppLayout title="Guide RDV Vente" subtitle="Méthodes · Formation · Techniques">
      {/* TABS */}
      <div style={S.tabsWrap}>
        {TABS.map(t => (
          <button key={t.id} style={{ ...S.tab, ...(tab===t.id ? S.tabActive : {}) }}
            onClick={() => setTab(t.id)}>
            <span style={S.tabEmoji}>{t.label.split(' ')[0]}</span>
            <span style={S.tabLabel}>{t.label.slice(t.label.indexOf(' ')+1)}</span>
          </button>
        ))}
      </div>

      {tab === 'soc'        && <TabSoc />}
      {tab === 'vamp'       && <TabVamp />}
      {tab === 'soncas'     && <TabSoncas />}
      {tab === 'pca'        && <TabPca />}
      {tab === 'olfactif'   && <TabOlfactif />}
      {tab === 'objections' && <TabObjections />}
    </AppLayout>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB SOC — Sujet · Objectif · Comment
// ─────────────────────────────────────────────────────────────────
function TabSoc() {
  const [sel, setSel] = useState(null);
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('chogan_soc_notes') || '{}'); } catch { return {}; }
  });
  const saveNote = (id, val) => {
    const n = { ...notes, [id]: val };
    setNotes(n);
    try { localStorage.setItem('chogan_soc_notes', JSON.stringify(n)); } catch {}
  };

  return (
    <div style={S.pad}>
      <div style={S.infoCard}>
        <p style={S.infoTitle}>📝 La méthode SOC — Ta présentation en 30 secondes</p>
        <p style={S.infoText}>
          <b>S</b> = <b>Sujet</b> : qui je suis, ce que je fais<br/>
          <b>O</b> = <b>Objectif</b> : ce que j'aime, mon envie<br/>
          <b>C</b> = <b>Comment</b> : ce que je propose concrètement<br/><br/>
          <em>Le C est la lettre la plus importante — c'est là qu'on gagne la vente.</em>
        </p>
      </div>

      <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:10 }}>Choisis ta situation et personnalise ton discours :</p>

      {SOC_SCENARIOS.map(sc => (
        <div key={sc.id} style={S.card}>
          <div style={S.cardHeader} onClick={() => setSel(sel === sc.id ? null : sc.id)}>
            <p style={S.cardTitle}>{sc.label}</p>
            <span style={S.chevron}>{sel === sc.id ? '▲' : '▼'}</span>
          </div>
          {sel === sc.id && (
            <div style={S.cardBody}>
              {[['🔵 S — Sujet', sc.sujet], ['🟡 O — Objectif', sc.objectif], ['🟢 C — Comment', sc.comment]].map(([lab, val]) => (
                <div key={lab} style={{ marginBottom:10 }}>
                  <p style={S.rowLabel}>{lab}</p>
                  <p style={S.rowVal}>{val}</p>
                </div>
              ))}
              <div style={S.exBox}>
                <p style={S.exTitle}>💬 Exemple complet (25 secondes)</p>
                <p style={S.exText}>{sc.exemple}</p>
              </div>
              <div style={{ marginTop:12 }}>
                <p style={S.rowLabel}>✏️ Ma version personnalisée</p>
                <textarea
                  style={S.textarea}
                  rows={4}
                  placeholder="Écris ton SOC ici…"
                  value={notes[sc.id] || ''}
                  onChange={e => saveNote(sc.id, e.target.value)}
                />
                <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:4 }}>Sauvegardé automatiquement ✓</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB VAMP — Vente · Accueil · Méthodes · Personnalité
// ─────────────────────────────────────────────────────────────────
function TabVamp() {
  const SYMS = ['−', '=', '+'];
  const LABELS = ['Pas encore', 'Parfois', 'Oui, souvent'];
  const [ans, setAns] = useState({});
  const [openCat, setOpenCat] = useState('V');

  const setVal = (key, val) => setAns(prev => ({ ...prev, [key]: val }));

  const score = (k) => {
    const cat = VAMP_CATS.find(c => c.k === k);
    return cat ? cat.items.reduce((sum, _, i) => {
      const v = ans[k + i];
      return sum + (v !== undefined ? v : 0);
    }, 0) : 0;
  };
  const totalDone = Object.keys(ans).length;
  const totalScore = VAMP_CATS.reduce((sum, c) => sum + score(c.k), 0);

  const level = (s, max) => {
    if (max === 40) return s <= 16 ? 'Débutante' : s <= 28 ? 'En progression' : 'Performante';
    return s <= 4 ? 'Débutante' : s <= 7 ? 'En progression' : 'Performante';
  };
  const lvlColor = (lv) => lv === 'Performante' ? '#27ae60' : lv === 'En progression' ? '#e08a00' : '#c0392b';

  return (
    <div style={S.pad}>
      <div style={S.infoCard}>
        <p style={S.infoTitle}>🪞 Mon profil VAMP — Bilan sur soi</p>
        <p style={S.infoText}>
          Avant de vendre, on apprend à se connaître. Pour chaque phrase, note ton niveau honnêtement.<br/>
          <b>−</b> = Pas encore (0 pt) · <b>=</b> = Parfois (1 pt) · <b>+</b> = Oui, souvent (2 pts)
        </p>
      </div>

      {VAMP_CATS.map(cat => {
        const s = score(cat.k);
        const done = cat.items.filter((_, i) => ans[cat.k + i] !== undefined).length;
        const lv = done === 5 ? level(s, 10) : null;
        return (
          <div key={cat.k} style={{ ...S.vampCat, borderLeft: `4px solid ${cat.couleur}` }}>
            <div style={S.vampHeader} onClick={() => setOpenCat(openCat === cat.k ? null : cat.k)}>
              <div style={{ ...S.vampBadge, background: cat.couleur }}>{cat.k}</div>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:13, color: cat.couleur, margin:0 }}>{cat.label}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', margin:0 }}>{cat.desc}</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontWeight:900, fontSize:18, color: cat.couleur, margin:0 }}>{done === 5 ? s : '—'}<span style={{ fontSize:11, color:'var(--text-muted)' }}>/10</span></p>
                {lv && <span style={{ fontSize:10, color: lvlColor(lv), fontWeight:700 }}>{lv}</span>}
              </div>
            </div>

            {openCat === cat.k && cat.items.map((item, i) => (
              <div key={i} style={S.vampItem}>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:12, color:'var(--taupe)', margin:0 }}>{item.q}</p>
                  <p style={{ fontSize:11, color:'var(--text-muted)', fontStyle:'italic', margin:'2px 0 0' }}>Ex : {item.ex}</p>
                </div>
                <div style={S.vampBtns}>
                  {[0, 1, 2].map(v => (
                    <button key={v} style={{
                      ...S.vampBtn,
                      background: ans[cat.k+i] === v ? cat.couleur : 'var(--bg-card)',
                      color: ans[cat.k+i] === v ? '#fff' : 'var(--text-muted)',
                      borderColor: ans[cat.k+i] === v ? cat.couleur : 'var(--or-border)',
                    }} onClick={() => setVal(cat.k+i, v)}>
                      {SYMS[v]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Résultat global */}
      {totalDone >= 20 && (
        <div style={{ background:'var(--or-deep)', borderRadius:14, padding:20, marginTop:16, textAlign:'center' }}>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.8)', letterSpacing:'0.1em', textTransform:'uppercase', margin:'0 0 4px' }}>Ma note finale</p>
          <p style={{ fontSize:42, fontWeight:900, color:'#fff', margin:0 }}>{totalScore}<span style={{ fontSize:14, opacity:0.7 }}>/40</span></p>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.9)', marginTop:6 }}>
            {level(totalScore, 40)}
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:4, marginTop:12, textAlign:'left' }}>
            {VAMP_CATS.map(c => (
              <p key={c.k} style={{ fontSize:12, color:'rgba(255,255,255,0.85)', margin:0 }}>
                <b>{c.k}</b> {c.label} : {score(c.k)}/10 · {level(score(c.k), 10)}
              </p>
            ))}
          </div>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.75)', marginTop:12 }}>
            💪 Force : <b>{VAMP_CATS.sort((a,b) => score(b.k)-score(a.k))[0].label}</b>
            &nbsp;· 🎯 À travailler : <b>{VAMP_CATS.sort((a,b) => score(a.k)-score(b.k))[0].label}</b>
          </p>
        </div>
      )}
      {totalDone < 20 && (
        <div style={{ ...S.infoCard, textAlign:'center', marginTop:16 }}>
          <p style={{ color:'var(--text-muted)', fontSize:12 }}>Encore {20 - totalDone} phrase{20-totalDone > 1 ? 's' : ''} à noter pour voir ta note finale</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB SONCAS
// ─────────────────────────────────────────────────────────────────
function TabSoncas() {
  const [sel, setSel] = useState(null);

  return (
    <div style={S.pad}>
      <div style={S.infoCard}>
        <p style={S.infoTitle}>🧠 SONCAS — Ce qui fait acheter</p>
        <p style={S.infoText}>
          Pourquoi une cliente achète ? Pas pour le produit.<br/>
          Pour <b>une de ces six raisons</b>. Le secret : <b>écouter d'abord</b>, puis répondre avec <b>sa raison</b> — pas la tienne.
        </p>
      </div>
      {SONCAS_DATA.map(s => (
        <div key={s.id} style={S.card}>
          <div style={S.cardHeader} onClick={() => setSel(sel === s.id ? null : s.id)}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:s.couleur, display:'grid', placeItems:'center', fontSize:18, flexShrink:0 }}>{s.emoji}</div>
              <div>
                <p style={{ ...S.cardTitle, margin:0 }}>{s.id.replace('2','') } — {s.label}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', margin:0 }}>{s.signal}</p>
              </div>
            </div>
            <span style={S.chevron}>{sel === s.id ? '▲' : '▼'}</span>
          </div>
          {sel === s.id && (
            <div style={S.cardBody}>
              <div style={{ background:`${s.couleur}15`, border:`1px solid ${s.couleur}40`, borderRadius:10, padding:'10px 12px', marginBottom:12 }}>
                <p style={{ fontSize:11, color:s.couleur, fontWeight:700, margin:'0 0 4px' }}>📌 Ta phrase clé</p>
                <p style={{ fontSize:13, fontStyle:'italic', color:'var(--taupe)', margin:0 }}>{s.phrase_cle}</p>
              </div>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--or-deep)', marginBottom:6 }}>3 arguments</p>
              {s.arguments.map((a, i) => (
                <div key={i} style={{ display:'flex', gap:8, marginBottom:6 }}>
                  <span style={{ fontSize:10, color:'var(--text-muted)', minWidth:16, marginTop:2 }}>{i+1}.</span>
                  <p style={{ fontSize:12, color:'var(--taupe)', margin:0, lineHeight:1.5 }}>{a}</p>
                </div>
              ))}
              <p style={{ fontSize:11, fontWeight:700, color:'var(--or-deep)', margin:'10px 0 6px' }}>Questions à poser</p>
              {s.questions.map((q, i) => (
                <p key={i} style={{ fontSize:12, color:'var(--text-muted)', fontStyle:'italic', marginBottom:4 }}>• {q}</p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB PCA — Promo · Complément · Additionnel
// ─────────────────────────────────────────────────────────────────
function TabPca() {
  const [sel, setSel] = useState(null);

  return (
    <div style={S.pad}>
      <div style={S.infoCard}>
        <p style={S.infoTitle}>💡 PCA — Vendre plus à la même cliente</p>
        <p style={S.infoText}>
          <b>P</b> = <b>Promo</b> : propose toujours la promo en cours<br/>
          <b>C</b> = <b>Complément</b> : un produit qui va avec ce qu'elle vient d'acheter<br/>
          <b>A</b> = <b>Additionnel</b> : ouvrir une nouvelle porte<br/><br/>
          <em>Ce n'est pas forcer. C'est penser à ce dont elle aura besoin.</em>
        </p>
      </div>
      {PCA_DATA.map(p => (
        <div key={p.id} style={S.card}>
          <div style={S.cardHeader} onClick={() => setSel(sel === p.id ? null : p.id)}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:p.couleur, display:'grid', placeItems:'center', fontSize:18, flexShrink:0 }}>{p.emoji}</div>
              <div>
                <p style={{ ...S.cardTitle, margin:0 }}>{p.id} — {p.label}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', margin:0 }}>{p.quand}</p>
              </div>
            </div>
            <span style={S.chevron}>{sel === p.id ? '▲' : '▼'}</span>
          </div>
          {sel === p.id && (
            <div style={S.cardBody}>
              <p style={{ fontSize:13, color:'var(--taupe)', lineHeight:1.6, marginBottom:12 }}>{p.desc}</p>
              <div style={S.exBox}>
                <p style={S.exTitle}>💬 Exemple</p>
                <p style={S.exText}>{p.exemple}</p>
              </div>
              <div style={{ background:'rgba(210,183,149,0.1)', borderRadius:8, padding:'8px 12px', marginTop:10 }}>
                <p style={{ fontSize:12, color:'var(--or-deep)', margin:0 }}>💡 {p.conseil}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB OLFACTIF
// ─────────────────────────────────────────────────────────────────
function TabOlfactif() {
  const [genre, setGenre] = useState('');
  const [age, setAge] = useState('');
  const [notesPreferees, setNotes] = useState([]);
  const [selFam, setSelFam] = useState(null);

  const noteOptions = ['Fruité','Floral','Boisé','Oriental','Frais','Épicé','Musqué','Vanillé','Agrumes'];
  const toggleNote = n => setNotes(prev => prev.includes(n) ? prev.filter(x=>x!==n) : [...prev, n]);

  // Scoring des familles
  const scores = FAMILLES.map(f => {
    let s = 0;
    const g = f.pourQui?.toLowerCase() || '';
    if (genre === 'femme' && (g.includes('femme') || g.includes('féminin'))) s += 2;
    if (genre === 'homme' && (g.includes('homme') || g.includes('mascul') || g.includes('viril'))) s += 2;
    if (genre === 'mixte') s += 1;
    if (age === 'jeune' && (g.includes('jeune') || g.includes('tout âge') || g.includes('légèr'))) s += 2;
    if (age === 'adulte') s += 1;
    if (age === 'mature' && (g.includes('matur') || g.includes('personnali'))) s += 2;
    const notes = (f.notes || '').toLowerCase();
    notesPreferees.forEach(n => {
      if (n==='Fruité' && (notes.includes('fruit') || notes.includes('mangue') || notes.includes('berry'))) s += 3;
      if (n==='Floral' && (notes.includes('rose') || notes.includes('jasmin') || notes.includes('fleur'))) s += 3;
      if (n==='Boisé' && (notes.includes('bois') || notes.includes('cèdre') || notes.includes('santal'))) s += 3;
      if (n==='Oriental' && (notes.includes('vanille') || notes.includes('ambr') || notes.includes('benjoin'))) s += 3;
      if (n==='Frais' && (notes.includes('frais') || notes.includes('aquatique') || notes.includes('marine'))) s += 3;
      if (n==='Épicé' && (notes.includes('épice') || notes.includes('poivre') || notes.includes('cannelle'))) s += 3;
      if (n==='Musqué' && (notes.includes('musc') || notes.includes('musque'))) s += 3;
      if (n==='Vanillé' && (notes.includes('vanille') || notes.includes('gourmand'))) s += 3;
      if (n==='Agrumes' && (notes.includes('citron') || notes.includes('bergamote') || notes.includes('orange') || notes.includes('mandarine'))) s += 3;
    });
    return { ...f, score: s };
  }).sort((a,b) => b.score - a.score);

  const hasFilter = genre || age || notesPreferees.length > 0;
  const topFamilies = hasFilter ? scores.filter(f => f.score > 0).slice(0, 4) : [];

  const refsForFam = (famId) => {
    const fam = FAMILLES.find(f => f.id === famId);
    if (!fam || !fam.refs || !PERFUMES) return [];
    return fam.refs.slice(0, 8);
  };

  return (
    <div style={S.pad}>
      <div style={S.infoCard}>
        <p style={S.infoTitle}>🌸 Guide Olfactif — Trouver le parfum de la cliente</p>
        <p style={S.infoText}>Réponds aux questions pour identifier les familles qui correspondent à ta cliente.</p>
      </div>

      <p style={S.filterLabel}>Genre</p>
      <div style={S.filterRow}>
        {[['femme','👩 Femme'],['homme','👨 Homme'],['mixte','🧑 Mixte']].map(([v,l]) => (
          <button key={v} style={{ ...S.filterBtn, ...(genre===v ? S.filterBtnActive : {}) }} onClick={() => setGenre(genre===v?'':v)}>{l}</button>
        ))}
      </div>

      <p style={S.filterLabel}>Tranche d'âge</p>
      <div style={S.filterRow}>
        {[['jeune','🌱 Jeune (-30)'],['adulte','🌿 Adulte (30-50)'],['mature','🌳 Mature (50+)']].map(([v,l]) => (
          <button key={v} style={{ ...S.filterBtn, ...(age===v ? S.filterBtnActive : {}) }} onClick={() => setAge(age===v?'':v)}>{l}</button>
        ))}
      </div>

      <p style={S.filterLabel}>Notes préférées <span style={{ fontSize:10, color:'var(--text-muted)' }}>(plusieurs possibles)</span></p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
        {noteOptions.map(n => (
          <button key={n} style={{ ...S.filterBtn, ...(notesPreferees.includes(n) ? S.filterBtnActive : {}) }} onClick={() => toggleNote(n)}>{n}</button>
        ))}
      </div>

      {hasFilter && topFamilies.length === 0 && (
        <div style={S.infoCard}><p style={{ textAlign:'center', color:'var(--text-muted)', fontSize:12 }}>Essaie d'affiner les filtres</p></div>
      )}

      {topFamilies.map((f, idx) => (
        <div key={f.id} style={{ ...S.card, ...(idx === 0 ? { border:'2px solid var(--or-deep)' } : {}) }}>
          <div style={S.cardHeader} onClick={() => setSelFam(selFam === f.id ? null : f.id)}>
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              {idx === 0 && <span style={{ fontSize:10, background:'var(--or-deep)', color:'#fff', padding:'2px 6px', borderRadius:8, fontWeight:700 }}>⭐ 1er choix</span>}
              <div style={{ width:28, height:28, borderRadius:'50%', background:f.couleur, flexShrink:0 }}/>
              <div>
                <p style={{ ...S.cardTitle, margin:0 }}>{f.emoji} {f.nom}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', margin:0 }}>{f.style}</p>
              </div>
            </div>
            <span style={S.chevron}>{selFam === f.id ? '▲' : '▼'}</span>
          </div>
          {selFam === f.id && (
            <div style={S.cardBody}>
              <p style={{ fontSize:12, color:'var(--taupe)', marginBottom:6 }}><b>Pour qui :</b> {f.pourQui}</p>
              <p style={{ fontSize:12, color:'var(--taupe)', marginBottom:10 }}><b>Notes :</b> {f.notes}</p>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--or-deep)', marginBottom:6 }}>Références suggérées</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {refsForFam(f.id).map(ref => (
                  <span key={ref} style={{ background:'rgba(210,183,149,0.2)', border:'1px solid var(--or-border)', borderRadius:8, padding:'4px 10px', fontSize:12, fontWeight:600, color:'var(--taupe)' }}>
                    N°{ref}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {!hasFilter && (
        <div style={{ ...S.infoCard, textAlign:'center' }}>
          <p style={{ color:'var(--text-muted)', fontSize:12 }}>Sélectionne le genre, l'âge et les notes pour voir les recommandations</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TAB OBJECTIONS — méthode 4 temps
// ─────────────────────────────────────────────────────────────────
function TabObjections() {
  const [sel, setSel] = useState(null);

  return (
    <div style={S.pad}>
      <div style={S.infoCard}>
        <p style={S.infoTitle}>🛡️ Objections — La méthode 4 temps</p>
        <p style={S.infoText}>
          Une objection n'est pas un refus. C'est une question que la cliente se pose à voix haute.<br/><br/>
          <b>1. J'écoute</b> sans couper&emsp;
          <b>2. Je reformule</b>&emsp;
          <b>3. Je réponds</b> en une phrase&emsp;
          <b>4. Je repropose</b><br/><br/>
          <em>15 secondes suffisent. Plus on se justifie, moins on convainc.</em>
        </p>
      </div>
      {OBJECTIONS_DATA.map((obj, idx) => (
        <div key={idx} style={S.card}>
          <div style={S.cardHeader} onClick={() => setSel(sel === idx ? null : idx)}>
            <p style={S.cardTitle}>❝ {obj.objection}</p>
            <span style={S.chevron}>{sel === idx ? '▲' : '▼'}</span>
          </div>
          {sel === idx && (
            <div style={S.cardBody}>
              {[
                ['🔵 2. Je reformule', obj.reformulation],
                ['🟡 3. Je réponds', obj.reponse],
                ['🟢 4. Je repropose', obj.reproposer],
              ].map(([lab, val]) => (
                <div key={lab} style={{ marginBottom:10 }}>
                  <p style={S.rowLabel}>{lab}</p>
                  <p style={S.rowVal}>{val}</p>
                </div>
              ))}
              <p style={{ fontSize:11, fontWeight:700, color:'var(--or-deep)', margin:'10px 0 6px' }}>Arguments supplémentaires</p>
              {obj.plus.map((p, i) => (
                <p key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>• {p}</p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────
const S = {
  tabsWrap: { display:'flex', overflowX:'auto', borderBottom:'1px solid var(--or-border)', background:'var(--bg-card)', scrollbarWidth:'none' },
  tab: { flex:'0 0 auto', padding:'10px 14px', background:'none', color:'var(--text-muted)', fontSize:11, borderBottom:'2px solid transparent', display:'flex', flexDirection:'column', alignItems:'center', gap:2, whiteSpace:'nowrap' },
  tabActive: { color:'var(--or-deep)', borderBottom:'2px solid var(--or-deep)' },
  tabEmoji: { fontSize:16 },
  tabLabel: { fontSize:10, fontWeight:600 },
  pad: { padding:16 },
  infoCard: { background:'rgba(210,183,149,0.12)', border:'1px solid var(--or-border)', borderRadius:12, padding:'12px 14px', marginBottom:14 },
  infoTitle: { fontSize:12, fontWeight:700, color:'var(--or-deep)', marginBottom:6 },
  infoText: { fontSize:12, color:'var(--text-muted)', lineHeight:1.7 },
  card: { background:'var(--bg-card)', border:'1px solid var(--or-border)', borderRadius:12, marginBottom:10, overflow:'hidden' },
  cardHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', cursor:'pointer', gap:10 },
  cardTitle: { fontSize:13, fontWeight:600, color:'var(--taupe)', margin:0 },
  cardBody: { padding:'0 14px 14px', borderTop:'1px solid var(--or-border)' },
  chevron: { color:'var(--text-muted)', fontSize:10, flexShrink:0 },
  rowLabel: { fontSize:10, fontWeight:700, color:'var(--or-deep)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' },
  rowVal: { fontSize:13, color:'var(--taupe)', lineHeight:1.6, background:'rgba(210,183,149,0.08)', border:'1px solid var(--or-border)', borderRadius:8, padding:'8px 10px' },
  exBox: { background:'rgba(78,70,63,0.06)', border:'1px solid var(--or-border)', borderRadius:10, padding:'10px 12px', marginBottom:4 },
  exTitle: { fontSize:10, fontWeight:700, color:'var(--or-deep)', marginBottom:4 },
  exText: { fontSize:13, fontStyle:'italic', color:'var(--taupe)', lineHeight:1.6, margin:0 },
  textarea: { width:'100%', fontFamily:'inherit', fontSize:13, color:'var(--taupe)', background:'rgba(210,183,149,0.08)', border:'1px solid var(--or-border)', borderRadius:10, padding:'10px 12px', resize:'vertical', lineHeight:1.6, boxSizing:'border-box' },
  filterLabel: { fontSize:11, fontWeight:700, color:'var(--or-deep)', marginBottom:8, marginTop:4 },
  filterRow: { display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 },
  filterBtn: { padding:'7px 14px', borderRadius:20, border:'1px solid var(--or-border)', background:'var(--bg-card)', color:'var(--text-muted)', fontSize:12, cursor:'pointer' },
  filterBtnActive: { background:'var(--or-deep)', color:'#fff', borderColor:'var(--or-deep)', fontWeight:700 },
  // VAMP
  vampCat: { background:'var(--bg-card)', borderRadius:12, marginBottom:10, overflow:'hidden' },
  vampHeader: { display:'flex', alignItems:'center', gap:12, padding:'12px 14px', cursor:'pointer' },
  vampBadge: { width:36, height:36, borderRadius:'50%', color:'#fff', display:'grid', placeItems:'center', fontWeight:900, fontSize:16, flexShrink:0 },
  vampItem: { display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderTop:'1px solid var(--or-border)' },
  vampBtns: { display:'flex', gap:5, flexShrink:0 },
  vampBtn: { width:38, height:38, borderRadius:9, border:'2px solid', fontWeight:900, fontSize:16, cursor:'pointer', display:'grid', placeItems:'center' },
};
