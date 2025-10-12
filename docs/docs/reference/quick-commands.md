# Quick Command Reference

Essential commands for managing your BMLT/YAP server. Keep this page bookmarked for quick reference.

## System Status Commands

### Check Service Status
```bash
# Check all key services
sudo systemctl status apache2
sudo systemctl status mysql
php --version

# Quick status check
sudo systemctl is-active apache2 mysql
```

### System Resources
```bash
# Disk space
df -h

# Memory usage
free -h

# CPU and process monitor
htop

# System load
uptime
```

### Network and Connectivity
```bash
# Test web server response
curl -I http://localhost

# Check open ports
sudo netstat -tlnp

# Test domain resolution
nslookup your-domain.com
```

## Log Monitoring Commands

### Apache Logs
```bash
# View recent Apache errors
sudo tail -f /var/log/apache2/error.log

# View recent access logs
sudo tail -f /var/log/apache2/access.log

# Search for specific errors
sudo grep "500" /var/log/apache2/error.log
sudo grep "404" /var/log/apache2/access.log
```

### BMLT Application Logs
```bash
# View BMLT Laravel logs
sudo tail -f /var/www/your-domain.com/main_server/storage/logs/laravel.log

# Search for BMLT errors
sudo grep "ERROR" /var/www/your-domain.com/main_server/storage/logs/laravel.log
```

### YAP Application Logs
```bash
# View YAP logs
sudo tail -f /var/www/your-domain.com/yap/storage/logs/laravel.log
```

### System Logs
```bash
# View system messages
sudo journalctl -f

# View recent boot messages
sudo journalctl -b

# MySQL error log
sudo tail -f /var/log/mysql/error.log
```

## Database Commands

### MySQL Access
```bash
# Connect as root
sudo mysql

# Connect to specific database
sudo mysql bmlt
sudo mysql yap

# Connect as specific user
mysql -u bmlt -p
mysql -u yap -p
```

### Database Backup
```bash
# Backup BMLT database
sudo mysqldump bmlt > bmlt-backup-$(date +%Y%m%d).sql
sudo mysqldump bmlt | gzip > bmlt-backup-$(date +%Y%m%d).gz

# Backup YAP database
sudo mysqldump yap > yap-backup-$(date +%Y%m%d).sql
sudo mysqldump yap | gzip > yap-backup-$(date +%Y%m%d).gz

# Backup all databases
sudo mysqldump --all-databases > full-backup-$(date +%Y%m%d).sql
```

### Database Restore
```bash
# Restore BMLT database
sudo mysql bmlt < bmlt-backup-20231212.sql

# Restore from compressed backup
gzip -d bmlt-backup-20231212.gz
sudo mysql bmlt < bmlt-backup-20231212.sql
```

## Apache Management

### Service Control
```bash
# Start/Stop/Restart Apache
sudo systemctl start apache2
sudo systemctl stop apache2
sudo systemctl restart apache2
sudo systemctl reload apache2
```

### Configuration
```bash
# Test Apache configuration
sudo apache2ctl configtest

# Show virtual hosts
sudo apache2ctl -S

# Enable/Disable sites
sudo a2ensite your-domain.com.conf
sudo a2dissite 000-default.conf

# Enable/Disable modules
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2dismod status
```

## File Management

### Permissions and Ownership
```bash
# Set correct ownership for web files
sudo chown -R www-data:www-data /var/www/your-domain.com

# Set directory permissions
sudo find /var/www/your-domain.com -type d -exec chmod 755 {} \;

# Set file permissions
sudo find /var/www/your-domain.com -type f -exec chmod 644 {} \;

# Secure configuration files
sudo chmod 600 /var/www/your-domain.com/auto-config.inc.php
sudo chmod 600 /var/www/your-domain.com/yap/config.php
```

### File Operations
```bash
# Navigate to web directories
cd /var/www/your-domain.com
cd /var/www/your-domain.com/main_server
cd /var/www/your-domain.com/yap

# List files with details
ls -la

# Check disk usage of directory
du -sh /var/www/your-domain.com

# Find large files
find /var/www -size +100M -type f
```

## System Updates

### Package Management
```bash
# Update package list
sudo apt update

# Upgrade packages
sudo apt upgrade -y

# Upgrade system (more comprehensive)
sudo apt full-upgrade -y

# Clean package cache
sudo apt autoremove -y
sudo apt autoclean
```

