#!/bin/bash
set -euo pipefail

# Configuration
VPS_USER="uch"
VPS_HOST="10.10.10.200"
APP_DIR="/home/uch/kewirausahaan-app"
SSH_KEY="~/uch"
DEPLOY_ACCEPT_DATA_LOSS="${DEPLOY_ACCEPT_DATA_LOSS:-false}"
DEPLOY_RUN_SEED="${DEPLOY_RUN_SEED:-false}"

echo "🚀 Deploying to $VPS_USER@$VPS_HOST..."

ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" \
   APP_DIR="$APP_DIR" \
   DEPLOY_ACCEPT_DATA_LOSS="$DEPLOY_ACCEPT_DATA_LOSS" \
   DEPLOY_RUN_SEED="$DEPLOY_RUN_SEED" \
   'bash -se' << 'EOF'
   set -euo pipefail

    # 1. Update Core Code
    cd $APP_DIR
    echo "⬇️ Pulling latest code..."
    git fetch --all
    git reset --hard origin/main
    git pull origin main

    # Pastikan BUN dapat diakses oleh SSH script
    source ~/.bashrc
   export PATH="$HOME/.bun/bin:$PATH"

    # 2. Backend Update
    echo "📦 Updating Backend..."
    cd backend
    bun install
    bun prisma generate
   echo "ℹ️  Running database migrations..."
   bun prisma migrate deploy

   if [ "$DEPLOY_RUN_SEED" = "true" ]; then
      echo "⚠️  Running seed script (DEPLOY_RUN_SEED=true)"
      bun run prisma/seed-clean.ts
   else
      echo "ℹ️  Skipping seed script (DEPLOY_RUN_SEED=false)"
   fi
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
   - Set DEPLOY_RUN_SEED=true only when you intentionally want to reseed database data.

2. Frontend .env.production:
   - NEXT_PUBLIC_API_URL=https://kewirausahaan.uty.ac.id/api/v1

3. Nginx:
   - Ensure config points to localhost:3001
   - Ensure SSL is configured for https://kewirausahaan.uty.ac.id
"
