#!/bin/bash

# <!-- x=-1500 y=0 scale=0.5 --> 左移+缩放; <!-- x=1500 y=1000 rotate=90 --> 旋转

path=`dirname $(npm bin -g)`/lib/node_modules/markdown-impress/res
# echo custom html: vim $path/impress.tpl;

file=$1
filename=${file%.*}
CWD="$(cd -P -- "$(dirname -- "$0")" && pwd -P)"
# echo $CWD '|' $PWD;

if [ "$(uname)" == 'Darwin' ]; then
    prefix="env PATH=$PATH";  
else
	prefix="sudo env PATH=$PATH" # run 'sudo' with current user's PATH
fi

help () {
    echo "$0 {file.md}";exit;
}
# npm install -g markdown-impress
if [[ $file && -f "$file" ]]; then
	$prefix mtoi -i $filename.md -o ../kairyou.github.io/$filename.html
else
	help;
fi
