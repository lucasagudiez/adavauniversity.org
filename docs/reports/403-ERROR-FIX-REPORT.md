# 403 Error Fix Report - Jan 17, 2026

## Issue

**URL**: https://adavauniversity.org/  
**Error**: 403 Forbidden  
**Cause**: Nginx configuration pointing to wrong directory after project reorganization

## Root Cause

After the project reorganization (Jan 2026), all served files were moved to the `public/` subdirectory:

**Old structure**:
```
adavauniversity.org/
├── index.html           ← Served directly
├── styles.css
└── js/
```

**New structure**:
```
adavauniversity.org/
├── public/              ← ALL SERVED FILES HERE
│   ├── index.html
│   ├── styles.css
│   └── js/
├── server/              ← Backend
├── tests/               ← Not served
└── docs/                ← Not served
```

However, the nginx configuration was not updated to reflect this change, resulting in:
- Nginx looking for files in `/home/lucas/www/adavauniversity.org/`
- Files actually located in `/home/lucas/www/adavauniversity.org/public/`
- Result: 403 Forbidden error

## Fix Applied

### 1. Updated Nginx Configuration

**File**: `/etc/nginx/sites-enabled/adavauniversity.org`

**Changed**:
```nginx
root /home/lucas/www/adavauniversity.org;
```

**To**:
```nginx
root /home/lucas/www/adavauniversity.org/public;
```

**Commands executed**:
```bash
ssh adavauniversity.org
sudo sed -i 's|root /home/lucas/www/adavauniversity.org;|root /home/lucas/www/adavauniversity.org/public;|' /etc/nginx/sites-enabled/adavauniversity.org
sudo nginx -t
sudo systemctl reload nginx
```

### 2. Verified Fix

```bash
curl -sI https://adavauniversity.org/ | grep HTTP
# HTTP/1.1 200 OK
```

Website is now accessible and serving correctly.

## Prevention Measures

### 1. Documentation Created

**File**: `docs/DEPLOY-PROCESS.md`

This comprehensive document includes:
- Server configuration requirements
- Project structure explanation
- Troubleshooting for 403 errors
- Comparison with movie-trailer-finder project
- Rollback procedures

### 2. Updated `.cursorrules`

Added a critical section at the top:

```markdown
## 🚀 DEPLOYMENT - CRITICAL SERVER CONFIGURATION

**⚠️ AFTER PROJECT REORGANIZATION (Jan 2026), NGINX MUST SERVE FROM `public/` DIRECTORY**

### Server Configuration (NEVER CHANGE WITHOUT UPDATING NGINX)

```nginx
# /etc/nginx/sites-enabled/adavauniversity.org
root /home/lucas/www/adavauniversity.org/public;  # ← MUST BE public/
index index.html;
```

### If Site Shows 403 Forbidden

**Fix**:
```bash
ssh adavauniversity.org
sudo sed -i 's|root /home/lucas/www/adavauniversity.org;|root /home/lucas/www/adavauniversity.org/public;|' /etc/nginx/sites-enabled/adavauniversity.org
sudo nginx -t
sudo systemctl reload nginx
```
```

This ensures future agents will:
1. Immediately understand the nginx configuration requirement
2. Know how to fix 403 errors quickly
3. Not accidentally break the server configuration

### 3. Comparison with Movie Project

Analyzed how the movie-trailer-finder project handles deployment:

**Key Differences**:
- **Movie project**: All files in root, nginx points to root
- **Adava project**: Served files in `public/`, nginx points to `public/`

**Similarities**:
- Both use git worktree deploy process
- Both have automated tests before deploy
- Both have server-side auto-deploy scripts

**Lesson Learned**: When reorganizing project structure, ALWAYS check and update nginx configuration.

## Timeline

| Time | Action | Result |
|------|--------|--------|
| ~Jan 16 | Project reorganization completed | Files moved to `public/` |
| Jan 17 05:12 | Deploy pushed | Server pulled latest code |
| Jan 17 (unknown) | First 403 error reported | Nginx couldn't find files |
| Jan 17 22:40 | Issue diagnosed | Nginx pointing to wrong directory |
| Jan 17 22:41 | Nginx config updated | `root` changed to point to `public/` |
| Jan 17 22:41 | Nginx reloaded | Site returned HTTP 200 OK |
| Jan 17 22:47 | Verified in browser | Website fully operational |

## Testing

### Before Fix
```bash
curl -I https://adavauniversity.org/
# HTTP/1.1 403 Forbidden
```

### After Fix
```bash
curl -I https://adavauniversity.org/
# HTTP/1.1 200 OK

# Browser verification
# ✅ Hero section loads
# ✅ Styles applied correctly
# ✅ Particle animation working
# ✅ All assets loading
# ✅ Forms functional
```

## Files Changed

1. **Server Configuration** (manual fix via SSH):
   - `/etc/nginx/sites-enabled/adavauniversity.org` - Updated `root` directive

2. **Documentation** (committed to git):
   - `docs/DEPLOY-PROCESS.md` - New comprehensive deployment guide
   - `.cursorrules` - Added critical deployment section
   - `docs/reports/403-ERROR-FIX-REPORT.md` - This report

## Verification Checklist

- [x] Nginx config updated to point to `public/`
- [x] Nginx configuration tested (`sudo nginx -t`)
- [x] Nginx reloaded successfully
- [x] Site returns HTTP 200 OK
- [x] Site loads correctly in browser
- [x] All assets loading (CSS, JS, images)
- [x] Particle animation working
- [x] Forms functional
- [x] Documentation created to prevent recurrence
- [x] `.cursorrules` updated with critical warning
- [x] Changes committed to git

## Related Issues

This fix relates to the project reorganization completed on Jan 16-17, 2026:
- `README.md` was updated to document new structure
- `playwright.config.js` was updated to serve from `public/`
- `scripts/test-runner.js` was updated to find files in `public/`
- `package.json` scripts were updated

However, the nginx server configuration was not updated at that time, leading to this 403 error.

## Recommendations

### For Future Agent Tasks

1. **Always check server configuration** when reorganizing project structure
2. **Test in production** immediately after major structural changes
3. **Document server requirements** in `.cursorrules` for visibility
4. **Create comprehensive deployment docs** to prevent similar issues

### For Similar Projects

When reorganizing a project with a `public/` directory:

1. Update nginx config FIRST (before pushing changes)
2. Or push changes and immediately update nginx config
3. Verify site is accessible before considering task complete
4. Document the change prominently in `.cursorrules`

## Lessons Learned

1. **Project structure changes require server config changes**: Moving files to `public/` required updating nginx `root` directive

2. **Documentation is critical**: Without clear documentation, future agents might not know about this requirement

3. **The movie project's simpler structure avoids this issue**: By keeping all files in the root, there's no nginx configuration mismatch

4. **Test in production immediately**: The reorganization was completed days ago, but the production issue wasn't caught until now

5. **`.cursorrules` is the right place for critical info**: Putting the nginx requirement at the top of `.cursorrules` ensures it's seen first

## Status

✅ **FIXED**

- Site is now fully operational
- Documentation created to prevent recurrence
- Agent guidelines updated in `.cursorrules`

## Verification URL

https://adavauniversity.org/

Expected: HTTP 200 OK, full website functionality
