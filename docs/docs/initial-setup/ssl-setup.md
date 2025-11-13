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

### Check Renewal History

```bash
# View renewal attempts
sudo grep renew /var/log/letsencrypt/letsencrypt.log

# Check certificate validity
sudo certbot certificates
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

## Next Steps

With SSL configured:

1. **Update all links** to use HTTPS
2. **Test thoroughly** - verify all functionality works over HTTPS

## SSL Resources

- **Let's Encrypt**: [letsencrypt.org](https://letsencrypt.org/)
- **SSL Labs Test**: [ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/)
- **Mozilla SSL Config**: [ssl-config.mozilla.org](https://ssl-config.mozilla.org/)
- **Certificate Transparency**: [crt.sh](https://crt.sh/)

:::tip Best Practice
Always test your SSL configuration after setup and after any changes. Test to ensure everything works correctly.
:::
