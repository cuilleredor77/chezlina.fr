export const formules = {
  note: 'Formules collégien & lycéen, étudiante et du midi : du mardi au vendredi, le midi uniquement. Formule enfant : à chaque service.',
  items: [
    {
      name: 'Formule enfant',
      subtitle: 'Plat + dessert + boisson',
      price: '12 €',
      description: 'Suprême de volaille & frites · Boisson soft au choix · 1 boule de glace ou moelleux au chocolat',
      note: 'Jusqu’à 12 ans · À chaque service.',
    },
    {
      name: 'Menu collégien & lycéen',
      subtitle: 'Plat + boisson + dessert',
      price: '9 €',
      description: 'Poulet braisé · Frites ou riz · Canette au choix · Petit moelleux au chocolat',
    },
    {
      name: 'Formule étudiante',
      subtitle: 'Plat du jour + boisson',
      price: '15 €',
      description: 'Sur présentation de la carte étudiante.',
    },
    {
      name: 'Formule du midi *',
      lines: [
        { label: 'Entrée + plat ou plat + dessert', price: '25 €' },
        { label: 'Entrée + plat + dessert', price: '30 €' },
      ],
      description: '* Café ou thé gourmand : +2 €.',
    },
  ],
}

export const menuSections = [
  {
    eyebrow: 'À TABLE',
    title: 'Les viandes',
    column: 'left',
    items: [
      { name: 'Suprême de volaille', description: 'Sauce poulette, riz délicatement parfumé au gingembre, à la noix de coco et au citron.', price: '19 €', image: '/images/poulet-braise-riz-rouge-detail.jpeg' },
      { name: 'Mouton braisé', description: 'Chikwangue.', price: '20 €', image: '/images/mouton-braise.webp' },
      { name: '4 brochettes de bœuf', description: 'Sauce aux trois poivrons, riz rouge.', price: '18 €', image: '/images/brochettes-boeuf.webp' },
    ],
  },
  {
    eyebrow: 'À TABLE',
    title: 'Les poissons',
    column: 'left',
    items: [
      { name: 'Dorade braisée', description: 'Sauce vierge, tomate, mangue verte et herbes fraîches, attiéké.', price: '20 €', image: '/images/dorade-braisee.webp' },
      { name: 'Panga braisé', description: 'Sauce aux trois poivrons, foutou banane.', price: '25 €', image: '/images/panga-braise.jpg' },
    ],
  },
  {
    eyebrow: 'POUR COMMENCER',
    title: 'Les entrées',
    column: 'right',
    items: [
      { name: 'Tempura de manioc', description: 'Mayonnaise au basilic frais.', price: '7 €', image: '/images/morue-frite.webp' },
      { name: 'Aubergine braisée en brochette', description: 'Crème de maïs onctueuse, salade d’herbes fraîches et confiture de tamarin.', price: '7 €', image: '/images/aubergine-signature.webp' },
      { name: 'Tarte fine tomate et burrata', description: 'Saka-saka, sauce vierge à la tomate et au bissap, salade d’herbes fraîches et burrata crémeuse.', price: '10 €', image: '/images/entree-signature.webp' },
      { name: 'Planche à partager', description: 'Sélection du chef.', priceOptions: [{ label: '10 pièces', price: '15 €' }, { label: '25 pièces', price: '28 €' }], image: '/images/plateau-bouchees-reportage.webp' },
    ],
  },
  {
    eyebrow: 'EN SUPPLÉMENT',
    title: 'Les accompagnements',
    column: 'right',
    items: [
      { name: 'Riz blanc', price: '4 €' },
      { name: 'Chikwangue', price: '5 €' },
      { name: 'Attiéké', price: '5 €' },
      { name: 'Alloco makemba', price: '5 €' },
      { name: 'Foutou banane', price: '5 €' },
      { name: 'Riz rouge', price: '5 €' },
    ],
  },
  {
    eyebrow: 'LA NOTE DOUCE',
    title: 'Les desserts',
    column: 'right',
    dark: true,
    items: [
      { name: 'Beignets, sauce à l’arachide', description: 'Une douceur chaude à partager.', price: '6 €' },
      { name: 'Riz au lait revisité', description: 'Pâte filo croustillante, ananas rôti, mousse de riz, caramel et poivre blanc de Penja.', price: '8 €' },
      { name: 'Café ou thé gourmand', description: 'Une sélection de mignardises de la maison.', price: '11 €' },
    ],
  },
]

