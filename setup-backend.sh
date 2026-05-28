#!/bin/bash

# GRIND BYTE Backend Setup Script

set -e

echo "🚀 GRIND BYTE Backend Setup"
echo "============================"
echo ""

# Check for required tools
echo "✓ Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed."; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "PostgreSQL is required but not installed."; exit 1; }

echo "✓ All prerequisites installed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install next-auth pg bcryptjs zod uuid
npm install -D @types/pg @types/node typescript @types/node
echo "✓ Dependencies installed"
echo ""

# Setup environment
echo "🔐 Setting up environment variables..."
if [ ! -f .env.local ]; then
    cp .env.local.example .env.local
    echo "⚠️  Created .env.local from template"
    echo "⚠️  Update .env.local with your credentials before running the app"
else
    echo "✓ .env.local already exists"
fi
echo ""

# Database setup
echo "🗄️  Setting up database..."
echo "   Enter PostgreSQL password when prompted:"
read -p "   PostgreSQL host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}
read -p "   PostgreSQL user (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}
read -p "   Database name (default: grind_byte): " DB_NAME
DB_NAME=${DB_NAME:-grind_byte}

echo "   Creating database..."
psql -h $DB_HOST -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || psql -h $DB_HOST -U $DB_USER -c "CREATE DATABASE $DB_NAME"

echo "   Running migrations..."
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f migrations/001_initial_schema.sql

echo "✓ Database setup complete"
echo ""

# Final instructions
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your credentials:"
echo "   - DATABASE_URL=postgresql://$DB_USER:password@$DB_HOST:5432/$DB_NAME"
echo "   - NEXTAUTH_SECRET (generate: openssl rand -hex 32)"
echo "   - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
echo "   - CLOUDINARY_* variables"
echo "   - SMTP_* variables"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000"
echo ""
echo "📚 Documentation: See BACKEND_API.md"
echo ""
