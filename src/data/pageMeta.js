// Titre, description et fil d'Ariane de chaque page : source unique utilisée à la fois par le
// pré-rendu (scripts/prerender.js) et par la navigation côté navigateur (usePageMeta), pour que
// Google lise les mêmes balises avant et après l'exécution du JavaScript.
export const HOME_TITLE = 'Chez Lina — Restaurant à Brunoy'

export const pageMeta = {
  '/': {
    description: 'Chez Lina, restaurant franco-africain à Brunoy : l’héritage congolais de Mama Lina porté par ses quatre filles. Réservez ou commandez à emporter.',
  },
  '/la-carte': {
    title: 'La carte du moment à Brunoy',
    crumb: 'La carte du moment',
    description: 'La carte du restaurant franco-africain Chez Lina à Brunoy : viandes et poissons braisés, entrées, cocktails maison et vins. Formules dès 9 €.',
  },
  '/notre-histoire': {
    title: 'Mama Lina, du Congo à Brunoy',
    crumb: 'Mama Lina, du Congo à Brunoy',
    description: 'Mama Lina a apporté sa cuisine congolaise à Brunoy ; ses quatre filles perpétuent aujourd’hui son héritage au restaurant Chez Lina.',
  },
  '/galerie': {
    title: 'Photos du restaurant à Brunoy',
    crumb: 'La maison en images',
    description: 'Découvrez en images les plats, l’ambiance et les gestes du restaurant franco-africain Chez Lina à Brunoy.',
  },
  '/contact': {
    title: 'Nous trouver à Brunoy',
    crumb: 'Chez Lina à Brunoy',
    description: 'Adresse, horaires et moyens de contact du restaurant Chez Lina, 29 rue de Montgeron à Brunoy. Réservez une table ou commandez à emporter.',
  },
  '/cuisine-congolaise-essonne': {
    title: 'Restaurant congolais en Essonne',
    crumb: 'Cuisine congolaise en Essonne',
    description: 'Restaurant congolais à Brunoy (91) : mouton braisé, chikwangue, saka-saka, attiéké, foutou banane. La cuisine de Mama Lina dans le Val d’Yerres.',
  },
  '/a-emporter-brunoy': {
    title: 'Plats à emporter à Brunoy',
    crumb: 'À emporter à Brunoy',
    description: 'Plats à emporter chez Chez Lina, 29 rue de Montgeron à Brunoy : viandes et poissons braisés, formules dès 9 €. Retrait du mardi au dimanche.',
  },
  '/privatisation-brunoy': {
    title: 'Privatiser un restaurant à Brunoy',
    crumb: 'Privatisation et événements',
    description: 'Privatisez Chez Lina à Brunoy pour un anniversaire, un baptême ou un repas d’entreprise : location de salle dès 450 €, devis sous 48 h.',
  },
  '/reservation': {
    title: 'Réserver ou commander à Brunoy',
    crumb: 'Réserver ou commander',
    description: 'Réservez une table ou commandez à emporter au restaurant Chez Lina à Brunoy, en quelques clics via WhatsApp.',
  },
  '/mentions-legales': {
    title: 'Mentions légales',
    crumb: 'Mentions légales',
    description: 'Mentions légales du restaurant Chez Lina à Brunoy : identité de l’entreprise, hébergement et informations réglementaires du site.',
  },
  '/politique-confidentialite': {
    title: 'Politique de confidentialité',
    crumb: 'Politique de confidentialité',
    description: 'Politique de confidentialité du restaurant Chez Lina à Brunoy : données collectées, finalités, durée de conservation et vos droits.',
  },
  '/gestion-des-cookies': {
    title: 'Cookies et services tiers',
    crumb: 'Cookies et services tiers',
    description: 'Cookies et services tiers utilisés sur le site du restaurant Chez Lina à Brunoy : Google Analytics, soumis à votre consentement.',
  },
  '/accessibilite': {
    title: 'Accessibilité',
    crumb: 'Accessibilité',
    description: 'La démarche d’accessibilité numérique du site du restaurant Chez Lina à Brunoy.',
  },
}

export function fullTitle(path) {
  const meta = pageMeta[path]
  return meta?.title ? `${meta.title} — Chez Lina` : HOME_TITLE
}
