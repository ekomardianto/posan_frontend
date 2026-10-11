FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_ENV_CACHEBUST
RUN --mount=type=secret,id=vite_env,dst=/tmp/vite.env \
    cp /tmp/vite.env .env.production \
    && test -n "$VITE_ENV_CACHEBUST" \
    && npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3011
