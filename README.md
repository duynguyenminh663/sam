# Minh Truong · Portfolio

Static site (HTML/CSS/JS + Three.js from CDN). No build step.

## Run locally

ES modules need a web server (opening `index.html` directly will not load the 3D):

```powershell
python -m http.server 5173
```

Then open http://localhost:5173

## Deploy

Upload the whole folder (except `.impeccable/` and `assets/canva/`) to any static host: GitHub Pages, Netlify, Vercel.

## Edit content

- Text, links, roles, awards, degrees, books: `js/data.js`
- Contact links (LinkedIn, Facebook, Email): `LINKS` at the top of `js/data.js`
- Images: `assets/img/` (exported from the Canva design)
- 3D models: `assets/models/` (Poly Haven, CC0)

## Put it on GitHub Pages

1. Create a new repository on GitHub (for example `minh-portfolio`).
2. Upload everything in this folder (drag the files and folders into the repo page, keep the structure).
3. Settings → Pages → Source: "Deploy from a branch", Branch: `main`, folder `/ (root)` → Save.
4. After a minute the site is at `https://<your-username>.github.io/minh-portfolio/`.
