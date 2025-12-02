# Deployment Configuration Guide

## Problem
When accessing `https://www.crmwale.com/login`, you get a 404 error because Apache/Nginx is trying to serve the route as a file instead of proxying to your Node.js backend.

## Solution
Configure your web server (Apache or Nginx) to proxy all requests to your Node.js backend.

---

## For Apache Users

### Step 1: Enable Required Modules
```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### Step 2: Configure Apache

**Option A: Using .htaccess (Easier)**
1. Copy the `.htaccess` file to your web root directory (usually `/var/www/html/` or your domain's document root)
2. Make sure Apache allows `.htaccess` overrides:
   ```apache
   <Directory /var/www/html>
       AllowOverride All
   </Directory>
   ```
3. Restart Apache: `sudo systemctl restart apache2`

**Option B: Using Virtual Host (Recommended for Production)**
1. Edit your Apache virtual host file (usually in `/etc/apache2/sites-available/000-default.conf` or `/etc/apache2/sites-available/crmwale.com.conf`)
2. Add this configuration:
   ```apache
   <VirtualHost *:80>
       ServerName www.crmwale.com
       ServerAlias crmwale.com
       
       ProxyPreserveHost On
       ProxyPass /api/ http://localhost:4000/api/
       ProxyPassReverse /api/ http://localhost:4000/api/
       ProxyPass / http://localhost:4000/
       ProxyPassReverse / http://localhost:4000/
   </VirtualHost>
   ```
3. Enable the site and restart:
   ```bash
   sudo a2ensite your-site-name
   sudo systemctl restart apache2
   ```

### Step 3: Verify
- Visit `https://www.crmwale.com/login` - it should now work!
- Check Apache error logs: `sudo tail -f /var/log/apache2/error.log`

---

## For Nginx Users

### Step 1: Create Configuration File
1. Create/edit your site configuration:
   ```bash
   sudo nano /etc/nginx/sites-available/crmwale.com
   ```
2. Copy the contents from `nginx.conf` file
3. Update the paths and server name as needed

### Step 2: Enable the Site
```bash
sudo ln -s /etc/nginx/sites-available/crmwale.com /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

### Step 3: Verify
- Visit `https://www.crmwale.com/login` - it should now work!
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

---

## Important Notes

1. **Node.js Port**: Make sure your Node.js server is running on port 4000 (or update the proxy configuration to match your port)

2. **Firewall**: Ensure port 4000 is accessible locally (it doesn't need to be public, just accessible from Apache/Nginx)

3. **SSL/HTTPS**: If you're using HTTPS, you'll need to configure SSL certificates. The Nginx config includes an example HTTPS block.

4. **Testing**: After configuration, test with:
   ```bash
   curl http://localhost:4000/login  # Should return HTML
   curl http://localhost:4000/api/v1/auth/login  # Should return JSON
   ```

5. **Restart Services**: After making changes, always restart your web server:
   - Apache: `sudo systemctl restart apache2`
   - Nginx: `sudo systemctl restart nginx`

---

## Troubleshooting

### Issue: Still getting 404 errors
- Check if Node.js is running: `ps aux | grep node`
- Check if Node.js is listening on the correct port: `netstat -tulpn | grep 4000`
- Check web server error logs for proxy errors

### Issue: "Proxy Error" or "502 Bad Gateway"
- Node.js might not be running
- Port 4000 might be blocked
- Check Node.js logs for errors

### Issue: Static files not loading
- Make sure `frontend/build` directory exists and is deployed
- Check file permissions: `chmod -R 755 frontend/build`

---

## Quick Test Commands

```bash
# Test if Node.js is responding
curl http://localhost:4000/

# Test if proxy is working
curl http://localhost/login

# Check Apache/Nginx status
sudo systemctl status apache2  # or nginx

# View recent errors
sudo tail -f /var/log/apache2/error.log  # or /var/log/nginx/error.log
```

