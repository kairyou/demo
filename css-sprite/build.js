
// css-sprite(nodejs)
// https://github.com/aslansky/css-sprite#usage-with-gulp
// 比Ruby的Compass Css Sprite性能好太多了~
var sprite = require('css-sprite');
sprite.create({
	src: ['./src/**/*.png'], //源目录
	// src: ['./src/header/*.png', './src/footer/*.png'],
	out: './dist/img', //生成的sprites目录
	name: 'icons', //生成的sprites文件名
	style: './dist/scss/_icons.scss', //生成的css路径
	cssPath: '../img/', //css里使用的图片路径(可以是URL地址)
	processor: 'scss', //生成的格式: css, less, sass, scss, stylus
	prefix: 'icon', //样式前辍
	margin: 0, //icon间隔
	retina: true, // 创建@2x的图片(源图就应该是2x的图), 并添加@media样式
}, function() {
	console.log('done');
});

// https://github.com/sass/node-sass
/*var fs = require('fs');
var sass = require('node-sass');
var result = sass.renderSync({
	includePaths: ['dist/'], // 可以@import用到的路径, ['lib/', 'mod/']
	file: './src/test.scss',
	// data: 'body{background:blue; a{color:black;}}', //指定scss代码(会忽略file:的设定)
	// outputStyle: 'compressed',
	// 开发环境(sourceMap):
	sourceMap: true,
	outFile: 'abc', // 注: 不是指生成的文件, 而是给sourceMappingURL用的 (设定sourceMapContents时也不能留空)
	sourceMapEmbed: true,
	sourceMapContents: true,
});
fs.writeFileSync('./src/test.css', result.css, 'utf-8');*/

/*
Glue(python)
https://github.com/jorgebastida/glue (gulp-sprite-glue)
glue ./src ./dist/glue-sprites --retina --png8 --scss --ratios=3,2,1.5,1 --project
*/

/*
对比css-sprite(0.9.8), Glue(0.11.0)
相同: retina支持(--retina), less/scss支持(--scss,-less), 可以自定义输出的模板; 给图片加(?hash)后缀(cachebuster); icon间距(margin); 补全URL路径(cssPath,--url=); watch文件变动;

不同:
css-sprite: retina ratios:1,2; 可选base64输出; 支持stylus;
生成的文件内容: 提供方法给外部调用; 子目录会合成一个文件(我已经提交了issues: https://github.com/aslansky/css-sprite/issues/60);
使用方式:
@import 'scss/_icons';
.icon-home {@include sprite($header-home);} // 调用@mixin sprite, 需要的地方加入样式

Glue: retina ratios: 全部(比如: --ratios=3,2,1.5,1); png优化(--png8支持); cocos2d支持; 切除icon外部的透明区块(--crop); padding支持(css里width/height会变大);
生成的文件内容: 纯css; 按子目录生成对应的独立文件(--project); 
使用方式:
@import 'glue-sprites/header'; //会把header.scss的所有样式加进来

*/