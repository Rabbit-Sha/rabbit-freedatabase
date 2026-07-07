#!/bin/bash

# 🐇 Rabbit Database Setup Script
# This script makes it super easy to set up Rabbit DB!

echo "🐇 Welcome to Rabbit Database Setup!"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Docker detected!"
echo ""

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  docker-compose not found. Trying 'docker compose'..."
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo ""
echo "📝 Let's configure your Rabbit Database:"
echo ""

# Prompt for database name
read -p "? Enter a name for your Database (default: bcanotes): " DB_NAME
DB_NAME=${DB_NAME:-bcanotes}

# Prompt for Telegram Bot Token
read -p "? Enter your Telegram Bot Token: " TELEGRAM_BOT_TOKEN
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ Bot token is required!"
    exit 1
fi

# Prompt for Telegram Channel ID
read -p "? Enter your Telegram Private Channel ID: " TELEGRAM_CHANNEL_ID
if [ -z "$TELEGRAM_CHANNEL_ID" ]; then
    echo "❌ Channel ID is required!"
    exit 1
fi

echo ""
echo "🔨 Building Docker image..."
$DOCKER_COMPOSE build

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start your Rabbit Database, run:"
echo "   $DOCKER_COMPOSE up"
echo ""
echo "📖 Your database will be available at:"
echo "   API: http://localhost:8080"
echo "   Web UI: http://localhost:3000"
echo ""
echo "💡 Pro tip: Add '-d' flag to run in background:"
echo "   $DOCKER_COMPOSE up -d"
echo ""
