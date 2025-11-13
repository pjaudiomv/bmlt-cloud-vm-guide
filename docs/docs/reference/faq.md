# Frequently Asked Questions

Common questions and answers about managing BMLT and YAP installations on cloud servers.

## General Questions

### What is BMLT?

**Q: What does BMLT stand for and what does it do?**

A: BMLT stands for "Basic Meeting List Toolbox." It's a comprehensive web application designed to help 12-step recovery fellowships manage and display their meeting information. It provides:
- Centralized meeting database
- Web-based administration interface
- Search and display capabilities
- Integration with websites and mobile apps
- API for third-party applications

### What is YAP?

**Q: What is YAP and do I need it?**

A: YAP stands for "Yet Another Phonebot." It's a telephone helpline system that integrates with BMLT and Twilio to provide phone-based services:
- Meeting search by phone
- Helpline call routing
- Conference calling
- SMS meeting information

You only need YAP if you want to provide telephone helpline services.

### What are the system requirements?

**Q: What kind of server do I need to run BMLT?**

A: Minimum requirements:
- **OS**: Ubuntu 24.04 LTS (recommended)
- **RAM**: 2GB minimum, 4GB+ recommended
- **CPU**: 2 vCPUs minimum  
- **Storage**: 50GB minimum, 100GB+ recommended
- **Network**: Public IP address with HTTP/HTTPS access

For production use with many meetings and users, consider higher specifications.

## Installation Questions

### Can I use a different Linux distribution?

**Q: Does this guide work with CentOS, Debian, or other Linux distributions?**

A: This guide is specifically written for Ubuntu, but the concepts apply to other distributions. You'll need to adapt:
- Package manager commands (`yum` instead of `apt`)
- Service management (some distributions use different init systems)
- File paths and configuration locations

### Do I need a domain name?

**Q: Can I run BMLT without a domain name?**

