#!/bin/bash

# Configuration
VPS_USER="uch"
VPS_HOST="10.10.10.200"
APP_DIR="/home/uch/kewirausahaan-app"
SSH_KEY="~/uch"
DEPLOY_ACCEPT_DATA_LOSS="${DEPLOY_ACCEPT_DATA_LOSS:-false}"

echo "🚀 Deploying to $VPS_USER@$VPS_HOST..."

ssh -i $SSH_KEY $VPS_USER@$VPS_HOST << EOF
    # 1. Update Core Code
    cd $APP_DIR
    echo "⬇️ Pulling latest code..."
    git fetch --all
    git reset --hard origin/main
    git pull origin main

    # Pastikan BUN dapat diakses oleh SSH script
    source ~/.bashrc
    export PATH="~/.bun/bin:$PATH"

    # 2. Backend Update
    echo "📦 Updating Backend..."
    cd backend
    bun install
    bun prisma generate
   if [ "$DEPLOY_ACCEPT_DATA_LOSS" = "true" ]; then
      echo "⚠️  Applying Prisma db push with --accept-data-loss"
      bun prisma db push --accept-data-loss
   else
      echo "ℹ️  Applying Prisma db push without --accept-data-loss"
      bun prisma db push
   fi
    bun run prisma/seed-clean.ts
    cd ..

    # 3. Frontend Update
    echo "📦 Updating Frontend..."
    cd frontend
    # Ensure correct API URL for production build
    # NOTE: .env.production should be set manually on server with:
    # NEXT_PUBLIC_API_URL=https://kewirausahaan.uty.ac.id/api/v1
    rm -rf node_modules .next bun.lockb
    bun install
    echo "🏗️ Building Frontend..."
    bun run build
    cd ..

    # 4. Restart Services
    echo "🔄 Restarting Apps..."
    pm2 restart kewirausahaan-backend
    pm2 restart kewirausahaan-frontend

    echo "✅ Deployment Complete!"
EOF

echo "
⚠️  SERVER SETUP REMINDER (One-time only):
1. Backend .env:
   - PORT=2202
   - DATABASE_URL=postgresql://user:pass@10.10.10.100:2100/db_name
   - CORS_ORIGIN=https://kewirausahaan.uty.ac.id

Deployment toggle:
   - Set DEPLOY_ACCEPT_DATA_LOSS=true only when you intentionally want Prisma to apply destructive schema changes.

2. Frontend .env.production:
   - NEXT_PUBLIC_API_URL=https://kewirausahaan.uty.ac.id/api/v1

3. Nginx:
   - Ensure config points to localhost:3001
   - Ensure SSL is configured for https://kewirausahaan.uty.ac.id
"
