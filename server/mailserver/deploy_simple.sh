#!/bin/bash

# Simple Production Deployment Script
echo "🚀 Starting simple production deployment..."

# Create logs directory
mkdir -p logs
echo "✅ Created logs directory"

# Install basic dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements_simple.txt

# Set environment variables (simple version)
echo "🔐 Setting up basic environment..."
export DJANGO_SECRET_KEY="your-secret-key-here-change-this"
export DEBUG="False"
export ALLOWED_HOSTS="localhost,127.0.0.1,yourdomain.com"

# Run migrations
echo "🔄 Running database migrations..."
python manage.py migrate

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if needed
echo "👤 Do you want to create a superuser? (y/n)"
read -r create_user
if [ "$create_user" = "y" ]; then
    python manage.py createsuperuser
fi

# Test the application
echo "🧪 Testing the application..."
python manage.py check --deploy

echo "✅ Simple deployment completed!"
echo ""
echo "🔧 To run in production:"
echo "   gunicorn --bind 0.0.0.0:8000 mailserver.wsgi:application"
echo ""
echo "⚠️  Remember to:"
echo "   1. Change the secret key in the script"
echo "   2. Update ALLOWED_HOSTS with your domain"
echo "   3. Set up a reverse proxy (nginx) if needed" 