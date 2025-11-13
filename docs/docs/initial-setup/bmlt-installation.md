# BMLT Installation

This guide covers installing the BMLT Server on your configured LAMP stack.

## Download BMLT Server

### Get Latest Release
Download the latest stable version from GitHub:

```bash
# Navigate to web directory
cd /var/www/html
# Or for domain setup: cd /var/www/your-domain.com

# Download BMLT Server (current stable version)
sudo wget https://github.com/bmlt-enabled/bmlt-server/releases/download/4.0.2/bmlt-server.zip

# Extract the archive
sudo unzip bmlt-server.zip

# Remove the zip file
sudo rm bmlt-server.zip

# Set proper ownership
sudo chown -R www-data:www-data main_server

# Set proper permissions
sudo chmod -R 755 main_server
```

## Configure Virtual Host (Recommended)

If using a domain name, create an Apache virtual host:

### Create Virtual Host Configuration
```bash
sudo nano /etc/apache2/sites-available/your-domain.com.conf
```

Add this configuration:
```apache
<VirtualHost *:80>
    ServerAdmin webmaster@your-domain.com
    ServerName your-domain.com
    DocumentRoot /var/www/your-domain.com
    
    ErrorLog ${APACHE_LOG_DIR}/your-domain.com_error.log
    CustomLog ${APACHE_LOG_DIR}/your-domain.com_access.log combined
    
    <Directory "/var/www/your-domain.com">
        AllowOverride All
        Require all granted
    </Directory>
    
    # Optional: Redirect to HTTPS (after SSL setup)
    # RewriteEngine on
    # RewriteCond %{SERVER_NAME} =your-domain.com
    # RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]
</VirtualHost>
```

### Enable the Site
```bash
# Enable your site
sudo a2ensite your-domain.com.conf

# Disable default site (optional)
sudo a2dissite 000-default.conf

# Test configuration
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2
```

## Run BMLT Installation Wizard

### Access Installation
Navigate to your BMLT installation in a web browser:

**With Domain:**
```
http://your-domain.com/main_server
```

**With IP Only:**
```
http://your-server-ip/main_server
```

### Installation Steps

1. **Welcome Screen**
   - Click "Continue" to start installation

2. **Database Configuration**
   - **Database Host**: `localhost`
   - **Database Name**: `bmlt`
   - **Database User**: `bmlt`
   - **Database Password**: Enter the password you created earlier
   - **Table Prefix**: Leave default (`bmlt_`) or customize

3. **Administrator Account**
   - **Login ID**: Choose admin username
   - **Password**: Create strong password
   - **Confirm Password**: Re-enter password
   - **Email Address**: Admin email address
   - **Display Name**: Your name or organization

4. **Service Body Setup**
   - **Service Body Name**: Your area/region name
   - **Description**: Brief description of your service body
   - **Service Body Type**: Usually "Area" or "Region"
   - **Contact Email**: Service body contact email

5. **Meeting Data**
   - Choose to import sample data or start fresh
   - Sample data helps understand the system

6. **Complete Installation**
   - Review settings and click "Install"
   - Installation may take a few minutes

## Post-Installation Configuration

### Remove Installation Files (Security)
After successful installation:

```bash
# Navigate to BMLT directory
cd /var/www/your-domain.com/main_server
# Or: cd /var/www/html/main_server

# Remove installation directory
sudo rm -rf install/
```

### Set File Permissions
Ensure proper security permissions:

```bash
# Set ownership
sudo chown -R www-data:www-data /var/www/your-domain.com/main_server

# Set directory permissions
sudo find /var/www/your-domain.com/main_server -type d -exec chmod 755 {} \;

# Set file permissions
sudo find /var/www/your-domain.com/main_server -type f -exec chmod 644 {} \;

# Secure configuration file
sudo chmod 600 /var/www/your-domain.com/auto-config.inc.php
```

## Verify Installation

### Test BMLT Access
Visit your BMLT installation:
- **Main Interface**: `http://your-domain.com/main_server`
- **Admin Panel**: `http://your-domain.com/main_server/admin`

