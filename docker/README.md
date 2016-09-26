#用Docker搭建开发环境

#### Why docker?
Homebrew vs Docker
- 系统升级: brew不能保证已安装的软件包无影响, 如php的扩展可能丢失或有问题..
- 开发环境版本升级: 如php从5.4升级到5.6, brew删除旧的, 删的不一定干净
- 统一环境: production & development; 多人统一开发环境
- 新装软件是否会影响已安装软件: 貌似有次brew安装软件导致openssl出了问题, 后面又去找解决方案..
- 有些软件包brew安装时, 会提示需要系统已安装xcode.
- [Google trends](https://www.google.com/trends/explore?q=homebrew,docker)


#### Why Docker for MAC?
Docker toolbox vs Docker for MAC
- 官网下载docker, 选mac后, 默认推荐已是Docker for MAC.
- Docker toolbox(vbox, docker-compose, docker-machine, Kitematic)
- Docker for MAC(docker-compose, docker-machine), 速度和稳定性都改善了
- VirtualBox速度慢, 如果没开机启动, 打开Kitematic需要等很久.
- 改DockerHub镜像: Docker for MAC可以直接修改配置, 而toolbox需要:  
  ```sh
  docker-machine ssh default
  # 编辑/var/lib/boot2docker/profile, 加--registry-mirror=xxx
  docker-machine restart default
  ```

  Ps: 推荐[hub-mirror.c.163.com](http://c.163.com/wiki/index.php?title=DockerHub镜像加速)

#### Docker for MAC使用
- [下载Docker for MAC](https://docs.docker.com/docker-for-mac/), 里面有安装步骤图解.  
- 已安装docker toolbox的, 安装中会询问是否复制以前安装的镜像和容器.  
  - 如不再须要Docker Toolbox, 可下载并执行[官方的卸载脚本](https://github.com/docker/toolbox/blob/master/osx/uninstall.sh).
  - virtualbox如不需要, 可直接卸载.
- Kitematic(可选安装), 可以通过GUI方式管理镜像和容器, Docker for MAC里有它的菜单.
- 启动后, 可以配置开机启动, 镜像, 代理 等.  
  Terminal可以直接使用: docker,docker-compose 命令了.

###### docker一些命令
- docker ps -a # 所有容器
- docker rm CONTAINER_ID # 删除容器
- docker images # 镜像 # docker rmi IMAGE_ID # 删除镜像
- docker run -it -d --name test redis # 用redis镜像创建1个名称为test容器, 并启动
- docker start|restart|stop|kill test # 启动名称为test的容器
- docker exec -it test sh # 进入test容器, 执行命令
- docker cp nginx:/testfile ~/testfile # 拷贝镜像里的文件
- Ps: 加参数 --dns 8.8.8.8 # 可以指定容器的dns;  
  -i -t 进行交互式操作; -d后台执行;

举例, 创建postgres容器, 并映射到本机的5432端口
```sh
docker run -it -p 5432:5432 -d -e ENCODING=UTF8 -e BACKUP_ENABLED=true --name postgres jamesbrink/postgresql
```

#### docker-compose
主要功能为管理多个容器. docker推崇的是单一容器只运行单一的服务, 减小耦合. 很适合管理一个项目的环境.
比如, 某个项目基于php开发, 依赖nginx+mysql+php+redis环境, 暂且叫`php-demo`:
```sh
mkdir php-demo;
cd php-demo;
# 创建 docker-compose.yml
```

<!--
docker-compose up -d; # 启动后, phpinfo页面会有个Warning, 提示设置date.timezone.
docker-compose exec php-fpm sh -c "echo 'date.timezone = Asia/Shanghai' >> /usr/local/etc/php/php.ini"
#docker-compose exec php-fpm sh -c "sed -i 's/date.timezone =.*/;date.timezone = Asia\/Shanghai/' /usr/local/etc/php/php.ini" //注释
#docker-compose exec php-fpm sh -c "sed -i 's/;date.timezone =.*/date.timezone = Asia\/Shanghai/' /usr/local/etc/php/php.ini" //取消注释
docker-compose restart php-fpm;
-->

###### docker-compose一些命令
```sh
docker-compose up -d; # 启动容器
docker-compose build; # build Dockerfile, 如果有
docker-compose stop; # 关闭容器
docker-compose exec nginx sh; # 进入容器
docker-compose up -d mysql # 单独启动一个容器
docker-compose rm php-fpm # 删除mysql容器
docker-compose kill # 强行终止容器
```
