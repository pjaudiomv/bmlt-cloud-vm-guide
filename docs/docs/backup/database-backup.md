# Database Backup

This guide covers creating, managing, and restoring database backups for your BMLT and YAP installations.

## Why Database Backups are Critical

Database backups protect against:
- **Hardware failures** - Server crashes, disk failures
- **Human errors** - Accidental data deletion, wrong updates
- **Software issues** - Corrupted installations, failed updates
- **Security breaches** - Malicious data modification
- **Natural disasters** - Complete server loss

:::warning
Your BMLT database contains all your meeting data, user accounts, and configuration. Without backups, this data could be permanently lost.
:::

## Types of Backups

### Full Database Backup
Complete copy of all database data and structure.

**Advantages:**
- Complete data recovery
- Simple restoration process
- Point-in-time recovery

**Disadvantages:**
- Larger file sizes
- Longer backup/restore times

### Incremental Backups
Only backs up changes since the last backup.

**Advantages:**
- Smaller file sizes
- Faster backup process
- Reduced storage requirements

**Disadvantages:**
- More complex restoration
- Requires chain of backups

## Manual Database Backups

### Basic BMLT Database Backup

```bash
# Simple backup
sudo mysqldump bmlt > bmlt-backup-$(date +%Y%m%d).sql

# Compressed backup (recommended)
sudo mysqldump bmlt | gzip > bmlt-backup-$(date +%Y%m%d).gz

# Backup with timestamp
sudo mysqldump bmlt | gzip > bmlt-backup-$(date +%Y%m%d-%H%M%S).gz
```

### YAP Database Backup

```bash
# YAP database backup
sudo mysqldump yap | gzip > yap-backup-$(date +%Y%m%d).gz

# Include database structure and data
sudo mysqldump --routines --triggers yap | gzip > yap-complete-backup-$(date +%Y%m%d).gz
```

### Complete System Backup

```bash
# Backup all databases
sudo mysqldump --all-databases | gzip > all-databases-backup-$(date +%Y%m%d).gz

# Backup with additional options
sudo mysqldump --all-databases --routines --triggers --events --single-transaction | gzip > complete-mysql-backup-$(date +%Y%m%d).gz
```

## Automated Backup Scripts

### Basic Backup Script

Create a comprehensive backup script:

```bash
sudo nano /usr/local/bin/backup-bmlt.sh
```

```bash
#!/bin/bash
# BMLT/YAP Database Backup Script

# Configuration
BACKUP_DIR="/var/backups/bmlt"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/bmlt-backup.log"

# Create backup directory
mkdir -p $BACKUP_DIR

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

# Function to backup database
backup_database() {
    local db_name=$1
    local backup_file="$BACKUP_DIR/${db_name}-backup-${DATE}.gz"
    
    log_message "Starting backup of $db_name database"
    
    if mysqldump --single-transaction --routines --triggers "$db_name" | gzip > "$backup_file"; then
        log_message "Successfully backed up $db_name to $backup_file"
        # Set permissions
        chmod 600 "$backup_file"
        chown root:root "$backup_file"
    else
        log_message "ERROR: Failed to backup $db_name database"
        return 1
    fi
}

# Function to clean old backups
cleanup_old_backups() {
    log_message "Cleaning up backups older than $RETENTION_DAYS days"
    find "$BACKUP_DIR" -name "*.gz" -mtime +$RETENTION_DAYS -delete
    log_message "Cleanup completed"
}

# Main backup process
log_message "Starting BMLT backup process"

# Backup databases
backup_database "bmlt"
backup_database "yap"

# Backup configuration files
log_message "Backing up configuration files"
tar -czf "$BACKUP_DIR/config-backup-${DATE}.tar.gz" \
    /var/www/*/auto-config.inc.php \
    /var/www/*/yap/config.php \
    2>/dev/null

# Clean up old backups
cleanup_old_backups

# Check disk space
DISK_USAGE=$(df -h $BACKUP_DIR | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    log_message "WARNING: Backup disk usage is ${DISK_USAGE}%"
fi

log_message "BMLT backup process completed"
```

Make the script executable:

```bash
sudo chmod +x /usr/local/bin/backup-bmlt.sh
```

## Automated Backup Scheduling

### Using Cron for Regular Backups

