# Common Issues

This guide covers the most frequently encountered problems when managing BMLT and YAP installations, with step-by-step solutions.

## Website Not Loading

### Symptoms
- Browser shows "This site can't be reached"
- Connection timeout errors
- Server not responding

### Diagnosis Steps

**1. Check Apache Status:**
```bash
sudo systemctl status apache2
```

**2. Test Web Server Response:**
```bash
# Test locally
curl -I http://localhost

# Test with your domain/IP
curl -I http://your-domain.com
```

**3. Check Apache Error Log:**
```bash
sudo tail -f /var/log/apache2/error.log
```

### Common Solutions

**Apache Not Running:**
```bash
# Start Apache
sudo systemctl start apache2

# Enable auto-start
sudo systemctl enable apache2

# Check why it failed
sudo systemctl status apache2 -l
sudo journalctl -u apache2 -f
```

**Apache Configuration Error:**
```bash
# Test configuration
sudo apache2ctl configtest

# Common fix for syntax errors
sudo nano /etc/apache2/sites-available/your-domain.com.conf

# Reload after fixing
sudo systemctl reload apache2
```

**Port 80/443 Blocked:**
```bash
# Check if ports are listening
sudo netstat -tlnp | grep -E ':80|:443'

# Check firewall
sudo ufw status

# Allow HTTP/HTTPS if blocked
sudo ufw allow 'Apache Full'
```

## Database Connection Errors

### Symptoms
- BMLT shows "Database connection failed"
- White screen with PHP database errors
- YAP unable to connect to database

### Diagnosis Steps

**1. Check MySQL Status:**
```bash
sudo systemctl status mysql
```

**2. Test Database Connection:**
```bash
# Test as root
sudo mysql

# Test as BMLT user
mysql -u bmlt -p

# Test specific database
mysql -u bmlt -p bmlt
```

**3. Check Error Logs:**
```bash
sudo tail -f /var/log/mysql/error.log
sudo tail -f /var/log/apache2/error.log
```

### Common Solutions

**MySQL Not Running:**
```bash
# Start MySQL
sudo systemctl start mysql

# Enable auto-start
sudo systemctl enable mysql

# Check for startup errors
sudo journalctl -u mysql -f
```

**Wrong Database Credentials:**
```bash
# Check BMLT configuration
sudo grep -E "(username|password)" /var/www/your-domain.com/auto-config.inc.php

# Check YAP configuration  
sudo grep -E "mysql_" /var/www/your-domain.com/yap/config.php

# Reset database user password
sudo mysql
ALTER USER 'bmlt'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

**Database Doesn't Exist:**
```bash
# Check existing databases
sudo mysql -e "SHOW DATABASES;"

# Recreate database if missing
sudo mysql -e "CREATE DATABASE bmlt;"
sudo mysql -e "GRANT ALL PRIVILEGES ON bmlt.* TO 'bmlt'@'localhost';"
```

## SSL Certificate Issues

### Symptoms
- SSL certificate warnings in browser
- "Connection not secure" messages
- SSL certificate expired errors

### Diagnosis Steps

**1. Check Certificate Status:**
```bash
# View certificate details
sudo certbot certificates

# Check expiration
openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -noout -dates

# Test SSL connection
curl -I https://your-domain.com
```

**2. Check Apache SSL Configuration:**
```bash
# View SSL virtual host
sudo nano /etc/apache2/sites-available/your-domain.com-le-ssl.conf

# Check if SSL module is enabled
sudo a2enmod ssl
```

### Common Solutions

**Certificate Expired:**
```bash
# Renew certificate
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal

# Restart Apache
sudo systemctl restart apache2
```

**Certificate Not Found:**
```bash
# Request new certificate
sudo certbot --apache -d your-domain.com

# Check certificate files exist
ls -la /etc/letsencrypt/live/your-domain.com/
```

**Mixed Content Warnings:**
```bash
# Find HTTP links in HTTPS pages
grep -r "http://" /var/www/your-domain.com/

