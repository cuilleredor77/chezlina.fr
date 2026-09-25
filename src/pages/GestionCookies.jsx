import LegalLayout from '../components/LegalLayout'

export default function GestionCookies() {
  return (
    <LegalLayout crumb="Cookies et services tiers" eyebrow="Navigation et confidentialité" title="Cookies et services tiers" lede="Notre utilisation des cookies et services tiers.">
      <p><em>Dernière mise à jour : 25 septembre 2026.</em></p>

      <h2>Situation actuelle</h2>
      <p>
        Chez Lina utilise Google Analytics pour mesurer la fréquentation du site (pages consultées, provenance des
        visites). Ce service dépose des cookies de mesure d&rsquo;audience. Le site ne dépose aucun cookie publicitaire ni
        traceur de profilage, et n&rsquo;intègre ni carte Google, ni vidéo, ni publication Instagram susceptible de charger un
        traceur tiers avant votre action.
      </p>

      <h2>Liens vers des services tiers</h2>
      <p>
        WhatsApp, Google Maps, Google et Instagram s&rsquo;ouvrent uniquement lorsque vous activez volontairement le lien
        correspondant. À partir de ce moment, le service choisi applique ses propres règles de confidentialité et peut
        utiliser ses propres cookies.
      </p>

      <h2>Évolution du site</h2>
      <p>
        Si un outil soumis au consentement est ajouté ultérieurement, il restera désactivé jusqu&rsquo;au choix de
        l&rsquo;utilisateur. Le refus sera proposé aussi simplement que l&rsquo;acceptation et le choix pourra être modifié à tout
        moment.
      </p>

      <h2>Nous contacter</h2>
      <p>Pour toute question : <a href="mailto:contact@chezlina.fr">contact@chezlina.fr</a>.</p>
    </LegalLayout>
  )
}
