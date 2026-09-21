#!/bin/sh
set -e

# Render injects $PORT (default 10000). Patch nginx config to listen on it.
if [ -n "$PORT" ] && [ "$PORT" != "10000" ]; then
    sed -i "s/listen 10000;/listen ${PORT};/" /etc/nginx/nginx.conf
fi

# Clear caches baked at build time (config cache would break if env changes)
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

# Run migrations (safe for single-instance deployments)
php artisan migrate --force || echo "Migration failed, continuing..."

# Cache for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf