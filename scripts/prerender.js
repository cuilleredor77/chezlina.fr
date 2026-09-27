import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const distDir = join(rootDir, 'dist')
const siteUrl = 'https://chezlina.fr'

const { render } = await import(pathToFileURL(join(rootDir, 'dist-ssr', 'entry-server.js')).href)
const { faq } = await import(pathToFileURL(join(rootDir, 'src', 'data', 'faq.js')).href)
const { formules, menuSections } = await import(pathToFileURL(join(rootDir, 'src', 'data', 'menu.js')).href)

function parsePrice(price) {
  return price ? price.replace(/\s*€/, '').replace(',', '.').trim() : undefined
}

const menuJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Menu',
  name: 'La carte du moment — Chez Lina',
  url: `${siteUrl}/la-carte`,
  inLanguage: 'fr',
  hasMenuSection: [
    {
      '@type': 'MenuSection',
      name: 'Formules',
      hasMenuItem: formules.items.filter((f) => f.price).map((f) => ({
        '@type': 'MenuItem',
        name: f.name,
        description: f.description,
        offers: { '@type': 'Offer', price: parsePrice(f.price), priceCurrency: 'EUR' },
      })),
    },
    ...menuSections.map((section) => ({
      '@type': 'MenuSection',
      name: section.title,
      hasMenuItem: section.items.map((item) => {
        const price = item.price || item.priceOptions?.[0]?.price
        return {
          '@type': 'MenuItem',
          name: item.name,
          ...(item.description ? { description: item.description } : {}),
          ...(price ? { offers: { '@type': 'Offer', price: parsePrice(price), priceCurrency: 'EUR' } } : {}),
        }
      }),
    })),
  ],
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
}

const routes = [
  { path: '/' },
  { path: '/la-carte', title: 'La carte du moment', description: 'La carte du restaurant franco-africain Chez Lina à Brunoy : viandes et poissons braisés, entrées, cocktails maison et vins. Formules dès 9 €.', jsonLd: menuJsonLd },
  { path: '/notre-histoire', title: 'Mama Lina, du Congo à Brunoy', description: 'Mama Lina a apporté sa cuisine congolaise à Brunoy ; ses quatre filles perpétuent aujourd’hui son héritage au restaurant Chez Lina.' },
  { path: '/galerie', title: 'La maison en images', description: 'Découvrez en images les plats, l’ambiance et les gestes du restaurant franco-africain Chez Lina à Brunoy.' },
  { path: '/contact', title: 'Nous trouver à Brunoy', description: 'Adresse, horaires et moyens de contact du restaurant Chez Lina, 29 rue de Montgeron à Brunoy. Réservez une table ou commandez à emporter.', jsonLd: faqJsonLd },
  { path: '/cuisine-congolaise-essonne', title: 'Restaurant congolais en Essonne', description: 'Chez Lina, restaurant congolais et franco-africain à Brunoy (91) : mouton braisé, chikwangue, saka-saka, attiéké, foutou banane. La cuisine de Mama Lina dans le Val d’Yerres.' },
  { path: '/a-emporter-brunoy', title: 'Plats à emporter à Brunoy', description: 'Commandez vos plats à emporter chez Chez Lina, 29 rue de Montgeron à Brunoy : viandes et poissons braisés, formules dès 9 €. Retrait du mardi au dimanche.' },
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

function injectApp(html, appHtml) {
  return html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
}

for (const route of routes) {
  const appHtml = render(route.path)
  let html = injectApp(template, appHtml)

  if (route.title) {
    const fullTitle = `${route.title} — Chez Lina`
    const canonicalUrl = `${siteUrl}${route.path}`
    html = html
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(fullTitle)}</title>`)
      .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`)
      .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeHtml(route.description)}" />`)
      .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`)
      .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeHtml(route.description)}" />`)
      .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonicalUrl}" />`)
  }

  if (route.jsonLd) {
    const json = JSON.stringify(route.jsonLd).replace(/</g, '\\u003c')
    html = html.replace('</head>', `    <script type="application/ld+json">${json}</script>\n  </head>`)
  }

  writeFileSync(join(distDir, route.path === '/' ? 'index.html' : `${route.path}.html`), html)
  console.log(`Prerendered ${route.path}`)
}

const notFoundHtml = injectApp(template, render('/__introuvable__'))
  .replace(/<title>[^<]*<\/title>/, '<title>Page introuvable — Chez Lina</title>')
  .replace(/<meta name="description" content="[^"]*" \/>/, '<meta name="description" content="Cette page n’existe pas ou a changé d’adresse." />')
  .replace(/<link rel="canonical" href="[^"]*" \/>/, '<meta name="robots" content="noindex" />')
writeFileSync(join(distDir, '404.html'), notFoundHtml)
console.log('Wrote 404.html')

rmSync(join(rootDir, 'dist-ssr'), { recursive: true, force: true })
console.log('Cleaned up dist-ssr')
