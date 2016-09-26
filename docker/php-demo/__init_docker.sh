#!/bin/bash

docker-compose build #--no-cache

# PHP
docker pull composer/composer
mkdir -p ~/.composer
# setting up aliases
echo 'alias composer="docker run -ti --rm -v `pwd`:/app -v ~/.composer:/composer composer/composer"' | tee -a ~/.zshrc ~/.bash_profile;
echo 'alias php="docker run -ti --rm -v `pwd`:/var/www/html php:5-fpm-alpine php"' | tee -a ~/.zshrc ~/.bash_profile;
echo 'export PATH="$HOME/.composer/vendor/bin:$PATH"' | tee -a ~/.zshrc ~/.bash_profile; # composer global require xx


# NGINX  # copy default nginx config files
docker run -it -d --name __nginx nginx:alpine;
mkdir -p ./docker/nginx;
docker cp nginx:/etc/nginx/conf.d ./docker/nginx;
docker rm -f __nginx;

# 启动后, phpinfo页面会有个Warning, 提示设置date.timezone.
# docker-compose exec php-fpm sh -c "echo 'date.timezone = Asia/Shanghai' >> /usr/local/etc/php/php.ini"
# docker-compose restart php-fpm;

# MYSQL (Development: Allow root access without password)
docker-compose exec mysql bash -c "mysql --user=root mysql << EOF
DELETE FROM user WHERE User='root' and Host='%';FLUSH PRIVILEGES;
CREATE USER 'root'@'%' IDENTIFIED BY '';GRANT ALL PRIVILEGES ON * . * TO 'root'@'%';FLUSH PRIVILEGES;
quit
EOF"

if [ -n "$ZSH_VERSION" ]; then
   . ~/.zshrc
else # -n "$BASH_VERSION"
   . ~/.bash_profile
fi

# FAQs:

# - Error: docker No such image: sha256: xxx (docker-compose up)
  # docker ps -a; docker rm CONTAINER_ID
