---
sidebar_position: 1
slug: /
---

# BMLT Cloud VM Guide

Welcome to the comprehensive guide for managing BMLT (Basic Meeting List Toolbox) and YAP (Yet Another Phonebot) installations on Ubuntu cloud servers.

## What is BMLT?

The **Basic Meeting List Toolbox (BMLT)** is a powerful web application designed to help 12-step recovery fellowships manage and display their meeting information. It provides a centralized database for meeting data that can be displayed on websites, mobile apps, and used by phone systems.

## What is YAP?

**YAP (Yet Another Phonebot)** is a telephone helpline system that integrates with BMLT to provide meeting information and helpline services over the phone using Twilio.

## Who This Guide Is For

This guide is designed for:
- **System administrators** managing BMLT servers
- **Service body tech coordinators** responsible for meeting data systems
- **Volunteers** with basic Linux knowledge who need to maintain BMLT installations
- **Cloud server users** running BMLT on Digital Ocean, AWS, or other cloud providers

## What You'll Learn

This comprehensive guide covers:

### 🚀 Initial Setup
- Server preparation and LAMP stack installation
- BMLT and YAP application deployment
- SSL certificate configuration
- Security hardening

### 🛠️ Daily Management
- System monitoring and health checks
- Apache web server management
- MySQL database administration
- Log monitoring and analysis

### 🔄 Updates & Maintenance
- System package updates
- BMLT application updates
- YAP application updates
- PHP version upgrades

### 💾 Backup & Recovery
- Database backup strategies
- File system backups
- Automated backup scripts
- Disaster recovery procedures

### 🔒 Security
- Firewall configuration
- SSL certificate management
- MySQL security hardening
- System monitoring

### 🔧 Troubleshooting
- Common issues and solutions
- Performance optimization
- Database troubleshooting
- SSL certificate problems

## Prerequisites

Before starting, you should have:
- A cloud Ubuntu server (24.04 LTS recommended)
- SSH access to your server
- Basic familiarity with command line operations
- A domain name (recommended for SSL)

## Support Resources

- **BMLT Project**: [bmlt.app](https://bmlt.app/)
- **YAP Repository**: [github.com/bmlt-enabled/yap](https://github.com/bmlt-enabled/yap)
- **BMLT Server**: [github.com/bmlt-enabled/bmlt-server](https://github.com/bmlt-enabled/bmlt-server)

## Getting Started

Ready to begin? Start with the [Initial Setup Prerequisites](initial-setup/prerequisites) to prepare your environment.

:::info
This guide focuses on Ubuntu-based cloud servers. While the concepts apply to other Linux distributions, commands may vary.
:::

:::tip
Always backup your data before making significant changes to your server configuration.
:::