```bash
# Edit crontab
sudo crontab -e

# Add backup schedules
# Daily backup at 2:00 AM
0 2 * * * /usr/local/bin/backup-bmlt.sh

# Weekly full backup on Sunday at 3:00 AM
0 3 * * 0 /usr/local/bin/backup-bmlt-advanced.sh

# Monthly backup with longer retention
0 4 1 * * /usr/local/bin/backup-bmlt-monthly.sh
```

### Using Systemd Timer (Alternative to Cron)

Create a systemd service:

```bash
sudo nano /etc/systemd/system/bmlt-backup.service
```

```ini
[Unit]
Description=BMLT Database Backup
After=mysql.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/backup-bmlt.sh
User=root
```

Create a systemd timer:

```bash
sudo nano /etc/systemd/system/bmlt-backup.timer
```

```ini
[Unit]
Description=Run BMLT backup daily
Requires=bmlt-backup.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

Enable and start the timer:

```bash
sudo systemctl enable bmlt-backup.timer
sudo systemctl start bmlt-backup.timer
sudo systemctl status bmlt-backup.timer
```

## Database Restoration

### Basic Restoration Process

```bash
# Restore BMLT database from backup
gzip -d bmlt-backup-20231212.gz
sudo mysql bmlt < bmlt-backup-20231212.sql

# Or restore directly from compressed backup
zcat bmlt-backup-20231212.gz | sudo mysql bmlt
```

### Complete Database Restoration

```bash
# Drop and recreate database (DANGEROUS - backups required)
sudo mysql -e "DROP DATABASE IF EXISTS bmlt; CREATE DATABASE bmlt;"
zcat bmlt-backup-20231212.gz | sudo mysql bmlt

# Restore with progress indicator
pv bmlt-backup-20231212.gz | zcat | sudo mysql bmlt
```

### Restoration Script

Create a restoration script:

```bash
sudo nano /usr/local/bin/restore-bmlt.sh
```

```bash
#!/bin/bash
# BMLT Database Restoration Script

