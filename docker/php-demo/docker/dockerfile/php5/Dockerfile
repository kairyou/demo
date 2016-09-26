FROM php:5-fpm-alpine

Maintainer Leon.Xu ( http://github.com/kairyou/ )

# china mirrors (waiting for: mirrors.163.com)
ENV MIRROR_URL http://mirrors.aliyun.com/alpine/alpine/
# ENV MIRROR_URL https://mirror.tuna.tsinghua.edu.cn/alpine/
# ENV MIRROR_URL http://mirrors.ustc.edu.cn/alpine/
# ENV MIRROR_URL http://mirrors.cug.edu.cn/alpine/

ENV ALPINE_VERSION v3.4
RUN echo '' > /etc/apk/repositories; \
    echo "${MIRROR_URL}${ALPINE_VERSION}/main" >> /etc/apk/repositories; \
    echo "${MIRROR_URL}${ALPINE_VERSION}/community" >> /etc/apk/repositories;

ENV PHPREDIS_VERSION 2.2.8

# RUN rm -rf /usr/local/etc/php/conf.d/docker-php-ext-*.ini;

RUN apk update; \
  # mysql
    # support mysql_connect() for Discuz_X3.2
    docker-php-ext-install mysql; \
    docker-php-ext-install mysqli pdo pdo_mysql; \
  # postgresql
    apk add postgresql-dev; \
    docker-php-ext-install pgsql pdo pdo_pgsql; \
  # memcached
    apk add libmemcached-dev; \
    apk add gcc autoconf make libc-dev zlib-dev pkgconf; \
    apk add git && git clone https://github.com/php-memcached-dev/php-memcached.git && cd php-memcached; \
    # git checkout php7; \
    phpize && ./configure --disable-memcached-sasl && make && make install; \
    docker-php-ext-enable memcached; \
    cd .. && rm -rf php-memcached; apk del git; \
  # redis
    docker-php-source extract; \
    curl -L -o /tmp/redis.tar.gz https://github.com/phpredis/phpredis/archive/$PHPREDIS_VERSION.tar.gz; \
    tar xfz /tmp/redis.tar.gz && rm -r /tmp/redis.tar.gz && mv phpredis-$PHPREDIS_VERSION /usr/src/php/ext/redis; \
    docker-php-ext-install redis && docker-php-source delete; \
  # mongodb
    apk add openssl-dev; \
    pecl install mongodb && docker-php-ext-enable mongodb; \
  # imageMgick && gd && mcrypt (Already installed: iconv, mbstring)
    apk add freetype-dev libpng-dev libjpeg-turbo-dev autoconf gcc g++ imagemagick-dev libtool make; \
    pecl install -of imagick && docker-php-ext-enable imagick; \
    docker-php-ext-configure gd --with-freetype-dir=/usr/include/ --with-png-dir=/usr/include/ --with-jpeg-dir=/usr/include/; \
    docker-php-ext-install gd; \
    apk add libmcrypt-dev && docker-php-ext-install mcrypt; \
  # xdebug (Failed loading .../xdebug.so)
    pecl install -of xdebug && docker-php-ext-enable xdebug;

# RUN echo "date.timezone = Asia/Shanghai" >> /usr/local/etc/php/php.ini
  # sed -i "s/;date.timezone =.*/date.timezone = Asia\/Shanghai/" /etc/php5/fpm/php.ini

# RUN apk del autoconf g++ libtool make pkgconf && rm -rf /tmp/* /var/cache/apk/*;
