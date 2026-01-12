# API Credentials Setup

This folder contains API credentials for CLI tools used across projects.

## ⚠️ SECURITY WARNING
These files contain sensitive API keys. This folder should ideally be:
- Added to `.gitignore` for public repos
- Only pushed to private repos

## Setup on a New Computer

### 1. Namecheap CLI
```bash
# Install the CLI
pip3 install namecheap-cli

# Add to PATH (add this to ~/.zshrc or ~/.bashrc)
export PATH="$PATH:$HOME/Library/Python/3.9/bin"

# Copy config file
mkdir -p ~/.namecheap
cp .credentials/namecheap-config.json ~/.namecheap/config.json
```

### 2. DigitalOcean CLI (doctl)
```bash
# Install on macOS
brew install doctl

# Authorize with token
doctl auth init
# Then paste the token from .credentials/digitalocean-token.txt
```

## Usage

### Namecheap
```bash
namecheap domains              # List all domains
namecheap records example.com  # View DNS records
namecheap add -d example.com -t A -H @ -v 1.2.3.4 -l 1800    # Add A record
namecheap update -d example.com -t A -H @ -v 1.2.3.4 -l 1800 # Update A record
namecheap delete -d example.com -t A -H @                     # Delete A record
```

### DigitalOcean
```bash
doctl compute droplet list     # List droplets
doctl compute domain list      # List domains
doctl compute domain records list example.com  # List DNS records
```

## Whitelisted IPs for Namecheap API
The Namecheap API requires your IP to be whitelisted. Current whitelisted IPs:
- 181.167.118.210 (Cursor CLI - added Jan 12, 2026)

To add a new IP:
1. Go to https://ap.www.namecheap.com/settings/tools/apiaccess
2. Click "Edit" next to Whitelisted IPs
3. Add your current IP (find it with `curl ifconfig.me`)