# Update configuration files to use HTTPS
sudo sed -i 's/http:\/\/your-domain.com/https:\/\/your-domain.com/g' /var/www/your-domain.com/auto-config.inc.php
```

## BMLT Admin Access Issues

### Symptoms
- Cannot log into BMLT admin
- "Invalid credentials" errors
- Admin interface not loading

### Diagnosis Steps

**1. Check BMLT Logs:**
```bash
sudo tail -f /var/www/your-domain.com/main_server/storage/logs/laravel.log
```

**2. Test Admin URL:**
```bash
curl -I https://your-domain.com/main_server/admin
```

**3. Check File Permissions:**
```bash
ls -la /var/www/your-domain.com/main_server/
ls -la /var/www/your-domain.com/auto-config.inc.php
```

### Common Solutions

**Forgot Admin Password:**
```bash
# Connect to BMLT database
sudo mysql bmlt

# Find admin user
SELECT * FROM bmlt_comdef_users WHERE user_level_tinyint = 1;

# Reset password (replace with actual user ID and new password hash)
UPDATE bmlt_comdef_users SET password_string = MD5('new_password') WHERE id_bigint = 1;
```

**Permission Errors:**
```bash
# Fix file ownership
sudo chown -R www-data:www-data /var/www/your-domain.com/main_server

# Fix directory permissions
sudo find /var/www/your-domain.com/main_server -type d -exec chmod 755 {} \;

# Fix file permissions
sudo find /var/www/your-domain.com/main_server -type f -exec chmod 644 {} \;

# Secure config file
sudo chmod 600 /var/www/your-domain.com/auto-config.inc.php
```

**Configuration File Issues:**
```bash
# Check if config file exists
ls -la /var/www/your-domain.com/auto-config.inc.php

# Verify PHP syntax
php -l /var/www/your-domain.com/auto-config.inc.php

# Check configuration values
sudo grep -v password /var/www/your-domain.com/auto-config.inc.php
```

## YAP Phone System Issues

### Symptoms
- YAP not answering calls
- Calls dropping immediately
- SMS not working

### Diagnosis Steps

**1. Check YAP Logs:**
```bash
sudo tail -f /var/www/your-domain.com/yap/storage/logs/laravel.log
```

**2. Test Twilio Webhook:**
```bash
curl -X POST https://your-domain.com/yap/index.php
```

**3. Check YAP Configuration:**
```bash
sudo grep -E "(twilio|bmlt)" /var/www/your-domain.com/yap/config.php
```

### Common Solutions

**Twilio Webhook Issues:**
```bash
# Verify YAP is accessible
curl -I https://your-domain.com/yap/

# Check Twilio webhook URLs in console
# Voice: https://your-domain.com/yap/index.php
# SMS: https://your-domain.com/yap/sms-gateway.php

# Test webhook response
curl -X POST -d "CallSid=test" https://your-domain.com/yap/index.php
```

**YAP Configuration Problems:**
```bash
# Verify YAP config syntax
php -l /var/www/your-domain.com/yap/config.php

# Test BMLT connection from YAP
curl https://your-domain.com/main_server/client_interface/json/?switcher=GetServerInfo

# Check Twilio credentials
# (Don't expose actual credentials in logs)
```

**Database Connection Issues:**
```bash
# Test YAP database connection
mysql -u yap -p -e "SELECT 1;"

# Check YAP database tables
mysql -u yap -p yap -e "SHOW TABLES;"
```

## Performance Issues

### Symptoms
- Slow page loading times
- Server timeouts
- High memory/CPU usage

### Diagnosis Steps

**1. Monitor System Resources:**
```bash
# Check current resource usage
htop

# Memory usage
free -h

# Disk usage
df -h

# Check system load
uptime
```

**2. Check Process Usage:**
```bash
# Top memory consumers
ps aux --sort=-%mem | head

# Top CPU consumers  
ps aux --sort=-%cpu | head

# Apache process count
ps aux | grep apache2 | wc -l
```

**3. Check Logs for Errors:**
```bash
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/mysql/error.log
sudo dmesg | tail
```

### Common Solutions

**High Memory Usage:**
```bash
# Restart Apache to free memory
sudo systemctl restart apache2

# Optimize MySQL configuration
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Add memory optimizations
[mysqld]
innodb_buffer_pool_size = 256M
query_cache_size = 64M
query_cache_limit = 2M

# Restart MySQL
sudo systemctl restart mysql
```

**Slow Database Queries:**
```bash
# Enable slow query log
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Add slow query logging
[mysqld]
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# Check slow queries
sudo tail -f /var/log/mysql/slow.log
```

**Apache Performance:**
```bash
# Optimize Apache for lower memory usage
sudo nano /etc/apache2/mods-available/mpm_prefork.conf

<IfModule mpm_prefork_module>
    StartServers          2
    MinSpareServers       2
    MaxSpareServers       5
    MaxRequestWorkers     20
    MaxConnectionsPerChild   1000
</IfModule>

# Enable compression
sudo a2enmod deflate
sudo systemctl restart apache2
```

## File Permission Issues

### Symptoms
- "Permission denied" errors
- Cannot write to files
- 403 Forbidden errors

### Diagnosis Steps

**1. Check File Ownership:**
```bash
ls -la /var/www/your-domain.com/
ls -la /var/www/your-domain.com/main_server/
```

**2. Check Apache Error Log:**
```bash
sudo tail -f /var/log/apache2/error.log
```

### Common Solutions

**Fix Web Directory Permissions:**
```bash
# Set correct ownership
sudo chown -R www-data:www-data /var/www/your-domain.com

# Set directory permissions
sudo find /var/www/your-domain.com -type d -exec chmod 755 {} \;

# Set file permissions
sudo find /var/www/your-domain.com -type f -exec chmod 644 {} \;

# Make sure Apache can read configuration
sudo chmod 600 /var/www/your-domain.com/auto-config.inc.php
sudo chown www-data:www-data /var/www/your-domain.com/auto-config.inc.php
```

**Fix Log Directory Permissions:**
```bash
# BMLT logs
sudo chown -R www-data:www-data /var/www/your-domain.com/main_server/storage/logs/
sudo chmod -R 755 /var/www/your-domain.com/main_server/storage/logs/

# YAP logs
sudo chown -R www-data:www-data /var/www/your-domain.com/yap/storage/logs/
sudo chmod -R 755 /var/www/your-domain.com/yap/storage/logs/
```

## PHP Errors

### Symptoms
- White screen (WSOD)
- PHP error messages
- 500 Internal Server Error

### Diagnosis Steps

**1. Check PHP Error Log:**
```bash
sudo tail -f /var/log/apache2/error.log
```

**2. Test PHP Configuration:**
```bash
# Check PHP version
php --version

# Test PHP configuration
php -l /var/www/your-domain.com/auto-config.inc.php

# Check PHP modules
php -m | grep -E "(mysql|curl|gd)"
```

### Common Solutions

**Missing PHP Extensions:**
```bash
# Install missing extensions
sudo apt install php-mysql php-curl php-gd php-zip php-mbstring php-xml

# Restart Apache
sudo systemctl restart apache2
```

**PHP Configuration Issues:**
```bash
# Check PHP configuration file
sudo nano /etc/php/8.1/apache2/php.ini

# Common fixes
memory_limit = 256M
max_execution_time = 300
post_max_size = 64M
upload_max_filesize = 64M

# Restart Apache after changes
sudo systemctl restart apache2
```

**Syntax Errors:**
```bash
# Check file syntax
php -l /var/www/your-domain.com/auto-config.inc.php
php -l /var/www/your-domain.com/yap/config.php

