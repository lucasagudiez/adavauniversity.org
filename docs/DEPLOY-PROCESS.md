# Deployment Process

## Overview

Adava University uses a **git worktree deploy process** similar to the movie-trailer-finder project, with automated testing and rollback capabilities.

## Server Configuration

### Nginx Configuration

**Location**: `/etc/nginx/sites-enabled/adavauniversity.org`

**Critical**: The `root` directive MUST point to the `public/` directory:

```nginx
root /home/lucas/www/adavauniversity.org/public;
```

### Why `public/`?

After the project reorganization:
- **`public/`**: Contains all files served to users (HTML, CSS, JS, images, fonts)
- **Root directory**: Contains development files (tests, scripts, docs, server code)

### Auto-Deploy Script

The server has an auto-deploy script at `/home/lucas/auto-deploy-adavauniversity.sh` that:

1. Monitors the `deploy` branch for changes
2. Runs tests before deploying
3. **Pulls latest code to `/home/lucas/www/adavauniversity.org`**
4. Reloads nginx to serve files from `public/` subdirectory
5. Automatically rolls back if tests fail

## Local Deploy Process

### Prerequisites

1. All changes committed to `main` branch
2. All tests passing locally

### Deploy Command

```bash
./deploy.sh
```

This script:

1. **Runs unit tests** (`npm run test`)
   - Static analysis (HTML structure, CSS, content)
   
2. **Runs UX tests** (`npm run test:ux`)
   - Browser automation tests
   
3. **Pushes to `main` branch**
   
4. **Updates `deploy` branch in worktree**
   - Located at `/Users/lucas/cursor projects/adavauniversity.org-deploy`
   
5. **Pushes to `deploy` branch**
   - Server auto-deploy script detects this and deploys

### Deploy Worktree

**Location**: `/Users/lucas/cursor projects/adavauniversity.org-deploy`

**Created with**:
```bash
cd "/Users/lucas/cursor projects/adavauniversity.org"
git worktree add -b deploy "/Users/lucas/cursor projects/adavauniversity.org-deploy" deploy
```

**Purpose**: Allows deploying to `deploy` branch without switching branches in main workspace.

## Server-Side Deploy

### Auto-Deploy Location

**Script**: `/home/lucas/auto-deploy-adavauniversity.sh`

**Log**: `/home/lucas/deploy-logs/adavauniversity/`

### What Happens on Deploy

1. **Git pull** latest `deploy` branch to `/home/lucas/www/adavauniversity.org`
2. **Run tests** using Node.js 16 (via NVM)
3. **If tests pass**: Nginx serves files from `public/` directory
4. **If tests fail**: Rollback to previous commit

### Server Directory Structure

```
/home/lucas/www/adavauniversity.org/
├── public/              ← NGINX SERVES FROM HERE
│   ├── index.html
│   ├── styles.css
│   ├── js/
│   ├── images/
│   └── ...
├── server/              ← Node.js backend
│   ├── app.js
│   └── package.json
├── tests/
├── scripts/
└── docs/
```

## Common Issues & Fixes

### Issue: 403 Forbidden

**Cause**: Nginx `root` directive not pointing to `public/` directory

**Fix**:
```bash
# On server
sudo nano /etc/nginx/sites-enabled/adavauniversity.org

# Change:
root /home/lucas/www/adavauniversity.org;

# To:
root /home/lucas/www/adavauniversity.org/public;

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### Issue: Old files still showing after deploy

**Cause**: Browser cache

**Fix**:
```bash
# Force refresh in browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)

