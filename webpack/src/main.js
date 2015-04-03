// webpack.config.js, externals里定义了, 所以jquery不会被编译到js里面
// var $ = require('jquery'); 

// webpack.config.js, 定义了__DEBUG__, 开发环境才会执行, production会自动移除
// __DEBUG__ && console.log($);

// 模块化使用:
/*即使没用过 RequireJS, Node.js也很容易理解
不再需要RequireJS或我们的Hub等等来组织模块(也降低了学习成本), 也不再需要去写define(...)之类的把模块包起来,
var fn, function fn(){}随便用, 不必担心和其他模块冲突, 因为webpack会用代码把模块包起来;*/

// sync加载2种方式
/*var a = require('./a.js'); // CommonJs (推荐)
define(['./b.js', './c.js'], function(dep1, dep2) { // AMD
	dep2.show();
});*/



// async按需加载2种方式
/*require(['./a.js'], function(module){ // AMD (推荐)
	module.show();
	var c = require('./c.js').show(); //c.js会和a.js打包到一起
});
require.ensure([], function(require) { // CommonJs
	require('./b.js').show(); // c.js会和b.js打包到一起
	var c = require('./c.js').show(); // 前面已经执行过, 这里的c不会再执行(c的接口可正常使用)
});*/
// 那么问题来了, 代码重复: a,b都含有c的代码(webpack -p模式也一样);
// 已经被同步require过时, 重复的代码才可以自动优化掉

// 异步方式可用include优化
// require.include('./c'); // 只加载不执行(a被打包到当前js里, 但不会被执行), 和 require('./c') 的区别就是是否执行c
// 这样后续的异步依赖c时, 打包时就不会包含c了. 比如下面:
	// require.ensure(['./c'], function (require) {
	// 	var b = require('./b'); // 打包b时就不会再包含c了.
	// 	require('./c').show();
	// });
// 当模块被多次异步依赖时, 优化的效果就明显了(没有include('./a'): a会打一个包, a,b会打一个包; 使用后: 只有一个包b.js):
	// require(['./a.js'], function(a){});
	// require(['./a.js', './b.js'], function(a, b) {});
// 题外话: require.ensure(['./c'], ...) 也是只加载不执行(功能不同于include, 而且是异步方式);


// css怎么用:
/*
// 方式1: 直接js内require:
require('./a.scss'); // 推荐, 模块依赖清晰
// 方式2: webpack.config.js的entry里添加, 比如: 
	//entry: {index: ['./index.js', './index.scss']}
// Ps: 默认会把css/js打包到一起, 再通过js添加style到页面; 配合extract-text-webpack-plugin, 可以把css独立打包(和js一样也会自动合并多个);
*/

// 样式优化
/*还记得大明湖畔的@mixin? 比如方法border-radius:
@mixin border-radius($radius: 5px) {
    -webkit-border-radius: $radius;-moz-border-radius: $radius;-khtml-border-radius: $radius;border-radius: $radius;
}
.test{@include border-radius(3px);} // 使用@include 简化开发
// 除去优点, 那么问题来了: 
1. 不太熟悉的人怎么用? 可能要再翻看下API(可能有N个@mixin方法, 更悲剧的可能有: borderRadius/border_radius...)
2. border-radius已经支持的很好, 不再需要写-webkit-border-radius/-moz-border-radius了

使用autoprefixer可大量减少mixin的使用, webpack.config.js的loaders内设定: 
	css: css-loader!autoprefixer-loader,  scss: css-loader!autoprefixer-loader!sass-loader
	这样code只需要写: border-radius: 3px; // 只需要写标准的就好
	注意事项: https://www.npmjs.com/package/autoprefixer#faq
	 https://github.com/postcss/autoprefixer/wiki/support-list

css 里用 @import url('./ui.css'), 会把ui.css内容加到当前文件的最上面 (优化掉@import);
 compass性能真的太慢了. 一个文件编译有时感觉 有时要等5s以上..
*/

