#!/bin/bash

# Configuration
VPS_USER="uch"
VPS_HOST="10.10.10.200"
APP_DIR="/home/uch/kewirausahaan-app"
SSH_KEY="~/uch"

echo "🚀 Deploying to $VPS_USER@$VPS_HOST..."

ssh -i $SSH_KEY $VPS_USER@$VPS_HOST << EOF
    # 1. Update Core Code
    cd $APP_DIR
    echo "⬇️ Pulling latest code..."
    git fetch --all
    git reset --hard origin/main
    git pull origin main

    # 2. Backend Update
    echo "📦 Updating Backend..."
    cd backend
    bun install
    bun prisma generate
    bun prisma db push --accept-data-loss
    bun run prisma/seed-clean.ts
    cd ..

    # 3. Frontend Update
    echo "📦 Updating Frontend..."
    cd frontend
    # Ensure correct API URL for production build
    # NOTE: .env.production should be set manually on server with:
    # NEXT_PUBLIC_API_URL=https://kewirausahaan.uty.ac.id/api/v1
    rm -rf .next
    npm install
    echo "🏗️ Building Frontend..."
    npm run build
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

2. Frontend .env.production:
   - NEXT_PUBLIC_API_URL=https://kewirausahaan.uty.ac.id/api/v1

3. Nginx:
   - Ensure config points to localhost:3001
   - Ensure SSL is configured for https://kewirausahaan.uty.ac.id
"
