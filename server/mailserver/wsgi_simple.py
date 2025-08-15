"""
Simple WSGI config for production deployment
"""

import os
from django.core.wsgi import get_wsgi_application

# Use simple production settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mailserver.settings_simple')

application = get_wsgi_application() 
