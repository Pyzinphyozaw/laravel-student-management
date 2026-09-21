# ---- Stage 1: install PHP dependencies ----
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader

# ---- Stage 2: runtime ----
FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
        bash \
        curl \
        nginx \
        supervisor \
        libpng-dev \
        libzip-dev \
        oniguruma-dev \
        icu-dev \
        mysql-client \
    && docker-php-ext-install \
        pdo_mysql \
        mbstring \
        zip \
        intl \
        opcache

RUN { \
    echo 'opcache.enable=1'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.memory_consumption=128'; \
    echo 'opcache.max_accelerated_files=10000'; \
    } > /usr/local/etc/php/conf.d/opcache.ini

WORKDIR /var/www/html

COPY --from=vendor /app/vendor ./vendor
COPY . .

ARG APP_NAME="Student Management"
ARG APP_ENV=production
ARG APP_DEBUG=false
ARG APP_KEY
ARG APP_URL
ARG LOG_CHANNEL=stderr
ARG LOG_LEVEL=warning
ARG DB_CONNECTION=mysql
ARG DB_HOST
ARG DB_PORT=3306
ARG DB_DATABASE
ARG DB_USERNAME
ARG DB_PASSWORD
ARG FRONTEND_URL

RUN printf '%s\n' \
    "APP_NAME=\"${APP_NAME}\"" \
    "APP_ENV=${APP_ENV}" \
    "APP_KEY=${APP_KEY}" \
    "APP_DEBUG=${APP_DEBUG}" \
    "APP_URL=${APP_URL}" \
    "LOG_CHANNEL=${LOG_CHANNEL}" \
    "LOG_LEVEL=${LOG_LEVEL}" \
    "DB_CONNECTION=${DB_CONNECTION}" \
    "DB_HOST=${DB_HOST}" \
    "DB_PORT=${DB_PORT}" \
    "DB_DATABASE=${DB_DATABASE}" \
    "DB_USERNAME=${DB_USERNAME}" \
    "DB_PASSWORD=${DB_PASSWORD}" \
    "FRONTEND_URL=${FRONTEND_URL}" \
    > /var/www/html/.env

RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache .env \
    && chmod -R 775 storage bootstrap/cache

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY --chmod=755 docker/entrypoint.sh /usr/local/bin/entrypoint.sh

EXPOSE 10000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]