### Service Restart After Updates
```bash
# Restart services after updates
sudo systemctl restart apache2
sudo systemctl restart mysql

# Check if reboot required
if [ -f /var/run/reboot-required ]; then
    echo "Reboot required"
fi
```

## SSL/Security Commands

### Certbot (Let's Encrypt)
```bash
# Request new certificate
sudo certbot --apache -d your-domain.com

# Renew certificates
sudo certbot renew

# Test renewal (dry run)
sudo certbot renew --dry-run

# List certificates
sudo certbot certificates
```

### Firewall Management
```bash
# Check firewall status
sudo ufw status

# Allow services
sudo ufw allow ssh
sudo ufw allow 'Apache Full'

# Enable/Disable firewall
sudo ufw enable
sudo ufw disable
```

## Performance Monitoring

### Resource Usage
```bash
# Monitor CPU/Memory in real-time
htop

# Check memory details
cat /proc/meminfo

# Check CPU information
cat /proc/cpuinfo

# Monitor disk I/O
iostat -x 1

# Network statistics
ss -tuln
```

### Apache Performance
```bash
# Check Apache processes
ps aux | grep apache2

# Monitor Apache connections
sudo netstat -an | grep :80 | wc -l
sudo netstat -an | grep :443 | wc -l

# Apache status (if mod_status enabled)
curl http://localhost/server-status
```

## Troubleshooting Commands

### Service Issues
```bash
# Check why service failed
sudo systemctl status apache2 -l
sudo systemctl status mysql -l

# View service logs
sudo journalctl -u apache2 -f
sudo journalctl -u mysql -f
```

### Connectivity Testing
```bash
# Test local web server
curl -I http://localhost
curl -I https://localhost

# Test external connectivity
ping google.com
curl -I https://bmlt.app
```

### File System Issues
```bash
# Check disk space
df -h

# Check inode usage
df -i

# Find largest directories
du -sh /var/* | sort -rh | head -10

# Check file permissions
ls -la /var/www/your-domain.com/auto-config.inc.php
```

## Emergency Commands

### Service Recovery
```bash
# Force restart services
sudo systemctl restart apache2
sudo systemctl restart mysql

# Kill hung processes (use carefully)
sudo pkill -f apache2
sudo systemctl start apache2
```

### Space Cleanup
```bash
# Clean log files (emergency only)
sudo truncate -s 0 /var/log/apache2/access.log
sudo truncate -s 0 /var/log/apache2/error.log

# Clean journal logs
sudo journalctl --vacuum-size=100M
```

### Backup Current State (Emergency)
```bash
# Quick backup before emergency fixes
sudo mysqldump bmlt > /tmp/emergency-bmlt-backup.sql
sudo cp -r /var/www/your-domain.com /tmp/emergency-web-backup
```

## Configuration File Locations

### Key Configuration Files
```bash
# Apache main configuration
/etc/apache2/apache2.conf

# Virtual host configurations
/etc/apache2/sites-available/your-domain.com.conf

# PHP configuration
/etc/php/8.1/apache2/php.ini

# MySQL configuration
/etc/mysql/mysql.conf.d/mysqld.cnf

# BMLT configuration
/var/www/your-domain.com/auto-config.inc.php

# YAP configuration
/var/www/your-domain.com/yap/config.php
```

### Log File Locations
```bash
# Apache logs
/var/log/apache2/error.log
/var/log/apache2/access.log

# MySQL logs
/var/log/mysql/error.log

# System logs
/var/log/syslog
/var/log/auth.log

# BMLT logs
/var/www/your-domain.com/main_server/storage/logs/laravel.log

# YAP logs
/var/www/your-domain.com/yap/storage/logs/laravel.log
```

:::tip Alias Commands
Add these aliases to your `~/.bashrc` for quicker access:

```bash
alias bmlt-logs="sudo tail -f /var/www/your-domain.com/main_server/storage/logs/laravel.log"
alias apache-error="sudo tail -f /var/log/apache2/error.log"
alias apache-access="sudo tail -f /var/log/apache2/access.log"
alias bmlt-backup="sudo mysqldump bmlt | gzip > ~/bmlt-backup-\$(date +%Y%m%d-%H%M).gz"
```
:::

:::warning
Always backup before running system-changing commands. When in doubt, create a server snapshot first.
:::