FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_ENV_CACHEBUST
RUN --mount=type=secret,id=vite_env,dst=/tmp/vite.env \
    cp /tmp/vite.env .env.production \
    && test -n "$VITE_ENV_CACHEBUST" \
    && npm run build \
    && rm .env.production

ENV NODE_ENV=production

EXPOSE 3011

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3011", "--strictPort"]
