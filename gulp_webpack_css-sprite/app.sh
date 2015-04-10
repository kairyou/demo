#!/bin/bash

action=$1
CWD="$(cd -P -- "$(dirname -- "$0")" && pwd -P)"
# echo $CWD '|' $PWD;

if [ "$(uname)" == 'Darwin' ]; then
    prefix="env PATH=$PATH";  
else
	prefix="sudo env PATH=$PATH" # run 'sudo' with current user's PATH, 防止root环境变量没有nodejs
fi

help () {
    echo "$0 {dev|test|prod|clean|watch|install}";exit;
}
# test/staging: build for staging;
# dev: run webpack-dev-server;
# prod: build for release to production;
# install: # install dependencies;

# echo "NODE_ENV=development gulp --cwd $CWD --gulpfil $CWD/gulpfile.js default"
if [[ $action = 'dev' ]]; then
	$prefix NODE_ENV=development gulp --cwd $CWD --gulpfil $CWD/gulpfile.js dev-server;
elif [[ $action = 'test' ]] || [[ $action = 'staging' ]]; then
	$prefix NODE_ENV=test gulp --cwd $CWD --gulpfil $CWD/gulpfile.js build-test;
elif [[ $action = 'prod' ]]; then # build pkg for release
	$prefix NODE_ENV=production gulp --cwd $CWD --gulpfil $CWD/gulpfile.js build-prod;
elif [[ $action = 'watch' ]]; then
	$prefix NODE_ENV=test gulp --cwd $CWD --gulpfil $CWD/gulpfile.js build-test-watch;
elif [[ $action = 'clean' ]]; then
	$prefix NODE_ENV=dev gulp --cwd $CWD --gulpfil $CWD/gulpfile.js clean;
elif [[ $action = 'install' ]]; then
	npm install; #style-loader css-loader url-loader autoprefixer-loader sass-loader extract-text-webpack-plugin html-webpack-plugin html-loader
elif [[ $action = 'install-g' ]]; then
	npm install -g webpack webpack-dev-server node-sass gulp gulp-util css-sprite merge-stream gulp-if del;
else
	help;
fi

