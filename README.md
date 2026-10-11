# React + Vite

## Deploy staging

Workflow `.github/workflows/deploy.yml` builds the frontend image and deploys it with Docker Compose when `staging` is updated, or when started manually from GitHub Actions. The frontend listens on port `3011` on the server by default. Set `FRONTEND_PORT` in the server environment to change the host port.

Create a GitHub Actions environment named `staging`, then configure:

- Secret `APP_ENV_CONTENT`: environment file content with `VITE_API_BASE_URL` and any other Vite settings (for example `VITE_API_BASE_URL=http://<server-tailnet-ip>:3010/api`). Only entries beginning with `VITE_` are passed to the frontend build. Vite embeds these values in the browser bundle, so they must be public configuration, not secrets.
- Secrets `TS_OAUTH_CLIENT_ID`, `TS_OAUTH_SECRET`, `SSH_HOST`, `SSH_USERNAME`, `SSH_PASSWORD`, and `SSH_KNOWN_HOSTS`.

Before the first deployment, prepare the directory on the server as the SSH user (replace `<ssh-user>` with the account configured in GitHub):

```sh
sudo mkdir -p /opt/posan-frontend
sudo chown -R <ssh-user>:<ssh-user> /opt/posan-frontend
sudo chmod 700 /opt/posan-frontend
```

That SSH account also needs permission to run Docker commands. If it was just added to the `docker` group, start a new SSH session before deploying.

The frontend uses browser-side API calls. The backend must allow the frontend origin in its CORS configuration.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