// 打包组件
// 比如一个组件: lightbox, 文件: l.js, l.css, l.png
	// 以前怎么做? 传统:css和js分别加到页面, 即使用requirejs等按需加载, 在维护和移植性上也不够好(比如: 路径变动/增加或减少文件).
// 1. 可以单独写一个webpack.lightbox.js 来打包
// 2. 直接传参数给webpack(执行命令的目录不能有webpack.config.js):
// webpack ./l.js ./lightbox.js --module-bind 'css=style!css' --module-bind 'png=url-loader?limit=8192' --output-library-target 'umd'
// 如果不考虑base64, 可以直接用file-lorder代替url-loader(图片独立)
// webpack ./l.js ./dist/lightbox.js --module-bind 'css=style!css' --module-bind 'png=file?name=img/[hash].[ext]' --output-library-target 'umd'

// 这样, 页面使用的时候就只需要引入:lightbox.js就可以了.
/*require(['./dist/lightbox.js'], function(module){function(module){
	var lightbox = module.creat();
	lightbox.show();
	setTimeout(function() {lightbox.hide();}, 5000);
});*/
//注:
	// http://webpack.github.io/docs/configuration.html
	// 打包组件, libraryTarget是必须的. 否则被包起来后, 组件的方法不能被调用, 除非写成: window.xxx(不优雅了);
		// 设定成umd(支持以amd/commonjs2方式引用) --output-library 'xxxx' 组件名称可以忽略;
 	// --output-public-path './dist/' // publicPath 也要设定(否则被require时, 图片路径可能不对);
 	// 稍有不便: 
		// 打包好的组件(有独立的图片的情况), 被require后, 再打包时, 不会把相关的图片转移(没有被当做模块)
		// 解决: 1. 打包的时强制用base64; 2. 打包设定成css文件独立; 3. 直接require源码(用到的时候才自动打包)
	// 具体要看使用场景, 组件单独打包, 更适合给其他的项目使用. 同一项目, 基本不需要这么做.


// 缓存优化，文件名带hash, 支持多版本并存. 每个版本的文件名json储存, 不需要上个版本的, 可以根据map直接删除掉.
	// filename: '[name].[chunkhash].js',
	// this.plugin('done', function(stats) {


// http://webpack.github.io/docs/shimming-modules.html
// require(['imports?$$=jquery!./jquery.dialog.js']); // imports: 让dialog.js里的$$可用 (依赖模块jquery)
/*require(['exports?t!./jquery.dialog.js'], function(module){ // exports: 导出dialog.js的变量(代码后面加上了: module.exports = t)
	console.log(module, window.t);
});*/
/*require(['expose?t!./jquery.dialog.js'], function(module){ // expose: 导出dialog.js的变量为全局变量
	console.log(module, window.t);
});*/

require(['./jquery.dialog.js'], function(module){
	console.log(module);
	console.log($.dialog);
	$.dialog({msg: 'required jquery.dialog'});
});

/*

var src = require('url!./image.jpg'); // 直接引入base64

webpack-dev-server
cnpm install -g webpack-dev-server
http://webpack.github.io/docs/webpack-dev-server.html
本地创建 localhost:8080/ 调试代码, 代码变动会自动reload.

默认会读当前目录的 webpack.config.js
webpack-dev-server --config webpack.cfg.js --hot --content-base dist/
文件在内存中(并没有在dist目录生成)
前提: entry.xxx 里面要加上'webpack/hot/dev-server', 比如: index: ['webpack/hot/dev-server', './index.js']
http://localhost:8080/webpack-dev-server/ 自动reload
http://localhost:8080/ 如果HTML加上<script src="http://localhost:8080/webpack-dev-server.js"></script> 也可以自动reload

带[hash]文件名的资源测试环境怎么引用: http://stackoverflow.com/questions/24563319 html-webpack-plugin
可以根据模板生成HTML:
{%=o.htmlWebpackPlugin.assets.XXX%} - XXX指生成的文件(stats的assetsByChunkName)
html就可以直接引用带hash的文件了.

*/

