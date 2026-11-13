// Contrat de réservation Chez Lina, généré depuis une fiche du CRM (#/contrat/ID), imprimable en PDF.
// Repris de la structure du contrat Cuillère d'Or (objet, conditions financières, organisation, obligations,
// responsabilité, annulation, réclamations, droit applicable, droit à l'image), adapté au restaurant.
// Utilise les fonctions de app.js (chargé avant). Les délais ci-dessous sont des propositions à valider.
'use strict';

const CONTRAT = {
  annulation: [
    'Plus de 30 jours avant l’événement : l’acompte est remboursé, ou reporté sur une nouvelle date dans les 6 mois.',
    'Entre 30 et 8 jours avant l’événement : l’acompte reste acquis à Chez Lina.',
    'Moins de 8 jours avant l’événement : 50 % du montant total est dû.',
    'Moins de 72 h avant l’événement ou absence le jour même : 100 % du montant total est dû.',
  ],
  reclamationJours: 2,
  modesPaiement: ['Carte bancaire', 'Espèces', 'Virement bancaire'],
  mediateur: '', // médiateur de la consommation : à compléter (obligatoire pour les clients particuliers)
};

const onSite = (d) => ['privatisation', 'groupe', 'evenement'].includes(d.type);

function contratLinesTable(d) {
  const v = d.devis;
  const secs = sectionsOf(v.lines);
  const showSecs = secs.length > 1 || (secs[0] && secs[0] !== '');
  return '<table class="d-tab"><thead><tr><th>Désignation</th><th class="r">Quantité</th><th class="r">Prix unitaire TTC</th><th class="r">Total TTC</th></tr></thead><tbody>' +
    (v.lines.length ? secs.map((sec) => (showSecs ? '<tr class="dsec"><td colspan="4">' + esc(sec || 'Divers') + '</td></tr>' : '') + v.lines.filter((l) => (l.section || '') === sec).map((l) =>
      '<tr><td><b>' + esc(l.label) + '</b>' + (l.detail ? '<div class="dd">' + esc(l.detail) + '</div>' : '') + '</td><td class="r">' + esc(String(l.qty).replace('.', ',')) + ' ' + esc(unitTxt(l.qty, l.unit)) + '</td><td class="r">' + eur(l.price) + '</td><td class="r">' + eur(lineTotal(l)) + '</td></tr>').join('')).join('')
      : '<tr><td colspan="4">Prestations à définir.</td></tr>') +
    '<tr class="dsec"><td colspan="3">Total TTC</td><td class="r">' + eur(totals(d).total) + '</td></tr></tbody></table>';
}

function contratFileName(d) { return fileName(d).replace(/_Devis(_v\d+)?$/, '_Contrat$1'); }

