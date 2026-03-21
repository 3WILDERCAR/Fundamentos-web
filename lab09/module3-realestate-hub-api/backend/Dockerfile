FROM node:22-alpine

WORKDIR /app

# Install all dependencies (need prisma + tsx from devDeps for seed/generate)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy Prisma schema and config
COPY prisma ./prisma
COPY prisma.config.ts ./

# Generate Prisma client
RUN npx prisma generate

# Copy compiled JS
COPY dist ./dist

# Entrypoint: create DB, seed, and start server
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 8080

CMD ["./entrypoint.sh"]
