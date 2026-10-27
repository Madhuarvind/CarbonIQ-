Deploying Carbo-Tracker to Render

This file explains how to deploy the project to Render (https://render.com) as a Node web service.

1) Create a new Web Service on Render
   - Connect your GitHub repository and pick the `carbo-tracker` repo and the `main` branch.
   - Environment: `Node` (select the Node 18+ runtime in Render settings)

2) Build & Start commands
   - Build command: `npm ci && npm run build:ci`
     - Note: `build:ci` disables ESLint checks during build (useful for CI/hosting). If you want lint enforced, run `npm run build` instead locally.
   - Start command: `npm run start`

3) Environment variables
   - Add any environment variables your app needs (database URIs, API keys, etc.).
   - For production, set `NODE_ENV=production` (Render sets this automatically).

4) Instance and scaling
   - Select an instance type (starter is fine for testing). Adjust based on traffic.

5) Webhooks and auto-deploys
   - Enable auto-deploy on push to `main` (default Render behavior).

Notes and caveats
 - Because this project uses Next.js with App Router and API routes, a dynamic Node host such as Render or Vercel is required unless you refactor to a fully static site.
 - If you use environment-specific configuration (e.g., Google Cloud credentials), make sure to upload the secrets to Render's environment settings.

Optional: deploy using Render's API
 - You can trigger a deploy programmatically by calling Render's deploy API (requires `RENDER_API_KEY`).