# Fix common issues (missing semicolons, quotes, etc.)
```

## Disk Space Issues

### Symptoms
- "No space left on device" errors
- Cannot create files
- System running slowly

### Diagnosis Steps

**1. Check Disk Usage:**
```bash
# Overall disk usage
df -h

# Directory usage
du -sh /var/*

# Find large files
find /var -size +100M -type f 2>/dev/null
```

**2. Check Log File Sizes:**
```bash
ls -lah /var/log/apache2/
ls -lah /var/log/mysql/
```

### Common Solutions

**Clean Up Log Files:**
```bash
# Truncate large log files (be careful!)
sudo truncate -s 0 /var/log/apache2/access.log
sudo truncate -s 0 /var/log/apache2/error.log

# Clean system logs
sudo journalctl --vacuum-size=100M

# Set up log rotation
sudo nano /etc/logrotate.d/bmlt-logs
```

**Clean Package Cache:**
```bash
sudo apt autoremove -y
sudo apt autoclean
sudo apt clean
```

**Remove Old Backups:**
```bash
# Clean old database backups
find /var/backups -name "*.gz" -mtime +30 -delete

# Clean temporary files
sudo rm -rf /tmp/*
```

## Network Connectivity Issues

### Symptoms
- External API calls failing
- Cannot download updates
- SSL certificate renewal failing

### Diagnosis Steps

**1. Test Internet Connectivity:**
```bash
# Test DNS resolution
nslookup google.com

# Test external connectivity
ping -c 4 8.8.8.8

# Test HTTPS connectivity
curl -I https://github.com
```

**2. Check Firewall Rules:**
```bash
# Check UFW status
sudo ufw status

# Check iptables rules
sudo iptables -L
```

### Common Solutions

**DNS Resolution Issues:**
```bash
# Check DNS configuration
cat /etc/resolv.conf

# Test with different DNS
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf

# Restart networking
sudo systemctl restart systemd-resolved
```

**Firewall Blocking Outbound:**
```bash
# Allow outbound HTTPS
sudo ufw allow out 443

# Allow outbound HTTP
sudo ufw allow out 80

# Allow DNS
sudo ufw allow out 53
```

## Emergency Recovery Procedures

### System Won't Boot

**1. Boot from recovery mode**
**2. Check disk space:**
```bash
df -h
```

**3. Check system logs:**
```bash
journalctl -b -1
```

**4. Repair file system:**
```bash
fsck /dev/sda1
```

### Database Corruption

**1. Stop services:**
```bash
sudo systemctl stop apache2 mysql
```

**2. Repair MySQL:**
```bash
sudo mysqld --repair
```

**3. Restore from backup:**
```bash
sudo mysql bmlt < /var/backups/bmlt/latest-backup.sql
```

### Complete System Recovery

**1. Restore from server snapshot (if available)**
**2. Reinstall from scratch using backup data**
**3. Follow installation procedures with restored configuration**

## Prevention Best Practices

### Regular Maintenance

```bash
# Weekly system updates
sudo apt update && sudo apt upgrade -y

# Monthly log cleanup
sudo journalctl --vacuum-time=30d

# Regular backup verification
/usr/local/bin/verify-backups.sh
```

### Monitoring Setup

```bash
# Set up disk space monitoring
echo "df -h | awk 'NR>1 && \$5 > \"90%\" {print \$0}'" > /usr/local/bin/disk-check.sh
echo "0 */6 * * * /usr/local/bin/disk-check.sh" | sudo crontab -
```

### Documentation

- Keep installation notes updated
- Document any custom configurations
- Maintain contact information for support
- Record all passwords in secure location

:::tip Prevention is Key
Most issues can be prevented with regular maintenance, monitoring, and keeping systems updated. Establish a routine maintenance schedule.
:::

:::warning Emergency Contacts
Always have a plan for emergency support, including contact information for your hosting provider and any technical consultants.
:::