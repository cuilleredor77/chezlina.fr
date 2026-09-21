import LegalLayout from '../components/LegalLayout'

export default function PolitiqueConfidentialite() {
  return (
    <LegalLayout crumb="Politique de confidentialité" eyebrow="Vos données" title="Politique de confidentialité" lede="L’essentiel sur vos données.">
      <p><em>Dernière mise à jour : 16 septembre 2026.</em></p>

      <h2>Responsable du traitement</h2>
      <p>
        Chez Lina, SAS au capital social de 1 000 €, SIREN 109 488 429, immatriculée le 9 septembre 2026, dont le siège
        social est situé au 29 rue de Montgeron, 91800 Brunoy — restaurant.chezlina@gmail.com — 06 51 19 77 51.
      </p>

      <h2>Données et finalités</h2>
      <p>
        Le formulaire prépare un message contenant le type de demande, la date, l&rsquo;heure, le nombre de personnes ou de
        portions, le prénom, le téléphone et les précisions utiles. Ces données servent uniquement à répondre à une
        demande de réservation ou de commande et, si la case facultative est cochée, à adresser occasionnellement les
        actualités et offres de Chez Lina par WhatsApp.
      </p>

      <h2>Bases légales</h2>
      <p>
        La gestion de la réservation ou de la commande repose sur les mesures précontractuelles demandées par le client.
        L&rsquo;envoi d&rsquo;actualités et d&rsquo;offres repose sur un consentement distinct, facultatif et révocable à tout moment.
      </p>

      <h2>Transmission à WhatsApp</h2>
      <p>
        Les informations saisies restent dans le navigateur tant que l&rsquo;utilisateur n&rsquo;envoie pas le message.
        L&rsquo;ouverture de WhatsApp affiche le message préparé ; l&rsquo;utilisateur reste libre de le modifier ou de ne pas
        l&rsquo;envoyer. Après l&rsquo;envoi, les données sont traitées dans la messagerie WhatsApp selon les conditions de Meta.
      </p>

      <h2>Destinataires et conservation</h2>
      <p>
        Seules les personnes habilitées à gérer les réservations et commandes de Chez Lina accèdent aux messages. Les
        échanges opérationnels sont conservés pendant le temps nécessaire au traitement et au suivi de la demande, puis
        supprimés lorsqu&rsquo;ils ne sont plus utiles. La preuve d&rsquo;un consentement commercial peut être conservée pendant
        sa durée de validité ; les coordonnées ne sont plus utilisées à des fins commerciales après retrait du
        consentement ou après trois ans sans interaction.
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous pouvez demander l&rsquo;accès, la rectification, l&rsquo;effacement ou la limitation de vos données, vous opposer à
        certains traitements et retirer à tout moment votre consentement commercial en écrivant à
        restaurant.chezlina@gmail.com. Vous pouvez également introduire une réclamation auprès de la CNIL.
      </p>

      <h2>Services externes</h2>
      <p>
        Le site propose des liens vers WhatsApp, Google Maps et Instagram. Aucun contenu provenant de ces services
        n&rsquo;est chargé avant que l&rsquo;utilisateur choisisse de suivre le lien. Ces services appliquent ensuite leurs
        propres politiques de confidentialité.
      </p>
    </LegalLayout>
  )
}
