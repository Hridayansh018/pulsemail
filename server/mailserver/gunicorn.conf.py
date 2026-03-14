"""
Gunicorn configuration for PulseMail Django server.

Usage:
  gunicorn -c gunicorn.conf.py mailserver.wsgi:application
"""

import os
import multiprocessing

# ── Server Socket ──────────────────────────────────────────────
bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"

# ── Worker Processes ───────────────────────────────────────────
# Railway containers are typically 1-2 vCPUs, so 2-4 workers is ideal.
# Formula: (2 × CPU cores) + 1, capped for small containers.
workers = int(os.environ.get("WEB_CONCURRENCY", min(multiprocessing.cpu_count() * 2 + 1, 4)))
worker_class = "sync"
threads = 1

# ── Timeouts ───────────────────────────────────────────────────
timeout = 120          # seconds before a worker is killed (email sending can be slow)
graceful_timeout = 30  # seconds to finish serving before force kill
keepalive = 5          # seconds to wait for keep-alive connections

# ── Logging ────────────────────────────────────────────────────
accesslog = "-"         # stdout
errorlog = "-"          # stderr
loglevel = os.environ.get("LOG_LEVEL", "info")

# ── Process Naming ─────────────────────────────────────────────
proc_name = "pulsemail"

# ── Security ───────────────────────────────────────────────────
limit_request_line = 8190
limit_request_fields = 100
limit_request_field_size = 8190

# ── Server Hooks ───────────────────────────────────────────────
def on_starting(server):
    """Called just before the master process is initialized."""
    pass

def when_ready(server):
    """Called just after the server is started."""
    server.log.info("PulseMail server is ready. Listening on: %s", server.cfg.bind)

def on_exit(server):
    """Called just before exiting Gunicorn."""
    server.log.info("PulseMail server is shutting down.")
