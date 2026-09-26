import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')
const siteUrl = 'https://chezlina.fr'

const routes = [
  { path: '/la-carte', title: 'La carte du moment', description: 'La carte du restaurant franco-africain Chez Lina à Brunoy : viandes et poissons braisés, entrées, cocktails maison et vins. Formules dès 9 €.' },
  { path: '/notre-histoire', title: 'Mama Lina, du Congo à Brunoy', description: 'Mama Lina a apporté sa cuisine congolaise à Brunoy ; ses quatre filles perpétuent aujourd’hui son héritage au restaurant Chez Lina.' },
  { path: '/galerie', title: 'La maison en images', description: 'Découvrez en images les plats, l’ambiance et les gestes du restaurant franco-africain Chez Lina à Brunoy.' },
  { path: '/contact', title: 'Nous trouver à Brunoy', description: 'Adresse, horaires et moyens de contact du restaurant Chez Lina, 29 rue de Montgeron à Brunoy. Réservez une table ou commandez à emporter.' },
  { path: '/reservation', title: 'Réserver ou commander', description: 'Réservez une table ou commandez à emporter au restaurant Chez Lina à Brunoy, en quelques clics via WhatsApp.' },
  { path: '/mentions-legales', title: 'Mentions légales', description: 'Mentions légales du restaurant Chez Lina à Brunoy : identité de l’entreprise, hébergement et informations réglementaires du site.' },
  { path: '/politique-confidentialite', title: 'Politique de confidentialité', description: 'Politique de confidentialité du restaurant Chez Lina à Brunoy : données collectées, finalités, durée de conservation et vos droits.' },
  { path: '/gestion-des-cookies', title: 'Cookies et services tiers', description: 'Cookies et services tiers utilisés sur le site du restaurant Chez Lina à Brunoy : Google Analytics, soumis à votre consentement.' },
  { path: '/accessibilite', title: 'Accessibilité', description: 'La démarche d’accessibilité numérique du site du restaurant Chez Lina à Brunoy.' },
]

const template = readFileSync(join(distDir, 'index.html'), 'utf-8')

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

for (const route of routes) {
  const fullTitle = `${route.title} — Chez Lina`
  const canonicalUrl = `${siteUrl}${route.path}`
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(fullTitle)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeHtml(route.description)}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeHtml(route.description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonicalUrl}" />`)

  writeFileSync(join(distDir, `${route.path}.html`), html)
  console.log(`Prerendered ${route.path} -> ${fullTitle}`)
}

const notFoundTitle = 'Page introuvable — Chez Lina'
const notFoundHtml = template
  .replace(/<title>[^<]*<\/title>/, `<title>${notFoundTitle}</title>`)
  .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="Cette page n’existe pas ou a changé d’adresse." />`)
  .replace(/<link rel="canonical" href="[^"]*" \/>/, '<meta name="robots" content="noindex" />')
writeFileSync(join(distDir, '404.html'), notFoundHtml)
console.log('Wrote 404.html')