export const drinksSections = [
  {
    title: 'Boissons chaudes',
    items: [
      { name: 'Café', price: '2,50 €' },
      { name: 'Thé', price: '3,50 €' },
    ],
  },
  {
    title: 'Softs',
    items: [
      { name: 'Coca', price: '4 €' },
      { name: 'Fanta', price: '4 €' },
      { name: 'Ice Tea', price: '4 €' },
    ],
  },
  {
    title: 'Bières',
    items: [
      { name: 'Heineken 33 cl', price: '5 €' },
      { name: 'Desperados 33 cl', price: '5 €' },
      { name: 'Guinness 33 cl', price: '5 €' },
      { name: 'Bière pression 25 cl', price: '5 €' },
      { name: 'Bière pression 50 cl', price: '9 €' },
    ],
  },
]

export const cocktailSections = [
  {
    title: 'Cocktails',
    items: [
      { name: 'Daiquiri', tag: 'Fruité et raffiné.', price: '11 €', image: '/images/cocktails/daiquiri.jpg' },
      { name: 'Mojito', tag: 'Le classique indémodable.', price: '11 €', image: '/images/cocktails/mojito.jpg' },
      { name: 'Piña Colada', tag: 'Douceur et évasion.', price: '12 €', image: '/images/cocktails/pina-colada.jpg' },
      { name: 'Hawaïen Blue', tag: 'Un goût de tropiques.', price: '12 €', image: '/images/cocktails/hawaien-blue.jpg' },
      { name: 'Tequila Sunrise', tag: 'Un lever de soleil en verre.', price: '11 €', image: '/images/cocktails/tequila-sunrise.jpg' },
      { name: 'Moscow Mule', tag: 'L’audace en fraîcheur.', price: '11 €', image: '/images/cocktails/moscow-mule.jpg' },
      { name: 'Spritz Aperol', tag: 'L’instant chill.', price: '11 €', image: '/images/cocktails/spritz-aperol.jpg' },
      { name: 'Spritz Campari', tag: 'Corsé et vibrant.', price: '11 €', image: '/images/cocktails/spritz-campari.jpg' },
      { name: 'Pornstar Martini', tag: 'Glamour et passion.', price: '13 €', image: '/images/cocktails/pornstar.jpg' },
      { name: 'Sex on the Beach', tag: 'Sucré et solaire.', price: '12 €', image: '/images/cocktails/sex-on-the-beach.jpg' },
      { name: 'Joséphine Baker', tag: 'Passion, fraîcheur, caractère.', price: '12 €', image: '/images/cocktails/josephine-baker.jpg' },
      { name: 'Mimosa', tag: 'L’élégance à toute heure.', price: '9 €', image: '/images/cocktails/mimosa.jpg' },
      { name: 'Punch maison', tag: 'Généreux et convivial.', price: '8 €', image: '/images/cocktails/punch-maison.jpg' },
    ],
  },
  {
    title: 'Mocktails (sans alcool)',
    items: [
      { name: 'Mojito sans alcool', tag: 'Fraîcheur sans excès.', price: '9 €', image: '/images/cocktails/mojito-sans-alcool.jpg' },
      { name: 'Piña Colada sans alcool', tag: 'Douceur tropicale, sans alcool.', price: '9 €', image: '/images/cocktails/pina-colada-sans-alcool.jpg' },
      { name: 'Sex on the Beach sans alcool', tag: 'Plaisir sans alcool.', price: '9 €', image: '/images/cocktails/sex-on-the-beach-sans-alcool.jpg' },
      { name: 'Gingembre maison', tag: 'Piquant et vivifiant.', price: '7 €', image: '/images/cocktails/gingembre-maison.jpg' },
      { name: 'Bissap maison', tag: 'L’authenticité autrement.', price: '7 €', image: '/images/cocktails/bissap-maison.jpg' },
    ],
  },
]

export const wineSections = [
  {
    title: 'Vins blancs',
    items: [
      { name: 'IGP d’Oc Viognier, Domaine Combe Saint-Paul', glass: '6 €', bottle: '24 €' },
      { name: 'Touraine Sauvignon, Domaine du Vieil Orme', glass: '7 €', bottle: '29 €' },
      { name: 'Chablis, Vignoble Angst', glass: '9 €', bottle: '36 €' },
      { name: 'Saint-Joseph blanc, Domaine Barou', bottle: '39 €' },
    ],
  },
  {
    title: 'Vins rouges',
    items: [
      { name: 'Bordeaux supérieur Saint-Hilaire, Fabien Lapeyre', glass: '7 €', bottle: '27 €' },
      { name: 'Chinon Clos de la Vaubelle, Domaine Dudognon', glass: '8 €', bottle: '29 €' },
      { name: 'Gigondas, Château Croix des Pins', bottle: '39 €' },
    ],
  },
  {
    title: 'Champagne',
    items: [
      { name: 'Champagne brut Guillemart', glass: '12 €', bottle: '59 €' },
    ],
  },
]
