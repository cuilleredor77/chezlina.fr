import LegalLayout from '../components/LegalLayout'

export default function Accessibilite() {
  return (
    <LegalLayout crumb="Accessibilité" eyebrow="Un site pour toutes et tous" title="Accessibilité" lede="Notre démarche d’accessibilité.">
      <h2>Notre engagement</h2>
      <p>
        Le site propose une navigation au clavier, des indicateurs de focus visibles, des contrastes renforcés et une
        réduction des animations selon les préférences de l&rsquo;utilisateur.
      </p>

      <h2>Référentiels visés</h2>
      <p>
        La conception vise les principes WCAG 2.2 niveau AA et du RGAA. Aucun audit de conformité complet n&rsquo;ayant
        encore été réalisé, le site n&rsquo;est pas déclaré totalement conforme.
      </p>

      <h2>État de conformité</h2>
      <p>
        En l&rsquo;absence d&rsquo;audit complet selon le RGAA, Chez Lina ne revendique pas à ce jour une conformité totale ou
        partielle. La navigation au clavier, les contrastes, l&rsquo;agrandissement des contenus, les formulaires, les
        alternatives textuelles et la réduction des animations font l&rsquo;objet d&rsquo;améliorations continues.
      </p>

      <h2>Technologies utilisées</h2>
      <p>HTML, CSS et JavaScript, limités aux interactions nécessaires.</p>

      <h2>Signaler un problème</h2>
      <p>
        Si vous rencontrez une difficulté, écrivez à <a href="mailto:restaurant.chezlina@gmail.com">restaurant.chezlina@gmail.com</a> en
        indiquant la page concernée et le problème rencontré.
      </p>
    </LegalLayout>
  )
}
