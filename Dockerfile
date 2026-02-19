FROM php:8.3-apache

WORKDIR /var/www/html
COPY . /var/www/html

RUN a2enmod rewrite \
 && mkdir -p /var/www/html/logs \
 && chmod +x /var/www/html/scripts/run-background-worker.sh \
 && chown -R www-data:www-data /var/www/html/logs

EXPOSE 80

CMD ["/bin/bash", "-lc", "/var/www/html/scripts/run-background-worker.sh & exec apache2-foreground"]
