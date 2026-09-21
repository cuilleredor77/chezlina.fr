# Chez Lina — site du restaurant

Site du restaurant Chez Lina (Brunoy), reconstruit en React + Vite à partir du site
précédemment publié sur chezlina.fr, en vue d'un hébergement sur Cloudflare Pages via GitHub.

## Développement

```bash
npm install
npm run dev
```

## Build de production

```bash
npm run build
```

Génère le site statique dans `dist/`.

## Structure

- `src/pages` — une page par route (`/`, `/la-carte`, `/notre-histoire`, `/galerie`,
  `/contact`, `/reservation`, pages légales)
- `src/components` — en-tête, pied de page, carrousel d'accueil, avis Google, etc.
- `src/data` — contenu de la carte et des avis clients
- `src/styles/global.css` — palette de couleurs et styles partagés
- `public/images` — photos et logos

## Formulaire de réservation

Le formulaire de réservation ne passe par aucun backend : il compose un message et ouvre
une conversation WhatsApp pré-remplie (`wa.me`), exactement comme le site d'origine.

## Déploiement

Prévu sur Cloudflare Pages, connecté à un dépôt GitHub. Build command : `npm run build`,
dossier de sortie : `dist`.
