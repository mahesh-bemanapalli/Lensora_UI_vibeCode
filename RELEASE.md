# Lensora UI release

Templates, SuperAdmin design previews/assignment, photographer registration and the
media library continue to use a single React app and shared API. The application
split is a later change.

Deploy the API and its SQL migrations 011–013 before this UI. See the API repository's
`docs/release-checklist.md`. Confirm the production API URL in `.env.production` and
that its CORS settings allow the deployed UI origin.

Use Node 22 and run `npm ci`, then `npm run build`. `public/staticwebapp.config.json`
is copied to the build output and preserves deep links to photographer, dashboard
and SuperAdmin routes. Production deploys from `main`; feature branches have build
verification only (opening a PR may also create an Azure preview environment).

Do not commit local credentials, node_modules, Vite caches or generated dist files.
Photographer storage defaults to 5 GB; existing images must be synchronized before
new uploads when their sizes are unknown. SuperAdmin must sign in again after its
role is bootstrapped in the target environment.