# Or clear cache in nginx config (already configured):
location / {
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate";
}
```

### Issue: Deploy worktree doesn't exist

**Cause**: Worktree was deleted or never created

**Fix**:
```bash
cd "/Users/lucas/cursor projects/adavauniversity.org"
git worktree add -b deploy "/Users/lucas/cursor projects/adavauniversity.org-deploy" deploy
```

### Issue: Deploy fails with Node.js version error

**Cause**: Server running old Node.js version

**Fix**: Auto-deploy script now uses Node 16 via NVM. If issues persist:
```bash
# On server
ssh adavauniversity.org
source ~/.nvm/nvm.sh
nvm use 16
node --version  # Should show v16.x.x
```

## File Structure Changes (Jan 2026)

### Before Reorganization

```
adavauniversity.org/
├── index.html           ← Served directly
├── styles.css           ← Served directly
├── js/                  ← Served directly
└── ...
```

**Nginx pointed to**: `/home/lucas/www/adavauniversity.org`

### After Reorganization (Current)

```
adavauniversity.org/
├── public/              ← ALL SERVED FILES HERE
│   ├── index.html
│   ├── styles.css
│   ├── js/
│   └── ...
├── server/              ← Backend (not served by nginx directly)
├── tests/               ← Not served
├── scripts/             ← Not served (blocked by nginx)
└── docs/                ← Not served (blocked by nginx)
```

**Nginx points to**: `/home/lucas/www/adavauniversity.org/public`

### Security Benefits

Nginx config blocks access to development files:

```nginx
# Block hidden files/directories
location ~ /\. {
    deny all;
    return 404;
}

# Block scripts and docs directories
location /scripts/ {
    deny all;
    return 404;
}

location /docs/ {
    deny all;
    return 404;
}
```

Even if someone tries to access `/scripts/` or `/docs/`, nginx returns 404.

## Comparison with Movie Project

### Similarities

Both projects use:
- Git worktree for deploy branch
- Automated tests before deploy
- Server-side auto-deploy script
- Rollback on test failure

### Differences

| Feature | Adava University | Movie Trailer |
|---------|------------------|---------------|
| **Directory structure** | `public/` for served files | All files in root |
| **Nginx root** | `/path/to/project/public` | `/path/to/project` |
| **Backend** | Node.js Express (separate server) | Static files only |
| **Deploy script checks** | Unit + UX tests | Unit + UX + bug verification |

## Best Practices

### 1. Always Test Before Deploy

```bash
npm run test           # Unit tests
npm run test:ux:smoke  # Quick UX tests
npm run test:ux        # Full UX tests
```

### 2. Use Deploy Script

**Don't**:
```bash
git push origin deploy  # Manual push - no tests!
```

**Do**:
```bash
./deploy.sh             # Runs all tests first
```

### 3. Check Server Logs

```bash
# View auto-deploy logs
ssh adavauniversity.org
tail -f /home/lucas/deploy-logs/adavauniversity/latest.log
```

### 4. Verify Nginx Config After Changes

```bash
ssh adavauniversity.org
sudo nginx -t
sudo systemctl status nginx
```

## Rollback Procedure

### If Bad Deploy Detected

1. **Check server logs**:
   ```bash
   ssh adavauniversity.org
   tail -50 /home/lucas/deploy-logs/adavauniversity/latest.log
   ```

2. **Manual rollback** (if auto-rollback didn't work):
   ```bash
   cd /home/lucas/www/adavauniversity.org
   git reset --hard HEAD~1  # Go back one commit
   git push origin deploy --force
   ```

3. **Verify site is working**:
   ```bash
   curl -I https://adavauniversity.org/
   ```

### If Nginx Config Broken

1. **Restore previous config**:
   ```bash
   sudo cp /etc/nginx/sites-enabled/adavauniversity.org.bak /etc/nginx/sites-enabled/adavauniversity.org
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Monitoring

### Check Site Status

```bash
# Quick health check
curl -I https://adavauniversity.org/

# Should return:
# HTTP/1.1 200 OK
```

### Check Nginx Status

```bash
ssh adavauniversity.org
sudo systemctl status nginx
```

### Check Backend Status

```bash
ssh adavauniversity.org
systemctl --user status adava-form-backend
```

## URLs

- **Production**: https://adavauniversity.org/
- **API Endpoint**: https://adavauniversity.org/api/submit

## Related Documentation

- `README.md` - Project overview
- `docs/reports/DEPLOYMENT-FIX-REPORT.md` - Node.js upgrade documentation
- `.cursorrules` - Development guidelines
- `server/README.md` - Backend documentation
