FROM php:8.5-fpm

RUN apt-get update && apt-get install -y \
  git \
  curl \
  unzip \
  && docker-php-ext-install \
  pdo_mysql \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html
