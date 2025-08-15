"""
WSGI config for mailserver project in production.
"""

import os
import sys
from pathlib import Path

# Add the project directory to the Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Set the Django settings module for production
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mailserver.settings_production')

# Import Django settings
try:
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()
except Exception as e:
    # Log the error and return a simple error response
    import logging
    logging.basicConfig(level=logging.ERROR)
    logging.error(f"Failed to load Django application: {e}")
    
    def application(environ, start_response):
        status = '500 Internal Server Error'
        response_headers = [('Content-type', 'text/plain; charset=utf-8')]
        start_response(status, response_headers)
        return [b'Internal Server Error - Django application failed to load']

# Production middleware for security and performance
try:
    from whitenoise import WhiteNoise
    application = WhiteNoise(application, root=str(BASE_DIR / 'staticfiles'))
    application.add_files(str(BASE_DIR / 'staticfiles'), prefix='static/')
except ImportError:
    # WhiteNoise not installed, continue without it
    pass 