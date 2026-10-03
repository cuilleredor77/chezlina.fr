// Questions fréquentes : la page contact les affiche toutes, les autres pages celles qui les concernent (champ pages).
// Reprises en données structurées FAQPage sur chaque page qui les affiche (scripts/prerender.js).
// Ne contient que des informations déjà publiées ailleurs sur le site.
export const faq = [
  {
    question: 'Quels sont les horaires du restaurant Chez Lina à Brunoy ?',
    answer: 'Du mardi au vendredi de 11 h 45 à 14 h 45 et de 18 h 45 à 23 h 45, et le samedi en service continu de 11 h 45 à 23 h 45. Le restaurant est fermé le dimanche et le lundi. Le dimanche, la salle peut être privatisée pour vos événements.',
    pages: ['cuisine', 'emporter'],
  },
  {
    question: 'Où se trouve Chez Lina ?',
    answer: 'Au 29 rue de Montgeron, 91800 Brunoy, dans l’Essonne (Val d’Yerres).',
    pages: ['cuisine'],
  },
  {
    question: 'Comment réserver une table ?',
    answer: 'Depuis la page Réserver ou commander du site : le formulaire prépare votre demande et l’envoie sur WhatsApp. Vous pouvez aussi appeler le 06 51 19 77 51.',
    pages: ['privatisation'],
  },
  {
    question: 'Jusqu’à quelle heure peut-on réserver une table ?',
    answer: 'La dernière réservation est possible 45 minutes avant la fermeture : jusqu’à 14 h le midi et 23 h le soir du mardi au vendredi, et jusqu’à 23 h le samedi.',
    pages: [],
  },
  {
    question: 'Peut-on commander à emporter ?',
    answer: 'Oui, du mardi au samedi aux horaires d’ouverture. Passez commande depuis la page Réserver ou commander, en choisissant un créneau de retrait au moins 30 minutes plus tard, ou appelez le 06 51 19 77 51.',
    pages: ['emporter'],
  },
  {
    question: 'Jusqu’à quelle heure peut-on retirer une commande à emporter ?',
    answer: 'Le dernier retrait est possible 15 minutes avant la fermeture : jusqu’à 14 h 30 le midi et 23 h 30 le soir du mardi au vendredi, et jusqu’à 23 h 30 le samedi. Il n’y a pas de vente à emporter le dimanche ni le lundi.',
    pages: ['emporter'],
  },
  {
    question: 'Quelle cuisine sert Chez Lina ?',
    answer: 'Une cuisine franco-africaine héritée de Mama Lina et de ses racines congolaises : viandes et poissons braisés, sauces maison, chikwangue, saka-saka, attiéké, foutou banane et alloco, travaillés avec les gestes de la cuisine française.',
    pages: ['cuisine', 'privatisation'],
  },
  {
    question: 'Qu’est-ce que la chikwangue et le saka-saka ?',
    answer: 'Deux classiques de la cuisine congolaise à base de manioc. La chikwangue est un pain de manioc fermenté, cuit enveloppé dans des feuilles. Le saka-saka (ou pondu) est un plat de feuilles de manioc pilées et longuement mijotées. Chez Lina, la chikwangue accompagne le mouton braisé et le saka-saka se retrouve dans une entrée de la carte.',
    pages: ['cuisine'],
  },
  {
    question: 'Proposez-vous des formules pas chères ?',
    answer: 'Oui : menu collégien et lycéen à 9 €, formule étudiante à 15 € (sur présentation de la carte étudiante), formule du midi à 25 € ou 30 €, du mardi au vendredi le midi. La formule enfant à 12 € est proposée à chaque service.',
    pages: ['cuisine', 'emporter'],
  },
  {
    question: 'Peut-on privatiser le restaurant ?',
    answer: 'Oui, pour un anniversaire, un baptême ou un repas d’entreprise, le midi, le soir ou toute la journée. La location de la salle démarre à 450 €, le repas est en supplément selon le menu choisi. Les demandes se font au moins 72 h à l’avance ; un devis personnalisé est envoyé sous 48 h.',
    pages: ['privatisation'],
  },
  {
    question: 'Peut-on privatiser la salle le dimanche ?',
    answer: 'Oui. Le restaurant est fermé au public le dimanche, mais la salle peut être privatisée ce jour-là pour vos événements. Faites votre demande au moins 72 h à l’avance depuis le site ou au 06 51 19 77 51.',
    pages: ['privatisation'],
  },
]

export function faqFor(page) {
  return faq.filter((item) => item.pages.includes(page))
}
