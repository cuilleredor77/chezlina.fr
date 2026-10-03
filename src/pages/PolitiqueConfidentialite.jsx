import { Link } from 'react-router-dom'
import LegalLayout from '../components/LegalLayout'

export default function PolitiqueConfidentialite() {
  return (
    <LegalLayout crumb="Politique de confidentialité" eyebrow="Vos données" title="Politique de confidentialité" lede="L’essentiel sur vos données.">
      <p><em>Dernière mise à jour : 3 octobre 2026.</em></p>

      <h2>Responsable du traitement</h2>
      <p>
        LES QUATRE FILLES LINA (enseigne « Chez Lina »), SAS au capital social de 1 000 €, SIREN 109 488 429,
        immatriculée le 9 septembre 2026, dont le siège social est situé au 29 rue de Montgeron, 91800 Brunoy —
        contact@chezlina.fr — 06 51 19 77 51.
      </p>

      <h2>Données et finalités</h2>
      <p>
        Le formulaire prépare un message contenant le type de demande, la date, l&rsquo;heure ou le créneau, le nombre de
        personnes ou d&rsquo;invités, les plats commandés, le nom, le téléphone, l&rsquo;adresse e-mail si elle est indiquée et les
        précisions utiles. Ces données servent uniquement à répondre à une demande de réservation, de commande à emporter
        ou de privatisation et, si la case facultative est cochée, à adresser occasionnellement les actualités et offres
        de Chez Lina par WhatsApp.
      </p>

      <h2>Bases légales</h2>
      <p>
        La gestion de la réservation ou de la commande repose sur les mesures précontractuelles demandées par le client.
        L&rsquo;envoi d&rsquo;actualités et d&rsquo;offres repose sur un consentement distinct, facultatif et révocable à tout moment.
      </p>

      <h2>Transmission par WhatsApp ou par e-mail</h2>
      <p>
        Les informations saisies restent dans le navigateur tant que l&rsquo;utilisateur n&rsquo;envoie pas le message. Les
        réservations de table et les commandes à emporter ouvrent WhatsApp avec le message préparé ; les demandes de
        privatisation ouvrent la messagerie e-mail de l&rsquo;utilisateur, adressée à contact@chezlina.fr. Dans les deux cas,
        l&rsquo;utilisateur reste libre de modifier le message ou de ne pas l&rsquo;envoyer. Après l&rsquo;envoi, les données sont
        traitées dans WhatsApp selon les conditions de Meta, ou dans la boîte e-mail de Chez Lina.
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
        contact@chezlina.fr. Vous pouvez également introduire une réclamation auprès de la CNIL.
      </p>

      <h2>Services externes</h2>
      <p>
        Le site propose des liens vers WhatsApp, Google Maps, Google (avis), Waze, Instagram, TikTok et Facebook. Aucun
        contenu provenant de ces services n&rsquo;est chargé avant que l&rsquo;utilisateur choisisse de suivre le lien. Ces
        services appliquent ensuite leurs propres politiques de confidentialité.
      </p>
      <p>
        Le site utilise également Google Analytics pour mesurer sa fréquentation (pages consultées, provenance des
        visites). Ce service, fourni par Google Ireland Limited, ne se charge et ne dépose de cookies de mesure
        d&rsquo;audience que si l&rsquo;utilisateur clique sur « Accepter » dans le bandeau ; en cas de refus ou d&rsquo;absence de
        choix, aucun cookie de mesure n&rsquo;est déposé. Voir notre page <Link to="/gestion-des-cookies">Cookies et services tiers</Link>.
      </p>
    </LegalLayout>
  )
}
