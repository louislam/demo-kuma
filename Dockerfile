############################################
# ⭐ Main Image
############################################
FROM louislam/dockge:base AS release
WORKDIR /app
COPY --chown=node:node  . .
RUN npm ci --production
EXPOSE 80
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["tsx", "./server.ts"]
