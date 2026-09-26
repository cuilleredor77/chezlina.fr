import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')
const siteUrl = 'https://chezlina.fr'

const routes = [
  { path: '/la-carte', title: 'La carte du moment', description: 'Une cuisine franco-africaine généreuse.' },
  { path: '/notre-histoire', title: 'Mama Lina, du Congo à Brunoy', description: 'L’héritage congolais de Mama Lina, transmis à ses quatre filles.' },
  { path: '/galerie', title: 'La maison en images', description: 'Les plats et les gestes de Chez Lina.' },
  { path: '/contact', title: 'Chez Lina à Brunoy', description: 'Préparez votre venue ou contactez-nous.' },
  { path: '/reservation', title: 'Réserver ou commander', description: 'Réservez une table ou commandez à emporter.' },
  { path: '/mentions-legales', title: 'Mentions légales', description: 'Les informations légales du site.' },
  { path: '/politique-confidentialite', title: 'Politique de confidentialité', description: 'L’essentiel sur vos données.' },
  { path: '/gestion-des-cookies', title: 'Cookies et services tiers', description: 'Notre utilisation des cookies et services tiers.' },
  { path: '/accessibilite', title: 'Accessibilité', description: 'Notre démarche d’accessibilité.' },
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

  const outDir = join(distDir, route.path)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), html)
  console.log(`Prerendered ${route.path} -> ${fullTitle}`)
}

const notFoundTitle = 'Page introuvable — Chez Lina'
const notFoundHtml = template
  .replace(/<title>[^<]*<\/title>/, `<title>${notFoundTitle}</title>`)
  .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="Cette page n’existe pas ou a changé d’adresse." />`)
  .replace(/<link rel="canonical" href="[^"]*" \/>/, '<meta name="robots" content="noindex" />')
writeFileSync(join(distDir, '404.html'), notFoundHtml)
console.log('Wrote 404.html')