function renderContrat(id) {
  const d = byId(id), v = d.devis, t = totals(d), s = DB.settings;
  const cr = CRENEAUX[d.creneau] || CRENEAUX.autre;
  const typeLabel = (TYPES[d.type] || {}).label || 'Prestation';
  const quand = (d.date ? dateFR(d.date, true) : 'date à préciser') + ', ' + cr.label.toLowerCase() + (cr.heures ? ' (' + cr.heures + ')' : '') + (d.heure ? ', arrivée à ' + d.heure : '');
  const invites = !onSite(d) ? guests(d) + ' personne' + (guests(d) > 1 ? 's' : '') : (Number(d.adultes) || 0) + ' adulte' + (Number(d.adultes) > 1 ? 's' : '') + (Number(d.enfants) ? ' et ' + d.enfants + ' enfant' + (Number(d.enfants) > 1 ? 's' : '') : '');
  const issued = dateFR(todayISO());
  const modes = CONTRAT.modesPaiement.map((m) => m === 'Virement bancaire' && s.iban ? m + ' : IBAN ' + s.iban + ' (titulaire : ' + LINA.societe + ')' : m);
  const P = (x) => '<p>' + x + '</p>';
  const UL = (arr) => '<ul>' + arr.map((x) => '<li>' + x + '</li>').join('') + '</ul>';
  let n = 0;
  const A = (title) => '<h3>ARTICLE ' + (++n) + ' — ' + title + '</h3>';

  let body = '';
  // 1. Objet
  body += A('OBJET');
  body += P('Le présent contrat confirme la réservation suivante : <b>' + esc(typeLabel) + (d.occasion ? ' · ' + esc(d.occasion) : '') + '</b>, le <b>' + esc(quand) + '</b>, pour <b>' + esc(invites) + '</b>' +
    (onSite(d) ? ', au restaurant Chez Lina, ' + esc(LINA.adresse) + '.' : d.type === 'traiteur' && d.livraison ? ', livrée à l’adresse : ' + esc(d.adresseLivraison || 'à préciser') + '.' : ', à retirer au restaurant Chez Lina, ' + esc(LINA.adresse) + '.'));
  body += P('Les prestations commandées sont celles du devis n° ' + esc(d.ref) + (v.version > 1 ? ' (version ' + v.version + ')' : '') + ', rappelées ci-dessous :');
  body += contratLinesTable(d);
  if (v.remarks) body += P('<b>Précisions :</b> ' + esc(v.remarks));
  body += P('Toute modification importante (date, créneau, nombre d’invités, menu) fait l’objet d’un avenant écrit, accepté par les deux parties. À défaut, le présent contrat s’applique dans sa version d’origine.');

  // 2. Conditions financières
  body += A('CONDITIONS FINANCIÈRES');
  body += UL([
    'Montant total : <b>' + eur(t.total) + ' TTC</b>' + (t.missing ? ' (hors ' + t.missing + ' ligne(s) restant à chiffrer)' : ''),
    'Acompte de ' + t.pct + ' % : <b>' + eur(t.deposit) + '</b>, à verser à la signature du présent contrat',
    'Solde : <b>' + eur(t.balance) + '</b>, à régler ' + esc(s.balanceWhen),
  ]);
  body += P('La réservation de la date n’est garantie qu’à réception du contrat signé et de l’acompte.');
  body += P('Les consommations supplémentaires commandées le jour même (boissons, plats, desserts) sont facturées au prix de la carte et réglées à la fin de l’événement.');
  body += P('<b>Modes de paiement acceptés :</b>');
  body += UL(modes.map(esc));

  // 3. Organisation
  if (onSite(d)) {
    body += A('MISE À DISPOSITION DE LA SALLE');
    body += '<h4>' + n + '.1 – Horaires</h4>' + P('La salle est mise à disposition sur le créneau réservé' + (cr.heures ? ' (' + cr.heures + ')' : '') + '. Toute arrivée anticipée ou tout dépassement de l’horaire de fin doit être convenu à l’avance avec l’équipe et peut faire l’objet d’une facturation complémentaire.');
    if (d.type === 'privatisation') body += '<h4>' + n + '.2 – Exclusivité</h4>' + P('Pendant le créneau réservé, la salle est fermée au public et réservée aux invités du Client.');
    else body += '<h4>' + n + '.2 – Placement</h4>' + P('Le groupe est accueilli dans la salle ouverte au public, sur les tables réservées pour lui. L’emplacement est choisi par l’équipe selon le nombre d’invités.');
    body += '<h4>' + n + '.3 – Capacité</h4>' + P('Le nombre d’invités ne peut dépasser la capacité d’accueil de la salle, fixée par les règles de sécurité. L’équipe peut refuser l’entrée au-delà de cette capacité.');
    body += '<h4>' + n + '.4 – Décoration et musique</h4>' + P('La décoration apportée par le Client est installée et retirée par ses soins, sans clous, adhésifs ni produits salissants (confettis, paillettes, bougies à flamme nue sans accord). Le volume de la musique reste compatible avec le voisinage ; la musique s’arrête à la fin du créneau réservé.');
    body += '<h4>' + n + '.5 – Produits apportés</h4>' + P('Aucun plat ni aucune boisson extérieurs ne sont admis, sauf accord écrit préalable (par exemple un gâteau d’anniversaire). Les produits apportés restent sous la responsabilité du Client et de son fournisseur.');
    body += '<h4>' + n + '.6 – Service et équipe</h4>' + P('Le service est assuré par l’équipe de Chez Lina, seule habilitée à organiser la salle et la cuisine. Les demandes des invités qui modifient la commande sont soumises à l’accord du Client et facturées en supplément.');
  } else {
    body += A(d.type === 'traiteur' && d.livraison ? 'LIVRAISON' : 'RETRAIT DE LA COMMANDE');
    body += d.type === 'traiteur' && d.livraison
      ? P('La commande est livrée à l’adresse et à l’heure convenues. Le Client, ou une personne qu’il désigne, réceptionne la commande et vérifie sa conformité à la livraison. Les frais de livraison sont indiqués au devis.')
      : P('La commande est à retirer au restaurant, ' + esc(LINA.adresse) + ', le ' + esc(quand) + '. Le Client vérifie sa commande au moment du retrait.');
    body += P('Dès la remise de la commande, sa conservation (au froid, entre 0 et 4 °C pour les plats froids) et son réchauffage relèvent de la responsabilité du Client. Les plats sont à consommer dans les 24 h.');
  }

  // 4. Obligations du client
  body += A('MENU, ALLERGIES ET NOMBRE D’INVITÉS');
  body += P('Le Client confirme le menu définitif, la liste complète des allergies et régimes particuliers, et le nombre définitif d’invités au plus tard <b>72 h avant l’événement</b>. Ce nombre sert de base à la facture : une baisse annoncée après ce délai ne donne lieu à aucune réduction.');
  body += P('Passé ce délai, Chez Lina ne peut être tenue responsable d’un incident lié à une information non transmise. Les plats peuvent contenir des allergènes (notamment arachide, gluten, lait, œuf, poisson) : la liste est disponible sur demande.');
  body += P('En cas d’indisponibilité exceptionnelle d’un produit, Chez Lina peut le remplacer par un produit de qualité équivalente, sans changement de prix, en prévenant le Client.');
  if (onSite(d)) {
    body += A('OBLIGATIONS DU CLIENT');
    body += P('Le Client est responsable du comportement de ses invités. Toute dégradation, casse ou perte du matériel et du mobilier du restaurant lui est refacturée au prix de remplacement.');
    body += P('Conformément à la loi, aucune boisson alcoolisée n’est servie aux mineurs ni aux personnes manifestement ivres. Les mineurs restent sous la surveillance de leurs parents ou accompagnateurs.');
    body += P('Le Client s’engage à garantir des conditions de travail respectueuses à l’équipe. Tout comportement injurieux ou violent peut entraîner l’arrêt immédiat de la prestation, sans remboursement.');
  }

  // Responsabilité
  body += A('RESPONSABILITÉ ET FORCE MAJEURE');
  body += P('La responsabilité de Chez Lina est limitée au montant des sommes encaissées au titre du présent contrat. Chez Lina n’est pas responsable des objets personnels des invités ni des produits apportés par le Client.');
  body += P('En cas de force majeure au sens de l’article 1218 du Code civil rendant la prestation impossible, les sommes versées sont intégralement remboursées, sans autre indemnité de part et d’autre.');

  // Annulation
  body += A('ANNULATION');
  body += '<h4>' + n + '.1 – Annulation par le Client</h4>' + P('Toute annulation est notifiée par écrit (e-mail à ' + esc(LINA.email) + ').') + UL(CONTRAT.annulation.map(esc));
  body += '<h4>' + n + '.2 – Annulation par Chez Lina</h4>' + P('En cas d’annulation à l’initiative de Chez Lina, hors force majeure, l’intégralité des sommes versées est remboursée.');

  // Réclamations
  body += A('RÉCLAMATIONS');
  body += P('Toute réclamation est adressée par écrit à ' + esc(LINA.email) + ' au plus tard ' + CONTRAT.reclamationJours + ' jours ouvrés après l’événement.');

  // Droit applicable
  body += A('DROIT APPLICABLE ET MÉDIATION');
  body += P('Le présent contrat est soumis au droit français. En cas de litige, les parties recherchent d’abord une solution amiable.' +
    (CONTRAT.mediateur ? ' Le Client consommateur peut recourir gratuitement au médiateur de la consommation : ' + esc(CONTRAT.mediateur) + '.' : ' Le Client consommateur peut recourir gratuitement à un médiateur de la consommation.'));

  // Droit à l'image
  if (onSite(d)) {
    body += A('DROIT À L’IMAGE');
    body += P('Chez Lina peut photographier les plats et la salle décorée pour sa communication (site, réseaux sociaux), sans montrer le visage des invités sans leur accord.');
    body += '<p class="c-check">Le Client <span class="box"></span> <b>accepte</b> &nbsp; <span class="box"></span> <b>refuse</b> cette utilisation.</p>';
  }

  document.title = contratFileName(d);
  app().innerHTML =
    '<div class="doc-bar no-print"><a class="btn" href="#/fiche/' + d.id + '">← Retour à la fiche</a><a class="btn" href="#/devis/' + d.id + '">Voir le devis</a><button class="btn primary" onclick="window.print()">Imprimer / enregistrer en PDF</button>' +
    '<span class="small muted" style="align-self:center">Nom du fichier proposé : ' + esc(contratFileName(d)) + '.pdf</span></div>' +
    (t.missing ? '<div class="alert no-print" style="max-width:210mm;margin:0 auto 12px">' + t.missing + ' ligne(s) du devis encore « à chiffrer » : renseigner le prix avant de faire signer.</div>' : '') +
    (CONTRAT.mediateur ? '' : '<div class="alert no-print" style="max-width:210mm;margin:0 auto 12px">Médiateur de la consommation à compléter dans <code>contrat.js</code> (obligatoire pour les clients particuliers).</div>') +
    '<article class="doc contract">' +
      '<header class="d-head"><img src="logo-chez-lina.png" alt="Chez Lina"><div class="d-co"><b>Chez Lina</b>Cuisine franco-africaine<br>' + esc(LINA.adresse) + '<br>' + esc(LINA.tel) + ' · ' + esc(LINA.email) + '<br>' + esc(LINA.site) + '</div>' +
      '<div class="d-title"><h1 style="font-size:26px">CONTRAT</h1><div>de réservation<br>Réf. ' + esc(d.ref) + '<br>Devis du ' + esc(dateFR(v.issuedOn)) + '</div></div></header>' +
      '<div class="d-blocks">' +
        '<div class="d-box"><h2>Chez Lina</h2><p><b>' + esc(LINA.societe) + '</b><br>' + esc(LINA.adresse) + '<br>SIRET ' + esc(LINA.siret) + '<br>ci-après « Chez Lina »</p></div>' +
        '<div class="d-box"><h2>Le Client</h2><p><b>' + esc(d.clientName) + '</b>' + (d.company ? '<br>' + esc(d.company) : '') + (d.adresse ? '<br>' + esc(d.adresse) : '') + (d.phone ? '<br>' + esc(d.phone) : '') + (d.email ? '<br>' + esc(d.email) : '') + '<br>ci-après « le Client »</p></div>' +
      '</div>' +
      '<section class="c-body">' + body + '</section>' +
      '<p style="margin-top:14px">Fait en deux exemplaires, à Brunoy, le ' + esc(issued) + '.</p>' +
      '<div class="d-sign"><div><b>Pour Chez Lina</b>' + esc(LINA.societe) + '</div><div><b>Le Client</b>Date, nom et signature, précédés de la mention « Lu et approuvé, bon pour accord »</div></div>' +
      '<footer class="d-foot"><b>' + esc(LINA.societe) + '</b> · Chez Lina · ' + esc(LINA.adresse) + ' · SIRET ' + esc(LINA.siret) + '<br>' + esc(LINA.tel) + ' · ' + esc(LINA.email) + ' · ' + esc(LINA.site) + '<br>' + esc(LINA.horaires) + '</footer>' +
    '</article>';
}

// app.js affiche la page avant le chargement de ce fichier : réafficher si l'adresse vise un contrat.
if (/^#\/contrat\//.test(location.hash)) route();
