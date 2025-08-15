# 🔐 Production Security Checklist

## Critical Security Issues (FIX IMMEDIATELY)

### ✅ Completed
- [x] Environment-based secret key configuration
- [x] Debug mode environment variable control
- [x] ALLOWED_HOSTS environment variable configuration
- [x] Production security headers (HSTS, XSS protection, etc.)
- [x] Secure cookie settings
- [x] CORS configuration
- [x] Rate limiting implementation
- [x] Production logging setup

### 🚨 Still Need to Fix
- [ ] **SECRET_KEY**: Generate new secure key and set in environment
- [ ] **Database**: Migrate from SQLite to PostgreSQL
- [ ] **SSL/HTTPS**: Set up SSL certificates
- [ ] **Firewall**: Configure server firewall rules
- [ ] **Email Credentials**: Move to environment variables
- [ ] **Authentication**: Add API authentication/authorization
- [ ] **Input Validation**: Enhance request validation
- [ ] **Monitoring**: Set up security monitoring and alerts

## Environment Variables to Set

```bash
# Generate a new secret key
DJANGO_SECRET_KEY=$(python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")

# Set production environment
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DB_NAME=pulsemail
DB_USER=pulsemail_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Security
SECURE_SSL_REDIRECT=True
CORS_ALLOWED_ORIGINS=https://yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com
```

## Database Migration Steps

1. **Install PostgreSQL**:
   ```bash
   sudo apt-get install postgresql postgresql-contrib
   ```

2. **Create Database**:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE pulsemail;
   CREATE USER pulsemail_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE pulsemail TO pulsemail_user;
   \q
   ```

3. **Update Settings**:
   - Change `DATABASES` in settings.py to use PostgreSQL
   - Install `psycopg2-binary`

4. **Run Migrations**:
   ```bash
   python manage.py migrate
   ```

## SSL/HTTPS Setup

1. **Install Certbot**:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Get SSL Certificate**:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Auto-renewal**:
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

## Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable
```

## Monitoring & Logging

1. **Set up log rotation**:
   ```bash
   sudo tee /etc/logrotate.d/pulsemail > /dev/null <<EOF
   /path/to/your/project/logs/*.log {
       daily
       missingok
       rotate 52
       compress
       delaycompress
       notifempty
       create 644 www-data www-data
   }
   EOF
   ```

2. **Monitor logs**:
   ```bash
   tail -f logs/django.log
   sudo journalctl -u pulsemail -f
   ```

## API Security Enhancements

1. **Add Authentication**:
   - Implement JWT tokens
   - Add API key authentication
   - Rate limiting per user

2. **Input Validation**:
   - Email format validation
   - Rate limiting on email sending
   - Sanitize all inputs

3. **Audit Logging**:
   - Log all email sending attempts
   - Track API usage
   - Monitor for suspicious activity

## Backup Strategy

1. **Database Backups**:
   ```bash
   # Daily backup script
   pg_dump pulsemail > backup_$(date +%Y%m%d).sql
   ```

2. **File Backups**:
   - Backup logs, media files
   - Version control for code
   - Environment configuration backup

## Testing Security

1. **Run Security Checks**:
   ```bash
   python manage.py check --deploy
   ```

2. **Test Rate Limiting**:
   - Verify API rate limits work
   - Test email sending limits

3. **Penetration Testing**:
   - Test API endpoints
   - Verify CORS settings
   - Check for common vulnerabilities

## Emergency Response

1. **Incident Response Plan**:
   - Document security contacts
   - Define response procedures
   - Set up monitoring alerts

2. **Rollback Plan**:
   - Keep previous versions
   - Database backup procedures
   - Quick deployment rollback

## Compliance & Legal

1. **Email Compliance**:
   - CAN-SPAM Act compliance
   - GDPR considerations
   - Email opt-out mechanisms

2. **Data Protection**:
   - Encrypt sensitive data
   - Implement data retention policies
   - User consent management

---

**Remember**: Security is an ongoing process. Regularly review and update these measures! 