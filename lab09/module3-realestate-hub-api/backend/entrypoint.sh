#!/bin/sh
# Create SQLite DB and seed with demo data on each container start
npx prisma db push --skip-generate 2>&1
npx tsx prisma/seed.ts 2>&1

# Start the server
node dist/server.js
