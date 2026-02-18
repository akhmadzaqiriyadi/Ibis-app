#!/bin/bash

# Configuration
VPS_USER="uch"
VPS_HOST="10.10.10.200"
APP_DIR="/home/uch/kewirausahaan-app"
REPO_URL="https://github.com/akhmadzaqiriyadi/Ibis-app.git"
SSH_KEY="~/uch"

echo "🚀 Deploying to $VPS_USER@$VPS_HOST..."

ssh -i $SSH_KEY $VPS_USER@$VPS_HOST << EOF
    # 1. Setup Directory
    if [ ! -d "$APP_DIR" ]; then
        echo "Creating directory..."
        git clone $REPO_URL $APP_DIR
    fi

    cd $APP_DIR
    git pull origin main

    # 2. Config Files
    # NOTE: You must manually create .env files in backend/ and frontend/ if not committed
    # cp .env.example .env (if applicable for first time)

    # 3. Backend Setup
    echo "📦 Installing Backend Dependencies..."
    cd backend
    bun install
    bun prisma generate
    # bun prisma migrate deploy 
    cd ..

    # 4. Frontend Setup
    echo "📦 Installing Frontend Dependencies..."
    cd frontend
    npm install
    echo "🏗️ Building Frontend..."
    npm run build
    cd ..

    # 5. PM2 Restart
    echo "🔄 Restarting Apps..."
    pm2 startOrRestart ecosystem.config.cjs --env production

    echo "✅ Apps Deployed!"
EOF

echo "
⚠️  IMPORTANT: First Time Setup on Server
1. Create Database env vars in $APP_DIR/backend/.env
2. Setup Nginx:
   sudo ln -s $APP_DIR/nginx_kewirausahaan.conf /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
"
