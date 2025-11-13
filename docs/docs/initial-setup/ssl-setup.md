# SSL Setup

This guide covers setting up SSL certificates to enable HTTPS for your BMLT/YAP server using Let's Encrypt.

## Why SSL is Important

SSL certificates are essential for:
- **Security**: Encrypt data between users and your server
- **Trust**: Show visitors your site is legitimate
- **SEO**: Search engines prefer HTTPS sites
- **YAP Requirements**: Twilio webhooks require HTTPS
- **Modern Standards**: HTTPS is now expected for all websites

## Prerequisites

Before setting up SSL:
- Domain name pointing to your server
- DNS propagation completed (24-48 hours after DNS changes)
- Apache virtual host configured
- Port 80 and 443 open in firewall

## Verify DNS Configuration

Ensure your domain resolves to your server:

```bash
# Test DNS resolution
nslookup your-domain.com

# Test from external source
dig your-domain.com

# Verify web server responds
curl -I http://your-domain.com
```

## Install Certbot

Certbot should already be installed from server setup, but verify:

```bash
# Check if Certbot is installed
certbot --version

# If not installed, install it
sudo apt install certbot python3-certbot-apache -y
```

## Request SSL Certificate

### Automatic Apache Configuration

The easiest method uses Certbot's Apache plugin:

```bash
# Request certificate with automatic Apache configuration
sudo certbot --apache -d your-domain.com

# For multiple domains/subdomains
sudo certbot --apache -d your-domain.com -d www.your-domain.com
```

### Follow Certbot Prompts

1. **Email Address**: Enter email for certificate notifications
2. **Terms of Service**: Agree to Let's Encrypt terms
3. **Share Email**: Choose whether to share email with EFF
4. **HTTP to HTTPS**: Choose redirect option (recommended: 2 - Redirect)

### Manual Apache Configuration

If you prefer manual configuration:

```bash
# Request certificate only (no automatic Apache config)
sudo certbot certonly --apache -d your-domain.com

# Note the certificate locations for manual configuration
```

## Verify SSL Installation

### Test HTTPS Access

Visit your site with HTTPS:
```
https://your-domain.com
https://your-domain.com/main_server
https://your-domain.com/yap
```

### Check Certificate Details

```bash
# View certificate information
sudo certbot certificates

# Check certificate expiration
openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -noout -dates

# Test SSL configuration
curl -I https://your-domain.com
```

## Apache SSL Configuration

### Review Auto-Generated Configuration

Certbot creates an SSL virtual host. Review it:

```bash
# View SSL virtual host
sudo nano /etc/apache2/sites-available/your-domain.com-le-ssl.conf
```

### Example SSL Virtual Host

Your SSL configuration should look like this:

```apache
<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerAdmin webmaster@your-domain.com
    ServerName your-domain.com
    DocumentRoot /var/www/your-domain.com

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/your-domain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/your-domain.com/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf
    SSLCertificateChainFile /etc/letsencrypt/live/your-domain.com/chain.pem

    # Directory Configuration
    <Directory "/var/www/your-domain.com">
        AllowOverride All
        Require all granted
    </Directory>

    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "no-referrer-when-downgrade"

    # Logging
    ErrorLog ${APACHE_LOG_DIR}/your-domain.com_ssl_error.log
    CustomLog ${APACHE_LOG_DIR}/your-domain.com_ssl_access.log combined

</VirtualHost>
</IfModule>
```

### HTTP to HTTPS Redirect

Ensure HTTP redirects to HTTPS in your port 80 virtual host:

```bash
sudo nano /etc/apache2/sites-available/your-domain.com.conf
```

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/your-domain.com

    # Redirect all HTTP to HTTPS
    RewriteEngine on
    RewriteCond %{SERVER_NAME} =your-domain.com
    RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]
</VirtualHost>
```

## Enable Required Modules

Ensure SSL and security modules are enabled:

```bash
# Enable SSL module
sudo a2enmod ssl

# Enable headers module (for security headers)
sudo a2enmod headers

# Enable rewrite module (for redirects)
sudo a2enmod rewrite

# Restart Apache
sudo systemctl restart apache2
```

## Test SSL Configuration

### Online SSL Testing

Use online tools to verify your SSL setup:
- **SSL Labs**: [ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/)
- **SSL Checker**: [sslchecker.com](https://www.sslchecker.com/)

### Command Line Testing

```bash
# Test SSL connection
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Check certificate chain
curl -I https://your-domain.com

# Test redirect from HTTP
curl -I http://your-domain.com
```

## Update YAP for HTTPS

### Update YAP Configuration

Edit YAP config to use HTTPS URLs:

```bash
sudo nano /var/www/your-domain.com/yap/config.php
```

Update BMLT server URL:
```php
// Update BMLT server URL to use HTTPS
static $bmlt_root_server = "https://your-domain.com/main_server";
```

### Update Twilio Webhooks

Update Twilio webhooks to use HTTPS:

**Voice Webhook:**
```
https://your-domain.com/yap/index.php
```

**SMS Webhook:**
```
https://your-domain.com/yap/sms-gateway.php
```

## Automatic Certificate Renewal

Let's Encrypt certificates expire every 90 days. Set up automatic renewal:

### Test Renewal Process

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run
```

### Check Renewal Timer

Ubuntu automatically sets up a systemd timer for renewal:

```bash
# Check certbot timer status
sudo systemctl status certbot.timer

# Check if timer is enabled
sudo systemctl is-enabled certbot.timer

# Enable if not enabled
sudo systemctl enable certbot.timer
```

### Manual Renewal Setup (if needed)

If automatic renewal isn't working, set up a cron job:

```bash
# Edit crontab
sudo crontab -e

# Add renewal command (runs twice daily)
0 12 * * * /usr/bin/certbot renew --quiet --post-hook "systemctl reload apache2"
```

