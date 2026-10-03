import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const distDir = join(rootDir, 'dist')
const siteUrl = 'https://chezlina.fr'

const { render } = await import(pathToFileURL(join(rootDir, 'dist-ssr', 'entry-server.js')).href)
const { pageMeta, fullTitle } = await import(pathToFileURL(join(rootDir, 'src', 'data', 'pageMeta.js')).href)
const { faq, faqFor } = await import(pathToFileURL(join(rootDir, 'src', 'data', 'faq.js')).href)
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

function faqJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

const extraJsonLd = {
  '/la-carte': menuJsonLd,
  '/contact': faqJsonLd(faq),
  '/privatisation-brunoy': faqJsonLd(faqFor('privatisation')),
  '/a-emporter-brunoy': faqJsonLd(faqFor('emporter')),
  '/cuisine-congolaise-essonne': faqJsonLd(faqFor('cuisine')),
}

const routes = Object.entries(pageMeta).map(([path, meta]) => ({ path, ...meta, jsonLd: extraJsonLd[path] }))

function breadcrumbJsonLd(route) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: route.crumb, item: `${siteUrl}${route.path}` },
    ],
  }
}

function jsonLdScript(data) {
  return `    <script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>\n  </head>`
}

const template = readFileSync(join(distDir, 'index.html'), 'utf-8')

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function injectApp(html, appHtml) {
  return html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
}

for (const route of routes) {
  const appHtml = render(route.path)
  const title = fullTitle(route.path)
  const canonicalUrl = `${siteUrl}${route.path}`
  let html = injectApp(template, appHtml)
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeHtml(route.description)}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeHtml(route.description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonicalUrl}" />`)

  if (route.crumb) html = html.replace('</head>', jsonLdScript(breadcrumbJsonLd(route)))
  if (route.jsonLd) html = html.replace('</head>', jsonLdScript(route.jsonLd))

  writeFileSync(join(distDir, route.path === '/' ? 'index.html' : `${route.path}.html`), html)
  console.log(`Prerendered ${route.path} -> ${title}`)
}

const notFoundHtml = injectApp(template, render('/__introuvable__'))
  .replace(/<title>[^<]*<\/title>/, '<title>Page introuvable — Chez Lina</title>')
  .replace(/<meta name="description" content="[^"]*" \/>/, '<meta name="description" content="Cette page n’existe pas ou a changé d’adresse." />')
  .replace(/<link rel="canonical" href="[^"]*" \/>/, '<meta name="robots" content="noindex" />')
writeFileSync(join(distDir, '404.html'), notFoundHtml)
console.log('Wrote 404.html')

rmSync(join(rootDir, 'dist-ssr'), { recursive: true, force: true })
console.log('Cleaned up dist-ssr')
