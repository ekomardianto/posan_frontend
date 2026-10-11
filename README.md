# POSAN Admin — Next.js

## Development

```sh
npm ci
npm run dev
```

The application runs on port `3011`.

## Deploy staging

Workflow `.github/workflows/deploy.yml` builds the Next.js standalone image and deploys it with Docker Compose when `staging` is updated, or when started manually from GitHub Actions. The frontend listens on port `3011` by default. Set `FRONTEND_PORT` in the server environment to change the host port.

The runtime image only contains the standalone Next.js output and production runtime. CI reports the image and transfer sizes and stops deployment if the runtime image exceeds `900 MiB`.

Create a GitHub Actions environment named `staging`, then configure:

- Secret `APP_ENV_CONTENT`: environment file content with `NEXT_PUBLIC_API_BASE_URL` and any other public Next.js settings (for example `NEXT_PUBLIC_API_BASE_URL=http://<server-tailnet-ip>:3010/api`). Only entries beginning with `NEXT_PUBLIC_` are passed to the frontend build. Next.js embeds these values in the browser bundle, so they must be public configuration, not secrets.
- Secrets `TS_OAUTH_CLIENT_ID`, `TS_OAUTH_SECRET`, `SSH_HOST`, `SSH_USERNAME`, `SSH_PASSWORD`, and `SSH_KNOWN_HOSTS`.

Before the first deployment, prepare the directory on the server as the SSH user (replace `<ssh-user>` with the account configured in GitHub):

```sh
sudo mkdir -p /opt/posan-frontend
sudo chown -R <ssh-user>:<ssh-user> /opt/posan-frontend
sudo chmod 700 /opt/posan-frontend
```

That SSH account also needs permission to run Docker commands. If it was just added to the `docker` group, start a new SSH session before deploying. The backend must allow the frontend origin in its CORS configuration.