A: You can run BMLT with just an IP address, but a domain name is strongly recommended for:
- SSL certificates (Let's Encrypt requires a domain)
- Professional appearance
- YAP/Twilio integration (requires HTTPS)
- Better SEO and user experience

### What if I don't want to use Apache?

**Q: Can I use Nginx instead of Apache?**

A: Yes, but this guide focuses on Apache. With Nginx, you'll need to:
- Configure Nginx virtual hosts instead of Apache
- Set up PHP-FPM instead of mod_php
- Adapt URL rewriting rules
- Configure SSL differently

The database and PHP requirements remain the same.

## Configuration Questions

### How do I change the BMLT admin password?

**Q: I forgot my BMLT admin password. How do I reset it?**

A: Connect to the BMLT database and update the password:

```bash
sudo mysql bmlt
```

```sql
-- Find admin users
SELECT id_bigint, name_string, login_string FROM bmlt_comdef_users WHERE user_level_tinyint = 1;

-- Reset password (replace 1 with actual user ID)
UPDATE bmlt_comdef_users SET password_string = MD5('new_password') WHERE id_bigint = 1;
```

### How do I add more administrators?

**Q: How do I create additional BMLT admin accounts?**

A: Use the BMLT admin interface:
1. Log into BMLT admin
2. Go to "User Manager"  
3. Click "Create New User"
4. Set appropriate permissions

Or add directly to database:
```sql
INSERT INTO bmlt_comdef_users (name_string, login_string, password_string, user_level_tinyint) 
VALUES ('Admin Name', 'username', MD5('password'), 1);
```

### How do I configure email settings?

**Q: How do I set up email notifications in BMLT?**

A: BMLT email settings are configured in the admin panel:
1. Go to BMLT Admin → Service Body Administration
2. Configure SMTP settings in the service body details
3. Test email functionality

For server-level email:
```bash
# Install mail server
sudo apt install postfix

# Configure for your domain
sudo dpkg-reconfigure postfix
```

## Backup and Maintenance

### How often should I backup?

**Q: What's a good backup schedule?**

A: Recommended schedule:
- **Daily**: Database backups
- **Weekly**: Full system backup (databases + files)
- **Monthly**: Long-term archival backups
- **Before updates**: Always backup before major changes

### Where should I store backups?

**Q: Where's the best place to store my backups?**

A: Follow the 3-2-1 rule:
- **3 copies** of your data
- **2 different types** of storage media
- **1 copy stored offsite**

Options:
- Local server storage
- Remote server (rsync)
- Cloud storage (S3, Google Drive, Dropbox)
- External drives (for critical data)

### How do I test backups?

**Q: How do I know my backups will work when I need them?**

A: Regular testing:
```bash
# Test backup file integrity
gzip -t backup-file.gz

# Create test database and restore
sudo mysql -e "CREATE DATABASE test_restore;"
zcat backup-file.gz | sudo mysql test_restore

# Verify data
sudo mysql test_restore -e "SELECT COUNT(*) FROM bmlt_comdef_meetings;"

# Cleanup
sudo mysql -e "DROP DATABASE test_restore;"
```

## Security Questions

### How do I secure my server?

**Q: What security measures should I implement?**

A: Essential security steps:
1. **Keep software updated**: `sudo apt update && sudo apt upgrade`
2. **Use SSH keys**: Disable password authentication
3. **Configure firewall**: Only allow necessary ports
4. **Enable SSL/HTTPS**: Use Let's Encrypt certificates
5. **Regular backups**: Automated and tested
6. **Monitor logs**: Watch for suspicious activity
7. **Secure file permissions**: Proper ownership and permissions

### Should I change default ports?

**Q: Should I run SSH on a different port?**

A: This is security through obscurity and provides minimal benefit. Focus on:
- Using SSH keys instead of passwords
- Restricting SSH access to specific IP addresses
- Using fail2ban to prevent brute force attacks
- Keeping SSH updated

### How do I prevent spam/abuse?

**Q: How do I protect against spam or abuse of my BMLT server?**

A: Security measures:
- Use CAPTCHA for public forms
- Implement rate limiting
- Monitor access logs for unusual activity
- Use CloudFlare or similar CDN/protection service
- Restrict admin access to known IP addresses

## Performance Questions

### My site is running slowly. What can I do?

**Q: BMLT is loading slowly. How can I improve performance?**

A: Performance optimization:

1. **Check server resources**:
```bash
htop
free -h
df -h
```

2. **Optimize MySQL**:
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```
Add:
```ini
[mysqld]
innodb_buffer_pool_size = 256M
query_cache_size = 64M
```

3. **Enable Apache compression**:
```bash
sudo a2enmod deflate
sudo systemctl restart apache2
```

4. **Use HTTP/2**:
```bash
sudo a2enmod http2
```

### How many meetings can BMLT handle?

**Q: What's the maximum number of meetings BMLT can support?**

A: BMLT can handle thousands of meetings efficiently. Performance depends on:
- Server specifications (RAM, CPU)
- Database optimization
- Network bandwidth
- User concurrency

Typical servers handle 1,000+ meetings without issues.

## Update Questions

### How do I update BMLT?

**Q: How do I upgrade to a newer version of BMLT?**

A: Update process:
1. **Backup first**: Database and files
2. **Download new version**:
```bash
wget https://github.com/bmlt-enabled/bmlt-server/releases/download/VERSION/bmlt-server.zip
```
3. **Extract and replace**:
```bash
sudo unzip bmlt-server.zip
sudo mv main_server main_server_backup
sudo mv extracted_main_server main_server
sudo chown -R www-data:www-data main_server
```
4. **Run database updates** (BMLT handles this automatically)

### Do I need to update YAP separately?

**Q: How do I update YAP to a newer version?**

A: Yes, YAP updates separately from BMLT:
1. Backup YAP database and configuration
2. Download new YAP version
3. Replace YAP files (keep config.php)
4. Test phone functionality

### How often are updates released?

**Q: How frequently are BMLT and YAP updated?**

A: Update frequency varies:
- **Security updates**: As needed (apply immediately)
- **Bug fixes**: Monthly to quarterly
- **Feature releases**: 2-4 times per year

Subscribe to GitHub releases for notifications.

## YAP-Specific Questions

### Do I need Twilio for YAP?

**Q: Is Twilio required for YAP?**

A: Yes, YAP requires Twilio for phone services. Twilio provides:
- Phone numbers
- Call routing
- SMS services
- Recording capabilities

### How much does Twilio cost?

**Q: What are the costs for using YAP with Twilio?**

A: Twilio pricing (as of 2024):
- Phone number: ~$1/month
- Incoming calls: ~$0.0075/minute
- Outgoing calls: ~$0.013/minute  
- SMS: ~$0.007/message

Actual costs depend on usage volume.

### Can I use YAP without SMS?

**Q: Can I disable SMS features in YAP?**

A: Yes, SMS is optional. In YAP configuration:
```php
static $sms_enable = false;
```

You'll still need Twilio for voice calls.

## Troubleshooting Questions

### Where are the log files?

**Q: Where can I find error logs?**

A: Key log locations:
- **Apache errors**: `/var/log/apache2/error.log`
- **Apache access**: `/var/log/apache2/access.log`
- **MySQL errors**: `/var/log/mysql/error.log`
- **BMLT errors**: `/var/www/your-domain.com/main_server/storage/logs/laravel.log`
- **YAP errors**: `/var/www/your-domain.com/yap/storage/logs/laravel.log`
- **System logs**: `journalctl -f`

### What if BMLT shows a white screen?

**Q: BMLT shows a blank white page. What's wrong?**

A: White Screen of Death (WSOD) troubleshooting:
1. **Check Apache error log**:
```bash
sudo tail -f /var/log/apache2/error.log
```
2. **Check file permissions**:
```bash
sudo chown -R www-data:www-data /var/www/your-domain.com/main_server
```
3. **Check PHP errors**:
```bash
php -l /var/www/your-domain.com/auto-config.inc.php
```
4. **Check database connection**:
```bash
mysql -u bmlt -p bmlt
```

### How do I get help?

**Q: Where can I get support for BMLT/YAP issues?**

A: Support resources:
- **BMLT Documentation**: [bmlt.app](https://bmlt.app)
- **GitHub Issues**: Report bugs and request features
- **Community Forums**: Ask questions and share experiences
- **This Guide**: Comprehensive server management help

## Migration Questions

### Can I move BMLT to a different server?

**Q: How do I migrate BMLT to a new server?**

A: Migration process:
1. **Backup current server**: Database and files
2. **Set up new server**: Follow installation guide
3. **Transfer data**: 
   - Restore database backup
   - Copy configuration files
   - Update DNS if needed
4. **Test thoroughly**: Verify all functionality
5. **Update integrations**: API endpoints, etc.

### How do I change domains?

**Q: How do I move BMLT to a different domain name?**

A: Domain change process:
1. **Update DNS**: Point new domain to server
2. **Request new SSL certificate**:
    ```bash
    sudo certbot --apache -d new-domain.com
    ```
3. **Update BMLT configuration**: Change URLs in admin panel
4. **Update YAP configuration**: Update BMLT server URL
5. **Test all integrations**: Verify everything works

### Can I merge multiple BMLT installations?

**Q: How do I combine data from multiple BMLT servers?**

A: This is complex and requires:
- Database expertise to merge data
- Careful handling of conflicts
- See [Lettuce](https://github.com/bmlt-enabled/lettuce) a tool for merging servers

Consider professional assistance.


---

:::tip Can't Find Your Answer?
If you can't find the answer to your question here, check the troubleshooting guide or consider asking in BMLT community forums.
:::

:::info Keep This Updated
This FAQ is based on common questions as of 2024. Software and best practices evolve, so verify current information for critical decisions.
:::
