# Earth Compass

Build a reactJs application where users can choose a location on earth and then this url will be built dynamically then after the call to this API show the data in a human readable way. Use LeafletJs so the user can click a place on earth then with the lat, lon of that place build the url. Use best practices make it look professional



https://www.ngdc.noaa.gov/geomag-web/calculators/calculateIgrfwmm?lat1=42.6629&lon1=21.1655&model=WMM&startYear=2026&startMonth=11&startDay=6&resultFormat=json&key=EAU2y

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f3041682-2946-4e37-bfb5-f75ca11818b6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Deploy to GitHub Pages

Requires Node.js 22.12+ (or 24+) and Git access to this repository.

```sh
npm ci
npm run deploy
```

`deploy` first runs `build:pages`, then uses the `gh-pages` package to publish
only `dist/client` to the `gh-pages` branch on `origin`. It includes `.nojekyll`
and preserves branch history.

After the first deploy, open the repository's **Settings → Pages** and choose
**Deploy from a branch**, branch **gh-pages**, folder **/ (root)**. The site will
be available at <https://naidra.github.io/earth-compass/> once GitHub finishes
publishing it. Future updates use the same `npm run deploy` command.

To build and preview without publishing:

```sh
npm run build:pages
npm run preview:pages
```

Open the preview server's `/earth-compass/` URL. This build uses TanStack Start's
[SPA mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode)
to generate static HTML and sets the asset and router base to `/earth-compass/`.
If you rename the repository, update `vite.base` in `vite.config.ts` accordingly.
GitHub Pages has no application server, so this mode fetches NOAA data directly
from the browser using NOAA's CORS support. The regular development and Lovable
builds continue using the server function.
