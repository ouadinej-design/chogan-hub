import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';

const OBJECTIONS = [
  // ===== 💰 PRIX - PARFUMS =====
  { cat: "💰 Prix Parfum", q: "35€ c'est trop cher pour un parfum.", a: "Un flacon de 70ml dure jusqu'à 4 mois. Ça fait moins de 9€ par mois — moins qu'un café par semaine pour sentir bon tous les jours." },
  { cat: "💰 Prix Parfum", q: "Je trouve ça cher pour une marque que je ne connais pas.", a: "Chogan s'inspire des plus grandes maisons (Dior, Chanel, YSL) avec les mêmes matières premières, à 3 fois moins cher. Vous payez le parfum, pas la pub." },
  { cat: "💰 Prix Parfum", q: "Un Chanel coûte pareil et c'est une grande marque.", a: "Un Chanel Nº5 100ml coûte 140€ et dure autant qu'un Chogan 35€. Vous payez 105€ de logo." },
  { cat: "💰 Prix Parfum", q: "J'ai trouvé des parfums à 10€ en grande surface.", a: "Ces parfums contiennent surtout de l'alcool et des synthétiques bon marché. Chogan utilise des huiles essentielles qui tiennent 8h sur la peau." },
  { cat: "💰 Prix Parfum", q: "C'est le même prix que des grandes marques en promotion.", a: "En promo, les marques écoulent les fins de stock ou des formulations allégées. Chogan, c'est la même formule toute l'année." },
  { cat: "💰 Prix Parfum", q: "Je peux trouver moins cher sur internet.", a: "Sur internet vous risquez des contrefaçons ou des produits périmés. Chogan, c'est une livraison directe du fabricant, fraîcheur garantie." },
  { cat: "💰 Prix Parfum", q: "35€ par parfum ça fait beaucoup si j'en prends plusieurs.", a: "La plupart de nos clients prennent 2-3 fragrances pour varier selon les occasions. À 35€ l'unité, c'est 105€ pour 3 parfums qui durent chacun 4 mois — imbattable." },
  { cat: "💰 Prix Parfum", q: "Mon budget parfum est de 20€ maximum.", a: "Avec 20€/mois, vous pouvez vous offrir un Chogan tous les 2 mois. Et au bout de 6 mois, vous avez 3 fragrances de qualité premium pour moins de 120€." },
  { cat: "💰 Prix Parfum", q: "Mon parfum actuel dure beaucoup moins cher.", a: "Combien de fois par jour le vaporisez-vous ? Les Chogan sont concentrés à 20-30%, 2 sprays le matin suffisent toute la journée." },
  { cat: "💰 Prix Parfum", q: "Je veux pas payer 35€ sans l'avoir senti avant.", a: "C'est pour ça qu'on fait des présentations — je vous fais sentir votre futur parfum préféré avant toute décision." },
  { cat: "💰 Prix Parfum", q: "Je préfère acheter un grand flacon 200ml moins cher au litre.", a: "Un grand flacon s'oxyde après ouverture et perd ses qualités. 70ml c'est la taille idéale pour utiliser en 3-4 mois à son pic de fraîcheur." },
  { cat: "💰 Prix Parfum", q: "C'est le même prix que le parfum de mes enfants à Noël.", a: "Justement — à ce prix, vous pouvez vous faire plaisir vous-même toute l'année, pas seulement à Noël." },
  // ===== 💰 PRIX - COSMÉTIQUES =====
  { cat: "💰 Prix Cosmétique", q: "Vos crèmes sont plus chères que celles en pharmacie.", a: "Une crème Chogan contient des actifs certifiés sans parabènes, sans sulfates, avec des taux d'actifs naturels bien supérieurs aux marques de pharmacie à prix équivalent." },
  { cat: "💰 Prix Cosmétique", q: "30€ pour une crème visage c'est trop.", a: "Un pot dure 2 à 3 mois avec une utilisation matin et soir. Ça fait 10€/mois pour une peau nourrie avec des ingrédients premium — moins qu'un mascara du commerce." },
  { cat: "💰 Prix Cosmétique", q: "J'achète mes cosmétiques en grande surface, ça me coûte moins cher.", a: "En grande surface, vous payez surtout la communication et le packaging. Chez Chogan, le budget va dans les ingrédients actifs." },
  { cat: "💰 Prix Cosmétique", q: "Je dois déjà acheter plein de produits de beauté, je ne peux pas en ajouter.", a: "Nos gammes sont pensées pour simplifier vos routines. Un produit Chogan peut souvent en remplacer deux ou trois." },
  { cat: "💰 Prix Cosmétique", q: "Les cosmétiques Chogan, ça mérite vraiment ce prix ?", a: "Composés sans substances controversées, testés dermatologiquement, avec des résultats visibles en 4 semaines. Nos clientes les rachètent — c'est la meilleure preuve." },
  // ===== 💰 PRIX - PRODUITS MÉNAGERS =====
  { cat: "💰 Prix Ménager", q: "Vos produits ménagers sont plus chers qu'au supermarché.", a: "Un bidon Chogan concentré remplace jusqu'à 10 bouteilles du commerce. Le coût à l'usage est bien inférieur." },
  { cat: "💰 Prix Ménager", q: "Je trouve des produits à 1€ en discount, pourquoi payer plus ?", a: "Un produit à 1€ qu'on utilise en entier coûte plus cher qu'un concentré Chogan dont on n'utilise que quelques ml par utilisation." },
  { cat: "💰 Prix Ménager", q: "J'ai pas de budget pour des produits ménagers haut de gamme.", a: "Le concentré Chogan vous revient à moins de 50 centimes par nettoyage. C'est moins cher que le discount, avec des formules sans perturbateurs endocriniens." },
  { cat: "💰 Prix Ménager", q: "C'est quoi la différence avec une marque connue ?", a: "Sans chlore, sans phosphates, biodégradables à 95%, efficaces dès la première utilisation. Vous nettoyez mieux en protégeant votre famille et la planète." },
  // ===== 💰 PRIX - COMPLÉMENTS =====
  { cat: "💰 Prix Complément", q: "Vos compléments alimentaires sont trop chers.", a: "Un programme Chogan sur 1 mois revient à 1,50€/jour. Comparez avec ce qu'une fatigue chronique ou un manque d'immunité vous coûte réellement." },
  { cat: "💰 Prix Complément", q: "Je peux acheter des vitamines moins chères en pharmacie.", a: "En pharmacie, vous achetez souvent la notoriété. Nos compléments ont une biodisponibilité étudiée — votre corps absorbe vraiment ce qu'il ingère." },
  { cat: "💰 Prix Complément", q: "C'est trop cher pour quelque chose qu'on ne voit pas.", a: "La santé préventive est un investissement invisible… jusqu'à ce que vous arrêtiez. Nos clients constatent des résultats en 3 à 6 semaines." },
  // ===== 🌸 PARFUM - QUALITÉ & AUTHENTICITÉ =====
  { cat: "🌸 Parfum Qualité", q: "Est-ce que c'est vraiment le même parfum que les grandes marques ?", a: "Chogan est inspiré des grandes maisons mais ce ne sont pas des copies. Ce sont des créations originales avec le même ADN olfactif, souvent jugées préférées en test à l'aveugle." },
  { cat: "🌸 Parfum Qualité", q: "J'ai l'impression que c'est une copie bas de gamme.", a: "Un test à l'aveugle face à votre parfum habituel — vous seriez surpris. La qualité des huiles essentielles Chogan n'a rien à envier aux grandes maisons." },
  { cat: "🌸 Parfum Qualité", q: "Est-ce que ça tient longtemps sur la peau ?", a: "Nos parfums sont concentrés entre 20% et 30% en huiles essentielles. 2 vaporisations le matin tiennent toute la journée, souvent 8 à 10 heures." },
  { cat: "🌸 Parfum Qualité", q: "Je n'aime pas les parfums alcoolisés qui irritent la peau.", a: "Les parfums Chogan sont à faible teneur en alcool et riches en huiles essentielles. Idéals pour les peaux sensibles." },
  { cat: "🌸 Parfum Qualité", q: "Comment je sais que c'est un produit de qualité ?", a: "Fabriqués en Italie avec des ingrédients certifiés, sans allergènes agressifs, IFRA compliant. La qualité est contrôlée à chaque lot." },
  { cat: "🌸 Parfum Qualité", q: "Je ne reconnais pas les noms de vos parfums.", a: "Chogan protège ses formules sous des numéros. Ce que vous reconnaîtrez en revanche, c'est la ressemblance avec votre fragrance préférée." },
  { cat: "🌸 Parfum Qualité", q: "Je suis allergique aux parfums.", a: "Nos formules sont sans les 26 allergènes les plus courants déclarés. Beaucoup de personnes sensibles aux parfums classiques tolerent très bien Chogan." },
  { cat: "🌸 Parfum Qualité", q: "Le sillage n'est pas assez puissant.", a: "Le sillage dépend aussi de votre peau. Sur une peau hydratée, le sillage Chogan est remarquable. Essayez après votre crème corporelle." },
  { cat: "🌸 Parfum Qualité", q: "Je sens le parfum disparaître après 2 heures.", a: "Avez-vous vaporisé sur la peau ou les vêtements ? Sur tissu le sillage dure bien plus longtemps. 2-3 sprays suffisent." },
  { cat: "🌸 Parfum Qualité", q: "Est-ce que le parfum est le même d'un flacon à l'autre ?", a: "Chaque lot est contrôlé pour garantir la constance olfactive. Vous retrouvez exactement la même fragrance à chaque commande." },
  { cat: "🌸 Parfum Qualité", q: "Le flacon n'est pas très luxueux.", a: "L'argent économisé sur le packaging va dans le jus. C'est le choix de Chogan : vous offrir de la qualité dedans, pas un beau miroir dehors." },
  // ===== 🏆 CONCURRENCE - COMPARAISONS MARQUES =====
  { cat: "🏆 Comparaison", q: "Je préfère mon Dior Sauvage, je ne changerai pas.", a: "Sauvage est à 90€ les 100ml. Le Chogan inspiré de Sauvage est à 35€ les 70ml et dure autant. Vous pouvez garder les deux pour 125€ au lieu de 180€." },
  { cat: "🏆 Comparaison", q: "J'ai toujours acheté Chanel, c'est une question d'image.", a: "L'image vous suit, mais personne ne voit la marque dans votre poche. Ce que les gens remarquent, c'est votre fragrance — et elle est magnifique." },
  { cat: "🏆 Comparaison", q: "Les marques de luxe ont une histoire, Chogan non.", a: "Chogan a 20 ans de savoir-faire en Italie. Pas de boutiques sur les Champs-Élysées, mais des milliers de clients fidèles qui rachètent — ça c'est une vraie preuve." },
  { cat: "🏆 Comparaison", q: "J'ai peur que les gens reconnaissent que c'est une imitation.", a: "Personne ne porte une étiquette. Ce qu'on remarque c'est que vous sentez divinement bon — la marque, personne ne le sait." },
  { cat: "🏆 Comparaison", q: "Mon pharmacien me déconseille les parfums sans marque connue.", a: "Chogan est IFRA compliant et respecte toutes les normes européennes. Il peut consulter nos fiches techniques si besoin." },
  { cat: "🏆 Comparaison", q: "Je vois des tas de marques similaires, pourquoi Chogan ?", a: "Chogan est fabricant — pas revendeur. Ils maîtrisent leur formule de A à Z, ce que les marques distributeurs ne font pas." },
  { cat: "🏆 Comparaison", q: "J'ai essayé d'autres marques de parfums inspirés et c'était décevant.", a: "La qualité varie énormément. Chogan travaille avec des nez italiens expérimentés. Faites un test avant de vous décider — vous verrez la différence." },
  { cat: "🏆 Comparaison", q: "Il y a des parfums inspirés en supermarché moins chers.", a: "Ces produits sont souvent dilués à 5-8% d'essence. Chogan est à 20-30%. C'est pour ça que ça tient 8h et pas 2h." },
  // ===== ⏰ TEMPS & DISPONIBILITÉ =====
  { cat: "⏰ Temps", q: "Je n'ai pas le temps de voir une présentation produit.", a: "Je peux vous faire découvrir 3 fragrances en 10 minutes chez vous ou lors d'un café. Pas de présentation PowerPoint, juste sentir et ressentir." },
  { cat: "⏰ Temps", q: "Je commanderai plus tard.", a: "Les stocks de certaines fragrances sont limités. Votre numéro préféré pourrait ne plus être disponible dans 3 semaines." },
  { cat: "⏰ Temps", q: "Je n'ai pas le temps de passer une commande.", a: "La commande prend 3 minutes sur le site ou je m'en occupe pour vous. Vous me donnez le numéro, je fais le reste." },
  { cat: "⏰ Temps", q: "Je vais y penser et vous recontacter.", a: "Bien sûr ! Puis-je vous laisser un échantillon pour que vous ayez le temps de l'essayer sur votre peau avant de décider ?" },
  { cat: "⏰ Temps", q: "Ce n'est pas le bon moment pour acheter des cosmétiques.", a: "Votre peau, elle, n'attend pas. Mais je comprends — voulez-vous qu'on se retrouve dans 2 semaines ?" },
  { cat: "⏰ Temps", q: "Je dois attendre ma prochaine paye.", a: "Tout à fait normal. Notez le numéro qui vous a plu, je le garde de côté pour vous." },
  // ===== 🤝 CONFIANCE & MARQUE =====
  { cat: "🤝 Confiance", q: "Je ne connais pas cette marque.", a: "Chogan existe depuis plus de 20 ans en Italie avec des millions de clients en Europe. Ce que vous ne connaissez pas encore peut devenir votre produit préféré." },
  { cat: "🤝 Confiance", q: "C'est vendu comment ? Je vois pas ça en magasin.", a: "Chogan se vend uniquement par réseau de conseillers indépendants — ce qui permet de maintenir les prix bas en supprimant les intermédiaires." },
  { cat: "🤝 Confiance", q: "C'est du MLM ça ? Je me méfie.", a: "Chogan est une vente directe classique. Vous achetez un produit de qualité au juste prix — sans obligation de recruter ni d'investissement." },
  { cat: "🤝 Confiance", q: "Comment je sais que vous serez encore là dans 6 mois ?", a: "Chogan a 20 ans d'existence et est distribué dans plus de 30 pays. Voici leur site officiel. La stabilité est réelle." },
  { cat: "🤝 Confiance", q: "Est-ce que je peux être remboursé si je n'aime pas ?", a: "Chogan applique un droit de rétractation légal de 14 jours. Votre achat n'est jamais définitif." },
  { cat: "🤝 Confiance", q: "J'ai vu des mauvais avis sur internet.", a: "Montrez-moi lesquels — souvent ce sont des incompréhensions sur la vente directe, pas sur les produits eux-mêmes. Les avis produits sont très positifs." },
  { cat: "🤝 Confiance", q: "Je préfère acheter dans une boutique physique.", a: "Je comprends. Vous pouvez voir, sentir et toucher les produits ici même avec moi — c'est encore mieux qu'en boutique." },
  { cat: "🤝 Confiance", q: "Comment vous êtes payé, vous ?", a: "Je suis conseiller indépendant Chogan. Je touche une commission sur les ventes — comme n'importe quel commercial. Ma motivation c'est votre satisfaction." },
  { cat: "🤝 Confiance", q: "Je veux voir les ingrédients avant d'acheter.", a: "Voici la liste INCI complète. Pas de parabènes, pas de perturbateurs endocriniens — je vous la montre maintenant." },
  { cat: "🤝 Confiance", q: "C'est fait où ces produits ?", a: "Fabriqués en Italie, aux normes européennes les plus strictes. Voici le certificat d'origine." },
  // ===== 🎯 BESOIN & UTILITÉ =====
  { cat: "🎯 Besoin", q: "J'ai déjà un parfum qui me plaît, j'en ai pas besoin.", a: "C'est un très bon signe — ça veut dire que vous aimez sentir bon. Un deuxième parfum pour varier selon les occasions, c'est un luxe accessible à 35€." },
  { cat: "🎯 Besoin", q: "Je ne mets pas souvent du parfum.", a: "Un Chogan qui tient 8h vous donnera peut-être envie d'en mettre plus souvent. C'est ce que disent beaucoup de nos clients au départ." },
  { cat: "🎯 Besoin", q: "Je suis un homme, je ne fais pas attention aux cosmétiques.", a: "Sentir bon et avoir une bonne hygiène, c'est pas du tout féminin. Et nos fragrances masculines sont vraiment remarquables." },
  { cat: "🎯 Besoin", q: "Je fais déjà attention à ce que j'achète, pas besoin de changer.", a: "Chogan s'inscrit justement dans cette démarche : produits sains, sans controversés, fabriqués en Europe. Ça rejoint vos valeurs." },
  { cat: "🎯 Besoin", q: "Je n'ai pas de problème de peau particulier.", a: "Les cosmétiques Chogan ne sont pas que correctifs — ils entretiennent et préviennent. C'est du soin quotidien de qualité." },
  { cat: "🎯 Besoin", q: "Je gère mes acheter cosmétiques seul, je n'ai pas besoin de conseils.", a: "Je ne suis pas là pour vous imposer quoi que ce soit — juste vous faire découvrir des produits que vous ne trouverez pas en magasin." },
  { cat: "🎯 Besoin", q: "J'offre des parfums en cadeau mais je n'en porte pas.", a: "Justement — à 35€ avec une qualité premium, c'est un cadeau qui impressionne sans exploser votre budget." },
  { cat: "🎯 Besoin", q: "Mes enfants achètent déjà leurs produits sur internet.", a: "Chogan n'est pas vendu sur les marketplaces — vous ne pouvez y accéder que par un conseiller. C'est une exclusivité." },
  // ===== 🏠 PRODUITS MÉNAGERS =====
  { cat: "🏠 Ménager", q: "Mes produits ménagers actuels me conviennent très bien.", a: "Je comprends — mais savez-vous ce qu'ils contiennent ? Chogan propose des formules efficaces sans chlore, phosphates, ni perturbateurs endocriniens." },
  { cat: "🏠 Ménager", q: "J'achète en grande quantité au supermarché, c'est plus pratique.", a: "Un concentré Chogan tient dans une bouteille de 1L et remplace 8 à 10 bouteilles du supermarché. Moins de stockage, moins d'emballages." },
  { cat: "🏠 Ménager", q: "J'ai des enfants, j'utilise des produits doux hypoallergéniques.", a: "Justement — les produits Chogan sont parmi les plus adaptés aux foyers avec enfants : sans substances agressives, biodégradables." },
  { cat: "🏠 Ménager", q: "Ça nettoie vraiment aussi bien ?", a: "Nos clients qui testent ne reviennent jamais aux anciens. L'efficacité est supérieure sur les surfaces grasses, avec une fragrance qui reste longtemps." },
  { cat: "🏠 Ménager", q: "Je fais déjà du vinaigre blanc et bicarbonate, j'ai pas besoin de vos produits.", a: "Excellente démarche ! Chogan complète parfaitement avec des formules prêtes à l'emploi pour les tâches plus spécifiques ou complexes." },
  // ===== 💊 COMPLÉMENTS ALIMENTAIRES =====
  { cat: "💊 Compléments", q: "Je ne crois pas aux compléments alimentaires.", a: "Beaucoup de sceptiques l'étaient jusqu'à leur première cure. Nos compléments sont formulés avec des actifs dont l'efficacité est validée scientifiquement." },
  { cat: "💊 Compléments", q: "Mon médecin m'a dit que les compléments c'est inutile.", a: "Certains compléments bon marché le sont effectivement. Ceux de Chogan ont une biodisponibilité étudiée — le corps assimile vraiment les actifs." },
  { cat: "💊 Compléments", q: "Je mange équilibré, j'ai pas besoin de compléments.", a: "Même avec une alimentation équilibrée, les carences modernes (vitamine D, magnésium, oméga-3) sont très répandues. Un bilan sanguin vous le confirmerait." },
  { cat: "💊 Compléments", q: "Je veux pas avaler des pilules tous les jours.", a: "Certains de nos compléments existent en format gouttes, gummies ou poudre. Facile à intégrer à votre routine sans contrainte." },
  { cat: "💊 Compléments", q: "Et s'il y a des effets secondaires ?", a: "Nos compléments sont composés d'actifs naturels aux dosages recommandés. Comme pour tout, en cas de traitement médicamenteux, consultez votre médecin." },
  // ===== 💼 OPPORTUNITÉ BUSINESS =====
  { cat: "💼 Business", q: "Le MLM c'est pas pour moi.", a: "Chogan ce n'est pas du MLM pyramidal — c'est une vente directe classique. Vous vendez des produits que vous aimez, vous touchez une commission. Comme un vendeur indépendant." },
  { cat: "💼 Business", q: "Je ne suis pas commercial, je ne saurais pas vendre.", a: "Vous n'avez pas besoin de vendre — juste partager ce que vous utilisez. Les produits se vendent seuls quand les gens les sentent ou les testent." },
  { cat: "💼 Business", q: "Combien je peux gagner vraiment avec Chogan ?", a: "Ça dépend de votre implication. Des conseillers actifs génèrent entre 300€ et 2000€/mois en complément de revenu. Voici les paliers exacts." },
  { cat: "💼 Business", q: "Il faut investir beaucoup pour démarrer ?", a: "Le kit de démarrage Chogan est accessible — moins de 150€ pour avoir vos produits de démonstration et tout le matériel. Récupéré dès les premières ventes." },
  { cat: "💼 Business", q: "J'ai peur de devoir forcer mes amis à acheter.", a: "Personne ne force personne. Vous proposez — les gens décident. Et souvent, ils reviennent d'eux-mêmes tellement ils aiment les produits." },
  { cat: "💼 Business", q: "Je n'ai pas de réseau suffisant pour vendre.", a: "Votre réseau grandit naturellement quand vous partagez quelque chose de bon. Un seul client satisfait en amène trois autres." },
  { cat: "💼 Business", q: "Ça prend combien de temps par semaine ?", a: "À temps partiel, 5 à 10 heures suffisent pour générer un complément de revenu régulier. Vous organisez vos réunions comme vous le souhaitez." },
  { cat: "💼 Business", q: "Est-ce que je dois créer une entreprise ?", a: "Non — vous pouvez démarrer en tant que particulier. Un statut d'auto-entrepreneur est conseillé pour optimiser vos revenus, mais non obligatoire au départ." },
  { cat: "💼 Business", q: "J'ai déjà essayé un autre réseau et ça n'a pas marché.", a: "Qu'est-ce qui n'a pas fonctionné ? Avec Chogan, vous ne vendez pas un concept abstrait — vous faites sentir un parfum à quelqu'un et il l'achète parce qu'il l'aime vraiment." },
  { cat: "💼 Business", q: "Mes proches vont se moquer de moi.", a: "Vos proches verront vite que vous avez un complément de revenu et des produits qu'ils vous envient. Les moqueries durent moins longtemps que les résultats." },
  { cat: "💼 Business", q: "Je travaille déjà, j'ai pas le temps de faire ça en plus.", a: "La plupart de nos conseillers travaillent à temps plein. Chogan se fait en soirée, le week-end, à votre rythme — sans contraintes d'horaires." },
  { cat: "💼 Business", q: "Et si ça ne marche pas, j'aurai perdu mon investissement.", a: "Votre kit de démarrage vous donne des produits que vous utilisez vous-même. Vous ne perdez rien — vous avez des produits premium pour votre usage personnel." },
  // ===== 🎁 CADEAUX & OCCASIONS =====
  { cat: "🎁 Cadeaux", q: "Pour offrir un parfum, je préfère une grande marque connue.", a: "Vous offrez une fragrance magnifique qui dure 4 mois pour 35€. La personne sera touchée par la qualité — pas par le logo sur la boîte." },
  { cat: "🎁 Cadeaux", q: "Je ne sais pas quel parfum choisir pour offrir.", a: "Dites-moi si c'est pour un homme ou une femme, et si elle préfère les fragrances fraîches, fleuries ou orientales — je vous guide en 2 questions." },
  { cat: "🎁 Cadeaux", q: "Pour un cadeau d'entreprise, c'est trop peu connu.", a: "Pour les cadeaux d'entreprise, nous proposons des coffrets personnalisables avec votre message. L'effet est remarquable." },
  { cat: "🎁 Cadeaux", q: "J'offre toujours les mêmes choses à Noël, un parfum c'est original ?", a: "Un parfum qui dure 4 mois et qui correspond exactement aux goûts de la personne — c'est plus original qu'une bouteille de vin." },
  { cat: "🎁 Cadeaux", q: "C'est quoi le packaging ? Ça fait cadeau ?", a: "Nos coffrets cadeaux sont élégants et raffinés. Le packaging est soigné — votre cadeau arrive habillé comme il se doit." },
  // ===== 🌿 ÉTHIQUE & NATURALITÉ =====
  { cat: "🌿 Éthique", q: "Est-ce que vos produits sont testés sur les animaux ?", a: "Chogan est engagé contre les tests sur animaux. Tous nos produits sont cruelty-free, certifiés conformes à la réglementation européenne." },
  { cat: "🌿 Éthique", q: "Est-ce que c'est bio ?", a: "Certains de nos ingrédients sont d'origine biologique. La gamme entière est formulée sans parabènes, sulfates ni silicones. Voici la liste des certifications." },
  { cat: "🌿 Éthique", q: "Je veux des produits sans perturbateurs endocriniens.", a: "C'est exactement la philosophie Chogan. Voici la liste des substances exclues de toutes nos formulations." },
  { cat: "🌿 Éthique", q: "Je préfère acheter français.", a: "Chogan est une marque italienne fabriquée en Italie — donc en Europe, avec les normes les plus strictes au monde. Made in Italy, c'est aussi une garantie de qualité." },
  { cat: "🌿 Éthique", q: "Vos emballages sont recyclables ?", a: "Nos flacons sont en verre recyclable, nos emballages en carton certifié FSC. Notre impact environnemental est réduit au maximum." },
  { cat: "🌿 Éthique", q: "Je veux savoir d'où viennent les matières premières.", a: "Nos huiles essentielles proviennent de sources certifiées IFRA. Chaque ingrédient est tracé de sa source jusqu'au flacon." },
  // ===== 👨‍👩‍👧 FAMILLE =====
  { cat: "👨‍👩‍👧 Famille", q: "Mon mari/ma femme ne va pas comprendre cet achat.", a: "35€ pour un parfum qui dure 4 mois — c'est moins que beaucoup de dépenses quotidiennes. Et vous pouvez lui faire sentir avant !" },
  { cat: "👨‍👩‍👧 Famille", q: "Mes enfants utilisent beaucoup de produits, je dois limiter le budget.", a: "Nos produits familiaux sont concentrés et économiques à l'usage. Moins de produits différents, moins de dépenses au total." },
  { cat: "👨‍👩‍👧 Famille", q: "Mon fils/ma fille achète déjà des produits de marque.", a: "Pour le même budget, offrez-lui 3 parfums Chogan au lieu d'un seul parfum de grande marque. Il pourra varier selon ses humeurs." },
  { cat: "👨‍👩‍👧 Famille", q: "Je cherche un parfum pour ma fille adolescente.", a: "Nos fragrances légères et fleuries sont parfaites pour les adolescentes. À 35€, c'est le juste prix pour ce public." },
  { cat: "👨‍👩‍👧 Famille", q: "Ma famille ne croit pas trop aux produits de vente directe.", a: "Le meilleur argument c'est d'essayer. Ramenez un échantillon chez vous — vos proches seront peut-être les premiers conquis." },
  // ===== 😟 HÉSITATION =====
  { cat: "😟 Hésitation", q: "J'ai peur de ne pas aimer le parfum une fois reçu.", a: "Je vous fais sentir l'échantillon avant commande. Aucun achat sans votre accord total." },
  { cat: "😟 Hésitation", q: "Et si ça ne correspond pas à ce que j'attends ?", a: "14 jours de rétractation légale. Vous renvoyez, vous êtes remboursé — sans question." },
  { cat: "😟 Hésitation", q: "J'ai peur de prendre la mauvaise fragrance.", a: "Je vous guide avec 3 questions simples. En 5 minutes, je trouve votre fragrance idéale — c'est mon métier." },
  { cat: "😟 Hésitation", q: "Je veux réfléchir encore un peu.", a: "Bien sûr. Puis-je vous laisser un échantillon du numéro qui vous a plu ? Vous décidez une fois que vous l'avez porté." },
  { cat: "😟 Hésitation", q: "Je suis tenté mais j'ai peur de dépenser inutilement.", a: "Divisez 35€ par 120 jours d'utilisation. Ça fait 29 centimes par jour pour sentir extraordinaire. C'est vraiment inutile ?" },
  { cat: "😟 Hésitation", q: "J'ai peur que mon entourage ne le reconnaisse pas.", a: "Votre entourage va vous dire 'tu sens super bon' — pas 'ah c'est du Chanel'. C'est tout ce qui compte." },
  { cat: "😟 Hésitation", q: "Et si la livraison est longue ou abîmée ?", a: "Livraison sous 3 à 5 jours ouvrés avec suivi. Les produits arrivent protégés. En cas de problème, on renvoie immédiatement." },
  // ===== 📱 COMMANDE & LOGISTIQUE =====
  { cat: "📱 Commande", q: "Comment je commande ?", a: "Soit je prends votre commande directement, soit vous commandez sur le site avec mon code conseiller. Livraison à domicile sous 5 jours." },
  { cat: "📱 Commande", q: "Je dois créer un compte quelque part ?", a: "Non obligatoire pour la commande. Mais un compte vous permet de suivre vos commandes et d'accéder aux offres fidélité." },
  { cat: "📱 Commande", q: "Les frais de port sont inclus ?", a: "Les frais de port sont offerts à partir d'un certain montant. Pour une commande unique, ils sont très raisonnables — je vous confirme le total avant." },
  { cat: "📱 Commande", q: "Je veux payer en espèces.", a: "En vente directe, le paiement espèces est possible avec moi. Je vous remets un reçu officiel bien sûr." },
  { cat: "📱 Commande", q: "Est-ce que je peux retourner le produit si je change d'avis ?", a: "Oui — droit de rétractation légal de 14 jours à compter de la réception. Remboursement complet garanti." },
  { cat: "📱 Commande", q: "Combien de temps pour la livraison ?", a: "Généralement 3 à 5 jours ouvrés. Vous recevez un numéro de suivi dès l'expédition." },
  { cat: "📱 Commande", q: "Est-ce que vous livrez en dehors de France ?", a: "Chogan livre dans toute l'Europe. Les délais et frais varient selon le pays — je vous confirme pour le vôtre." },
  // ===== 🌟 FIDÉLITÉ & REACHAT =====
  { cat: "🌟 Fidélité", q: "Est-ce qu'il y a des offres pour les clients réguliers ?", a: "Oui — programme de fidélité avec remises progressives dès le 2ème achat. Plus vous commandez, plus vous économisez." },
  { cat: "🌟 Fidélité", q: "Vous faites des promotions parfois ?", a: "Nous avons des offres saisonnières et des lots exclusifs. Je vous préviens en priorité avant qu'ils partent." },
  { cat: "🌟 Fidélité", q: "Mes produits sont épuisés, comment je recommande ?", a: "Contactez-moi directement ou commandez sur le site avec mon code. Sous 5 jours, c'est chez vous." },
  { cat: "🌟 Fidélité", q: "J'aimerais d'autres fragrances mais je ne sais pas lesquelles.", a: "Je mémorise vos goûts. À chaque nouvelle saison je vous suggère les fragrances qui vous correspondent — c'est mon rôle." },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const R = 23;
const CIRC = 2 * Math.PI * R;

const NUDE = {
  champagne: '#F7EBE1',
  sable: '#EADCC9',
  or: '#D2B795',
  taupe: '#4E463F',
  taupeLight: '#7a6e67',
  taupeXLight: '#b5aca5',
};

function ObjectionsGame() {
  const [deck] = useState(() => shuffle(OBJECTIONS));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [unknown, setUnknown] = useState([]);
  const [timer, setTimer] = useState(10);
  const timerRef = useRef(null);

  const finished = idx >= deck.length;
  const card = deck[idx] || {};

  useEffect(() => {
    if (finished) return;
    setTimer(10);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setFlipped(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [idx, finished]);

  function handleFlip() {
    if (flipped) return;
    clearInterval(timerRef.current);
    setFlipped(true);
  }

  function handleKnown() {
    setKnown(k => [...k, deck[idx]]);
    setFlipped(false);
    setIdx(i => i + 1);
  }

  function handleUnknown() {
    setUnknown(u => [...u, deck[idx]]);
    setFlipped(false);
    setIdx(i => i + 1);
  }

  function restart() {
    setIdx(0);
    setFlipped(false);
    setKnown([]);
    setUnknown([]);
  }

  const timerColor = timer > 6 ? NUDE.or : timer > 3 ? '#c9963a' : '#b5503a';
  const dashOffset = CIRC * (1 - timer / 10);
  const score = known.length;
  const total = deck.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  if (finished) {
    const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "💪" : pct >= 40 ? "📚" : "🔄";
    return (
      <div style={{ minHeight: "100%", background: NUDE.champagne, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Raleway', system-ui, sans-serif" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>{emoji}</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: NUDE.taupe, margin: "0 0 8px", fontFamily: "'Cinzel', serif" }}>Entraînement terminé !</h1>
          <p style={{ color: NUDE.taupeLight, margin: "0 0 24px" }}>Vous avez traité {total} objections Chogan</p>
          <div style={{ background: NUDE.sable, borderRadius: 16, padding: 24, marginBottom: 24, border: `1px solid ${NUDE.or}` }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: pct >= 60 ? '#7a9e7e' : NUDE.or }}>{pct}%</div>
            <div style={{ color: NUDE.taupeLight, fontSize: 14, marginTop: 4 }}>de réponses maîtrisées</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 16 }}>
              <div><div style={{ fontSize: 24, fontWeight: 700, color: '#7a9e7e' }}>{score}</div><div style={{ fontSize: 12, color: NUDE.taupeLight }}>Maîtrisées</div></div>
              <div><div style={{ fontSize: 24, fontWeight: 700, color: '#b5503a' }}>{unknown.length}</div><div style={{ fontSize: 12, color: NUDE.taupeLight }}>À retravailler</div></div>
            </div>
          </div>
          <button onClick={restart} style={{ width: "100%", padding: "14px 24px", background: NUDE.taupe, color: NUDE.champagne, border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Cinzel', serif", letterSpacing: '0.5px' }}>
            🔁 Recommencer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%", background: NUDE.champagne, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px", fontFamily: "'Raleway', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 420, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: NUDE.taupe, fontFamily: "'Cinzel', serif", letterSpacing: '0.5px' }}>CHOGAN — Objections</span>
          <span style={{ fontSize: 13, color: NUDE.taupeLight }}>{idx + 1} / {total}</span>
        </div>
        <div style={{ height: 4, background: NUDE.sable, borderRadius: 99 }}>
          <div style={{ height: "100%", background: NUDE.or, borderRadius: 99, width: `${((idx) / total) * 100}%`, transition: "width 0.3s" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12 }}>
          <span style={{ color: '#7a9e7e', fontWeight: 600 }}>✓ {known.length} maîtrisées</span>
          <span style={{ color: '#b5503a', fontWeight: 600 }}>✗ {unknown.length} à retravailler</span>
        </div>
      </div>

      {/* Stacks + Card area */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", maxWidth: 520 }}>

        {/* Left stack - Unknown */}
        <div style={{ width: 48, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ position: "relative", width: 40, height: 56 }}>
            {unknown.slice(-3).map((_, i) => (
              <div key={i} style={{ position: "absolute", top: i * 2, left: i * 1, width: 38, height: 52, background: '#f5e8e0', border: `1.5px solid ${NUDE.or}`, borderRadius: 6, transform: `rotate(${(i - 1) * 2}deg)` }} />
            ))}
          </div>
          <span style={{ fontSize: 11, color: '#b5503a', fontWeight: 700 }}>{unknown.length}</span>
          <span style={{ fontSize: 9, color: '#b5503a', textAlign: "center" }}>À retravailler</span>
        </div>

        {/* Card */}
        <div style={{ flex: 1 }}>
          {/* Category + Timer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: NUDE.taupe, background: NUDE.sable, padding: "3px 10px", borderRadius: 99, border: `1px solid ${NUDE.or}` }}>{card.cat}</span>
            <svg width="54" height="54" viewBox="0 0 54 54" style={{ flexShrink: 0 }}>
              <circle cx="27" cy="27" r={R} fill="none" stroke={NUDE.sable} strokeWidth="4" />
              <circle cx="27" cy="27" r={R} fill="none" stroke={timerColor} strokeWidth="4"
                strokeDasharray={CIRC} strokeDashoffset={dashOffset}
                strokeLinecap="round" transform="rotate(-90 27 27)"
                style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }} />
              <text x="27" y="32" textAnchor="middle" fontSize="14" fontWeight="800" fill={timerColor}>{timer}</text>
            </svg>
          </div>

          {/* Flip Card */}
          <div onClick={handleFlip} style={{ cursor: flipped ? "default" : "pointer", perspective: 1000, height: 200 }}>
            <div style={{
              position: "relative", width: "100%", height: "100%",
              transition: "transform 0.55s cubic-bezier(0.4,0,0.2,1)",
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)"
            }}>
              {/* Front */}
              <div style={{
                position: "absolute", inset: 0, backfaceVisibility: "hidden",
                background: `linear-gradient(135deg, ${NUDE.taupe} 0%, ${NUDE.taupeLight} 100%)`,
                borderRadius: 16, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", padding: 20,
                boxShadow: `0 8px 32px rgba(78,70,63,0.25)`
              }}>
                <div style={{ fontSize: 11, color: NUDE.sable, marginBottom: 10, letterSpacing: 2, fontFamily: "'Cinzel', serif" }}>OBJECTION CLIENT</div>
                <p style={{ color: NUDE.champagne, fontSize: 17, fontWeight: 600, textAlign: "center", lineHeight: 1.5, margin: 0 }}>« {card.q} »</p>
                <div style={{ marginTop: 16, fontSize: 12, color: NUDE.or }}>Cliquez pour voir la réponse</div>
              </div>
              {/* Back */}
              <div style={{
                position: "absolute", inset: 0, backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                background: NUDE.champagne,
                border: `2px solid ${NUDE.or}`,
                borderRadius: 16, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", padding: 20,
                boxShadow: `0 8px 32px rgba(78,70,63,0.12)`
              }}>
                <div style={{ fontSize: 11, color: NUDE.or, marginBottom: 10, letterSpacing: 2, fontWeight: 700, fontFamily: "'Cinzel', serif" }}>VOTRE RÉPONSE</div>
                <p style={{ color: NUDE.taupe, fontSize: 14, fontWeight: 500, textAlign: "center", lineHeight: 1.6, margin: 0 }}>{card.a}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {flipped && (
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button onClick={handleUnknown} style={{
                flex: 1, padding: "12px 0", background: '#f5ebe8', color: '#b5503a',
                border: `1.5px solid #d4a090`, borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Raleway', sans-serif"
              }}>✗ À retravailler</button>
              <button onClick={handleKnown} style={{
                flex: 1, padding: "12px 0", background: '#edf2ec', color: '#5a8a5e',
                border: `1.5px solid #a8c8aa`, borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Raleway', sans-serif"
              }}>✓ Maîtrisée</button>
            </div>
          )}
        </div>

        {/* Right stack - Known */}
        <div style={{ width: 48, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ position: "relative", width: 40, height: 56 }}>
            {known.slice(-3).map((_, i) => (
              <div key={i} style={{ position: "absolute", top: i * 2, left: i * 1, width: 38, height: 52, background: '#edf2ec', border: `1.5px solid #a8c8aa`, borderRadius: 6, transform: `rotate(${(i - 1) * 2}deg)` }} />
            ))}
          </div>
          <span style={{ fontSize: 11, color: '#5a8a5e', fontWeight: 700 }}>{known.length}</span>
          <span style={{ fontSize: 9, color: '#5a8a5e', textAlign: "center" }}>Maîtrisées</span>
        </div>
      </div>
    </div>
  );
}

export default function Objections() {
  const { user } = useAuth();
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    if (!user || user.role === 'admin') { setAllowed(true); return; }
    const check = async () => {
      try {
        const res = await fetch('/api/data?key=chogan_vip_access');
        const d = await res.json();
        const access = d?.value || JSON.parse(localStorage.getItem('chogan_vip_access') || '{}');
        setAllowed((access[user.id] || []).includes('objections'));
      } catch {
        const access = JSON.parse(localStorage.getItem('chogan_vip_access') || '{}');
        setAllowed((access[user.id] || []).includes('objections'));
      }
    };
    check();
  }, [user]);

  if (allowed === null) return (
    <AppLayout title="Coach Objections" icon="💬">
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Vérification...</div>
    </AppLayout>
  );

  if (!allowed) return (
    <AppLayout title="Coach Objections" icon="💬">
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🔒</p>
        <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>Accès restreint</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Demandez l'accès à votre administratrice.</p>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title="Coach Objections" icon="💬">
      <div style={{ height: 'calc(100vh - 65px)', overflowY: 'auto' }}>
        <ObjectionsGame />
      </div>
    </AppLayout>
  );
}
