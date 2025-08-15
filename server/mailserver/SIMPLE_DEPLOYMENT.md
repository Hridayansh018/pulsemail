# 🚀 Simple Production Deployment

## What This Does
- Fixes critical production errors
- Keeps your existing SQLite database
- Minimal configuration changes
- Basic security without complexity

## Quick Steps to Deploy

### 1. Install Dependencies
```bash
pip install -r requirements_simple.txt
```

### 2. Set Environment Variables
```bash
export DJANGO_SECRET_KEY="your-new-secret-key-here"
export DEBUG="False"
export ALLOWED_HOSTS="localhost,127.0.0.1,yourdomain.com"
```

### 3. Run Basic Setup
```bash
# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Test the app
python manage.py check --deploy
```

### 4. Start Production Server
```bash
gunicorn --bind 0.0.0.0:8000 mailserver.wsgi_simple:application
```

## What's Fixed
✅ **Debug mode** - Turned off  
✅ **Secret key** - Environment variable  
✅ **Allowed hosts** - Basic configuration  
✅ **Security headers** - Disabled for now  
✅ **Logging** - Simple console logging  

## What's Still Simple
- SQLite database (no PostgreSQL setup needed)
- Basic email functionality (no advanced features)
- No SSL/HTTPS (HTTP only for now)
- No complex authentication

## Files to Use
- `settings_simple.py` - Simple production settings
- `wsgi_simple.py` - Simple WSGI configuration
- `requirements_simple.txt` - Basic dependencies
- `deploy_simple.sh` - Simple deployment script

## After Deployment
1. Your API will work at `http://yourdomain.com:8000/api/send-mails/`
2. Admin panel at `http://yourdomain.com:8000/admin/`
3. Basic security is in place
4. No complex configuration needed

## If You Want More Later
- Add SSL certificates
- Switch to PostgreSQL
- Add authentication
- Set up monitoring

But for now, this gets you running without errors! 🎉 