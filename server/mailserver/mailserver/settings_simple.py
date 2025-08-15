"""
Simple production settings - minimal changes to fix critical errors
"""

import os
from .settings import *

# Turn off debug mode
DEBUG = False

# Set allowed hosts (change this to your actual domain)
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'yourdomain.com', 'healthcheck.railway.app']

# Basic security (keep it simple)
SECURE_SSL_REDIRECT = False  # Set to True only after SSL is set up
SECURE_HSTS_SECONDS = 0  # Disable for now
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False

# Keep using SQLite for now (simple deployment)
# DATABASES stays the same

# Simple logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

# Disable advanced security for simple deployment
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_HTTPONLY = False
CSRF_COOKIE_HTTPONLY = False 