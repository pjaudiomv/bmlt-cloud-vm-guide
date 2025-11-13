# Configuration Templates

Ready-to-use configuration templates for BMLT server management.

## Database Backup Script

### Simple Local Backup Script

Basic database backup script for local storage:

```bash title="/usr/local/bin/backup-bmlt.sh"
#!/bin/bash
# BMLT Database Backup Script

# Configuration
BACKUP_DIR="/var/backups/bmlt"
DATE=$(date +'%Y-%m-%d')
RETENTION_DAYS=30

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Create backups
mysqldump bmlt | gzip > ${BACKUP_DIR}/bmlt-${DATE}.sql.gz
mysqldump yap | gzip > ${BACKUP_DIR}/yap-${DATE}.sql.gz

# Set secure permissions
chmod 600 ${BACKUP_DIR}/*.gz
chown root:root ${BACKUP_DIR}/*.gz

# Remove old backups
find ${BACKUP_DIR} -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "Backup completed: bmlt-${DATE}.sql.gz, yap-${DATE}.sql.gz"
```

Make it executable and schedule:
```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-bmlt.sh

# Add to crontab for daily backup at 2 AM
sudo crontab -e
# Add line: 0 2 * * * /usr/local/bin/backup-bmlt.sh
```

## Usage Examples

### Test the backup script:
```bash
sudo /usr/local/bin/backup-bmlt.sh
ls -la /var/backups/bmlt/
```

:::warning
These templates are based on actual infrastructure deployments. Customize the paths and settings for your specific environment.
:::
