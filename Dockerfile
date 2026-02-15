FROM php:8.3-apache

WORKDIR /var/www/html
COPY . /var/www/html

RUN a2enmod rewrite \
 && mkdir -p /var/www/html/logs \
 && chown -R www-data:www-data /var/www/html/logs

EXPOSE 80

