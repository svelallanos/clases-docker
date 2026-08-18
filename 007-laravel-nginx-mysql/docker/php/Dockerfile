FROM php:8.5-fpm

RUN apt-get update && apt-get install -y \
  git \
  curl \
  unzip \
  libonig-dev \
  libxml2-dev \
  && docker-php-ext-install \
  pdo_mysql \
  mbstring \
  xml \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html
