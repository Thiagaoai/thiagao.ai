# ThigaoA.i Deployment

## Local Production Check

```bash
npm ci
npm run check
npm run start
```

Open `http://localhost:3002`.

To use another port locally:

```bash
PORT=3003 HOSTNAME=localhost npm run start
```

## Docker

```bash
npm run docker:build
npm run docker:run
```

Open `http://localhost:3000`.

## GitHub CI

The workflow in `.github/workflows/ci.yml` runs:

- `npm ci`
- `npm run lint`
- `npm run build`
- `docker build -t thigaoai-site .`

## Production Domain

Point `thiagaoai.io` to the hosting provider and keep:

- canonical: `https://thiagaoai.io`
- sitemap: `https://thiagaoai.io/sitemap.xml`
- robots: `https://thiagaoai.io/robots.txt`
