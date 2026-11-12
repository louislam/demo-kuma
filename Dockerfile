############################################
# ⭐ Main Image
############################################
FROM node:26-alpine AS release
WORKDIR /app
# Demo Kuma shells out to `docker compose` to start/stop the demo stacks
RUN apk add --no-cache docker-cli docker-cli-compose dumb-init
COPY --chown=node:node . .
RUN npm ci --omit=dev
EXPOSE 80
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node_modules/.bin/tsx", "./server.ts"]
