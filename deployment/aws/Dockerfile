# The same Express entry point serves API routes and the existing CDN-based frontend.
FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node backend/src ./backend/src
COPY --chown=node:node backend/sql ./backend/sql
COPY --chown=node:node frontend/index.html ./frontend/index.html
COPY --chown=node:node frontend/src ./frontend/src
COPY --chown=node:node frontend/public ./frontend/public
USER node
EXPOSE 5001
CMD ["node", "backend/src/server.js"]