### Check Renewal History

```bash
# View renewal attempts
sudo grep renew /var/log/letsencrypt/letsencrypt.log

# Check certificate validity
sudo certbot certificates
```

## Security Hardening

### SSL/TLS Configuration

Create enhanced SSL configuration:

```bash
sudo nano /etc/letsencrypt/options-ssl-apache.conf
```

Add enhanced security settings:
```apache
# Enhanced SSL Configuration
SSLEngine on
SSLProtocol -all +TLSv1.2 +TLSv1.3
SSLCipherSuite ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
SSLHonorCipherOrder on
SSLCompression off
SSLUseStapling on
SSLStaplingCache "shmcb:logs/stapling-cache(150000)"
```

### Security Headers

Add comprehensive security headers to your SSL virtual host:

```apache
# Security Headers
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
```

## Troubleshooting SSL Issues

### Common SSL Problems

**Certificate not found:**
```bash
# Check certificate files exist
ls -la /etc/letsencrypt/live/your-domain.com/

# Check Apache error log
sudo tail -f /var/log/apache2/error.log
```

**Mixed content warnings:**
```bash
# Check for HTTP resources on HTTPS pages
grep -r "http://" /var/www/your-domain.com/

# Update any hardcoded HTTP URLs to HTTPS
```

**Certificate validation failed:**
```bash
# Verify domain ownership
sudo certbot certonly --manual -d your-domain.com

# Check DNS resolution
nslookup your-domain.com
dig your-domain.com
```

### Certificate Renewal Issues

**Renewal failing:**
```bash
# Check renewal log
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Test renewal manually
sudo certbot renew --force-renewal -v

# Check Apache configuration
sudo apache2ctl configtest
```

**Port 80 blocked:**
```bash
# Ensure port 80 is accessible for challenges
sudo netstat -tlnp | grep :80

# Temporarily stop Apache if needed
sudo systemctl stop apache2
sudo certbot renew
sudo systemctl start apache2
```

## Performance Optimization

### Enable HTTP/2

HTTP/2 improves performance over HTTPS:

```bash
# Enable HTTP/2 module
sudo a2enmod http2

# Add to SSL virtual host
echo "Protocols h2 http/1.1" | sudo tee -a /etc/apache2/sites-available/your-domain.com-le-ssl.conf

# Restart Apache
sudo systemctl restart apache2
```

### SSL Session Caching

Improve SSL performance with session caching:

```apache
# Add to SSL configuration
SSLSessionCache        "shmcb:${APACHE_RUN_DIR}/ssl_scache(512000)"
SSLSessionCacheTimeout  300
```

## Monitoring SSL Health

### Certificate Expiration Monitoring

Set up monitoring for certificate expiration:

```bash
# Create monitoring script
sudo nano /usr/local/bin/check-ssl.sh
```

```bash
#!/bin/bash
# Check SSL certificate expiration
DOMAIN="your-domain.com"
EXPIRY=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
CURRENT_EPOCH=$(date +%s)
DAYS_UNTIL_EXPIRY=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))

if [ $DAYS_UNTIL_EXPIRY -lt 30 ]; then
    echo "WARNING: SSL certificate for $DOMAIN expires in $DAYS_UNTIL_EXPIRY days"
    # Add notification logic here (email, etc.)
fi
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/check-ssl.sh

# Add to crontab for daily checks
echo "0 9 * * * /usr/local/bin/check-ssl.sh" | sudo crontab -
```

### SSL Configuration Testing

Regular testing script:

```bash
# Create SSL test script
sudo nano /usr/local/bin/test-ssl.sh
```

```bash
#!/bin/bash
DOMAIN="your-domain.com"

# Test HTTPS connection
if curl -s -I https://$DOMAIN | grep -q "HTTP/.*200"; then
    echo "HTTPS connection: OK"
else
    echo "HTTPS connection: FAILED"
fi

# Test HTTP redirect
if curl -s -I http://$DOMAIN | grep -q "301\|302"; then
    echo "HTTP redirect: OK"
else
    echo "HTTP redirect: FAILED"
fi

# Test certificate validity
if openssl s_client -connect $DOMAIN:443 -servername $DOMAIN </dev/null 2>/dev/null | openssl x509 -noout -checkend 2592000; then
    echo "Certificate validity: OK (valid for 30+ days)"
else
    echo "Certificate validity: WARNING (expires within 30 days)"
fi
```

## Backup SSL Configuration

```bash
# Backup Let's Encrypt configuration
sudo tar -czf ~/letsencrypt-backup-$(date +%Y%m%d).tar.gz /etc/letsencrypt/

# Backup Apache SSL configuration
sudo cp /etc/apache2/sites-available/your-domain.com-le-ssl.conf ~/ssl-vhost-backup.conf
```

## Next Steps

With SSL configured:

1. **Update all links** to use HTTPS
2. **Test thoroughly** - verify all functionality works over HTTPS
3. **Monitor certificate** - set up expiration alerts
4. **Security scan** - run security assessment tools
5. **Performance test** - verify HTTPS performance is acceptable

## SSL Resources

- **Let's Encrypt**: [letsencrypt.org](https://letsencrypt.org/)
- **SSL Labs Test**: [ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/)
- **Mozilla SSL Config**: [ssl-config.mozilla.org](https://ssl-config.mozilla.org/)
- **Certificate Transparency**: [crt.sh](https://crt.sh/)

:::tip Best Practice
Always test your SSL configuration after setup and after any changes. Use both automated tools and manual testing to ensure everything works correctly.
:::

:::warning Certificate Backup
While Let's Encrypt certificates can be re-issued, backing up your certificate configuration helps with disaster recovery and server migrations.
:::