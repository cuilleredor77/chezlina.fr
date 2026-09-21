import LegalLayout from '../components/LegalLayout'

export default function MentionsLegales() {
  return (
    <LegalLayout crumb="Mentions légales" eyebrow="Informations légales" title="Mentions légales" lede="Les informations légales du site.">
      <h2>Éditeur du site</h2>
      <p>
        Chez Lina — Société par actions simplifiée (SAS)<br />
        Capital social : 1 000 €<br />
        SIREN : 109 488 429<br />
        Date d&rsquo;immatriculation : 9 septembre 2026<br />
        Siège social : 29 rue de Montgeron, 91800 Brunoy<br />
        Téléphone : 06 51 19 77 51<br />
        restaurant.chezlina@gmail.com
      </p>

      <h2>Responsable de publication</h2>
      <p>La direction de Chez Lina — identité nominative à confirmer.</p>

      <h2>Hébergement</h2>
      <p>
        Site hébergé par Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, États-Unis, via le service
        Cloudflare Pages. Code source géré sur GitHub, Inc.
      </p>

      <h2>Médiation de la consommation</h2>
      <p>
        Après une réclamation écrite préalable auprès de Chez Lina restée sans solution, le consommateur peut recourir
        gratuitement au médiateur de la consommation dont relève le restaurant. Les coordonnées du médiateur seront
        publiées ici dès confirmation de l&rsquo;adhésion.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Les textes, photographies, créations culinaires, logos et éléments de marque publiés sur ce site sont protégés.
        Toute reproduction ou utilisation sans autorisation préalable est interdite.
      </p>

      <h2>Contact</h2>
      <p><a href="mailto:restaurant.chezlina@gmail.com">Écrire à Chez Lina</a></p>
    </LegalLayout>
  )
}