### Check Configuration
Verify the auto-config file was created:

```bash
# Check if config file exists
ls -la /var/www/your-domain.com/auto-config.inc.php

# View configuration (be careful not to expose passwords)
sudo grep -v password /var/www/your-domain.com/auto-config.inc.php
```

### Test Database Connection
Verify BMLT can connect to the database:

```bash
# Check MySQL connection from BMLT user
mysql -u bmlt -p

# List tables (should show BMLT tables)
USE bmlt;
SHOW TABLES;
EXIT;
```

## Basic BMLT Configuration

### Access Admin Panel
1. Navigate to: `http://your-domain.com/main_server/admin`
2. Log in with the administrator credentials you created
3. You'll see the BMLT administration interface

### Initial Setup Tasks
1. **Configure Service Bodies**: Add your area/region structure
2. **Set up Meetings**: Import or add meeting data
3. **Configure Formats**: Set up meeting formats (Open, Closed, etc.)
4. **User Management**: Add additional administrators if needed

## Troubleshooting

### Common Installation Issues

**Database Connection Failed:**
```bash
# Verify database user
mysql -u bmlt -p

# Check database exists
mysql -u root -p
SHOW DATABASES;
```

**Permission Errors:**
```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/your-domain.com/main_server

# Check Apache error log
sudo tail -f /var/log/apache2/error.log
```

**White Screen/PHP Errors:**
```bash
# Check PHP error log
sudo tail -f /var/log/apache2/error.log

# Verify PHP extensions
php -m | grep -E "(mysql|curl|gd|zip|mbstring|xml)"
```

### Apache Configuration Issues

**Site Not Loading:**
```bash
# Check virtual host configuration
sudo apache2ctl -S

# Test configuration
sudo apache2ctl configtest

# Check if site is enabled
sudo a2ensite your-domain.com.conf
sudo systemctl reload apache2
```

### Performance Optimization

**Enable PHP OPcache (Optional):**
```bash
# Install OPcache
sudo apt install php-opcache -y

# Restart Apache
sudo systemctl restart apache2
```

## Security Hardening

### Hide PHP Version
Edit PHP configuration:
```bash
sudo nano /etc/php/8.1/apache2/php.ini
```

Set:
```ini
expose_php = Off
```

### Secure Auto-Config File
```bash
# Ensure only web server can read config
sudo chmod 600 /var/www/your-domain.com/auto-config.inc.php
sudo chown www-data:www-data /var/www/your-domain.com/auto-config.inc.php
```

### Add Security Headers
Create `.htaccess` file in BMLT directory:
```bash
sudo nano /var/www/your-domain.com/main_server/.htaccess
```

Add security headers:
```apache
# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# Hide server information
ServerTokens Prod
```

## Backup Configuration

Create initial backup after successful installation:

```bash
# Backup database
sudo mysqldump bmlt > ~/bmlt-initial-backup.sql

# Backup configuration file
sudo cp /var/www/your-domain.com/auto-config.inc.php ~/auto-config-backup.php
```

## Next Steps

With BMLT successfully installed:

1. **Configure SSL**: [SSL Setup](ssl-setup) for HTTPS access
2. **Install YAP**: [YAP Installation](yap-installation) if you need phone services
3. **Set up backups**: Configure automated backups
4. **Add meeting data**: Import your meeting information
5. **Configure users**: Set up additional administrators

## BMLT Resources

- **User Manual**: [bmlt.app/documentation](https://bmlt.app/documentation/)
- **Administrator Guide**: Available in BMLT admin panel
- **GitHub Repository**: [github.com/bmlt-enabled/bmlt-server](https://github.com/bmlt-enabled/bmlt-server)
- **Support Forums**: Community support available

:::tip
Document your admin credentials and database passwords in a secure location. You'll need them for maintenance and troubleshooting.
:::

:::warning
Always test BMLT functionality after installation. Verify meeting searches, admin access, and any integrations work properly before going live.
:::