if [ $# -ne 2 ]; then
    echo "Usage: $0 <database_name> <backup_file>"
    echo "Example: $0 bmlt /var/backups/bmlt/bmlt-backup-20231212.gz"
    exit 1
fi

DATABASE=$1
BACKUP_FILE=$2
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file $BACKUP_FILE not found"
    exit 1
fi

# Test backup file integrity
echo "Testing backup file integrity..."
if ! gzip -t "$BACKUP_FILE" 2>/dev/null; then
    echo "ERROR: Backup file appears to be corrupted"
    exit 1
fi

# Create a backup of current database before restoration
echo "Creating safety backup of current database..."
mysqldump "$DATABASE" | gzip > "/tmp/${DATABASE}-pre-restore-${TIMESTAMP}.gz"

# Confirm restoration
echo "WARNING: This will replace all data in the $DATABASE database"
echo "Current database has been backed up to /tmp/${DATABASE}-pre-restore-${TIMESTAMP}.gz"
read -p "Continue with restoration? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restoration cancelled"
    exit 1
fi

# Perform restoration
echo "Restoring database $DATABASE from $BACKUP_FILE..."
zcat "$BACKUP_FILE" | mysql "$DATABASE"

echo "Database restoration completed successfully"
echo "Pre-restoration backup saved as: /tmp/${DATABASE}-pre-restore-${TIMESTAMP}.gz"
```

Make executable:

```bash
sudo chmod +x /usr/local/bin/restore-bmlt.sh
```

## Backup Verification

### Test Backup Integrity

```bash
# Test compressed backup file
gzip -t backup-file.gz

# Test MySQL dump syntax
zcat backup-file.gz | mysql --force --execute="SET SQL_MODE=''; SOURCE /dev/stdin;" test_db

# Quick verification of backup contents
zcat bmlt-backup.gz | head -50
```

### Automated Verification Script

```bash
sudo nano /usr/local/bin/verify-backups.sh
```

```bash
#!/bin/bash
# Backup Verification Script

BACKUP_DIR="/var/backups/bmlt"
LOG_FILE="/var/log/backup-verification.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

verify_backup() {
    local backup_file=$1
    local basename=$(basename "$backup_file" .gz)
    
    log_message "Verifying $backup_file"
    
    # Test file integrity
    if ! gzip -t "$backup_file"; then
        log_message "ERROR: $backup_file is corrupted"
        return 1
    fi
    
    # Test SQL syntax (basic check)
    if ! zcat "$backup_file" | head -100 | mysql --execute="SET SQL_MODE=''; SOURCE /dev/stdin;" information_schema 2>/dev/null; then
        log_message "WARNING: $backup_file may have SQL syntax issues"
        return 1
    fi
    
    log_message "OK: $backup_file passed verification"
    return 0
}

# Verify recent backups
log_message "Starting backup verification"
for backup_file in $(find "$BACKUP_DIR" -name "*.gz" -mtime -7); do
    verify_backup "$backup_file"
done
log_message "Backup verification completed"
```

## Backup Storage Strategies

### Local Storage Best Practices

```bash
# Create dedicated backup partition (recommended)
sudo mkdir -p /var/backups/bmlt
sudo chmod 700 /var/backups/bmlt

# Set up logrotate for backup logs
sudo nano /etc/logrotate.d/bmlt-backup
```

```
/var/log/bmlt-backup.log {
    weekly
    rotate 4
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
```

### Remote Backup Storage

#### Using rsync for Remote Backups

```bash
# Sync backups to remote server
rsync -avz --delete /var/backups/bmlt/ backup-server:/backups/bmlt-server/

# Automated remote backup script
sudo nano /usr/local/bin/sync-backups.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/bmlt"
REMOTE_SERVER="backup-server"
REMOTE_PATH="/backups/$(hostname)"

rsync -avz --delete "$BACKUP_DIR/" "$REMOTE_SERVER:$REMOTE_PATH/"
```

#### Using cloud storage (AWS S3 example)

```bash
# Install AWS CLI
sudo apt install awscli -y

# Configure AWS credentials
aws configure

# Sync to S3
aws s3 sync /var/backups/bmlt/ s3://your-backup-bucket/bmlt-backups/
```

## Recovery Testing

### Regular Recovery Drills

Create a test environment for recovery validation:

```bash
# Create test database
sudo mysql -e "CREATE DATABASE bmlt_test;"

# Restore backup to test database
zcat /var/backups/bmlt/bmlt-backup-latest.gz | sudo mysql bmlt_test

# Verify data integrity
sudo mysql bmlt_test -e "SELECT COUNT(*) FROM bmlt_comdef_meetings;"

# Cleanup test database
sudo mysql -e "DROP DATABASE bmlt_test;"
```

## Troubleshooting Backup Issues

### Common Backup Problems

**Insufficient disk space:**
```bash
# Check available space
df -h /var/backups

# Clean old backups
find /var/backups/bmlt -name "*.gz" -mtime +30 -delete
```

**MySQL access denied:**
```bash
# Check MySQL credentials
mysql -u root -p -e "SELECT 1;"

# Grant backup permissions
sudo mysql -e "GRANT SELECT, LOCK TABLES, SHOW VIEW ON *.* TO 'backup'@'localhost';"
```

**Corrupted backups:**
```bash
# Test backup integrity
gzip -t backup-file.gz

# Verify MySQL dump
zcat backup-file.gz | mysql --execute="SET SQL_MODE=''; SOURCE /dev/stdin;" information_schema
```

## Best Practices

### Backup Strategy Recommendations

1. **3-2-1 Rule**: 3 copies of data, 2 different media types, 1 offsite
2. **Regular testing**: Test backup restoration monthly
3. **Automated verification**: Verify backup integrity automatically
4. **Retention policy**: Keep daily backups for 30 days, weekly for 3 months
5. **Documentation**: Document restoration procedures
6. **Security**: Encrypt sensitive backups
7. **Monitoring**: Alert on backup failures

### Security Considerations

```bash
# Secure backup files
sudo chmod 600 /var/backups/bmlt/*.gz
sudo chown root:root /var/backups/bmlt/*.gz

# Encrypt sensitive backups
gpg --symmetric --cipher-algo AES256 backup-file.gz
```

:::warning Critical Reminder
Backups are only useful if they can be restored successfully. Regular testing of your backup and restoration procedures is essential.
:::

:::tip Automation Recommendation
Set up automated backups with verification and monitoring. Manual backups are often forgotten or skipped during busy periods.
:::