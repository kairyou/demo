// NODE_ENV=test webpack --config webpack.cfg.js
// NODE_ENV=development webpack-dev-server --config webpack.cfg.js --hot --quiet --content-base dist/
// NODE_ENV=production webpack --config webpack.cfg.js -p

var path = require('path');
var del = require('del');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var env = process.env.NODE_ENV;
var args = process.argv,
	// isProduction = args.indexOf('-p') > -1, // 命令行: webpack -p
	isProduction = 'production' == env,
	isDev = 'development' == env,
	isTest = 'test' == env || 'staging' == env;
// console.log(env, args);
var buildType = -1 !== args[1].indexOf('gulp') ? 'gulp' : 'webpack';
console.log('dev:', isDev, 'test:', isTest, 'prod:', isProduction, 'buildType:', buildType);

del.sync(['dist/*']);

// page list
var entry = {
	index: ['./mod/main', './mod/sub'], // mod/xxx/index.js
	// 404: ['./mod/404'],
};
Object.keys(entry).forEach(function(key) { // 每个page都加上, 生成公共的: commons.js,commons.css
	var val = entry[key];
	val.push('./js/base.js', './css/base.css');
});
if ('webpack' == buildType) { // webpack-dev-server 方式自动添加dev-server
	Object.keys(entry).forEach(function(key) {
		var val = entry[key];
		val.unshift('webpack/hot/dev-server');
	});
	// console.log(entry);
}

module.exports = {
	// cache: false,
	// debug: true,
	context: path.join(__dirname, 'src'),
	resolve: {
		alias: {
			'editor': './editor.js',
			// 'lightbox': '../dist/lightbox.js',
		},
		modulesDirectories: ['web_modules', 'node_modules'], // require('xx')时, 会去这些目录找(相对context)
	},
	entry: entry, //path.resolve(__dirname, './entry.js'), // 可以在gulp里创建个task来生成
	output: {
		path: path.join(__dirname, 'dist'), // 编译后文件存放的路径(可用[hash])
		publicPath: '', // 生成文件内用到的URL路径, 比如背景图等(可以设成http的地址)
		filename: '[name].[chunkhash].js', // 文件名规则 for entry
		chunkFilename: '[id].[chunkhash].js', //[id].bundle.js, 文件名规则 for 块文件(比如异步加载的文件)
		// library: 'xxx', libraryTarget: 'umd', // 需要打包成一个组件给其他地方引用的情况(library:组件名称可忽略), webpack.github.io/docs/configuration.html#output-library
	},
	externals: { // require这些不需要再编译(作为全局变量使用)
		jquery: 'jQuery', // shim(让非AMD或CJS的API可被使用): github.com/webpack/docs/wiki/shimming-modules
	},
	plugins: [ // webpack.github.io/docs/list-of-plugins.html
		function() { // 文件名带[hash]的时候, 必须依赖stats. webpack.github.io/docs/long-term-caching.html
			this.plugin('done', function(stats) { // stats.json的assetsByChunkName, 包含了build后的文件列表
				var datas = stats.toJson(), stats;
				stats = './stats.json'; // path.join(__dirname, '..', 'stats.json'),
				require('fs').writeFileSync(stats, JSON.stringify(datas.assetsByChunkName));
			});
		},
		new webpack.DefinePlugin({ // 可以定义一些公共变量在代码里使用
			__DEBUG__: isProduction ? false : true, //.js: __DEBUG__ && console.log($);
			__DEV__: isDev, //for webpack-dev-server 添加html模板到页面
		}),
		// 把css独立, 但对于异步加载的js里的css不会独立(因为这样的基本都是组件, 不需要独立), webpack.github.io/docs/stylesheets.html
		new ExtractTextPlugin('[name].[contenthash:20].css'), // 文件名规则 for css, 限定hash长度20
		new webpack.optimize.CommonsChunkPlugin('common', 'common.[chunkhash].js'), // 生成公共文件(每个entry都用到的, 参数1是公共chunk name(css用), 参数2是filename给js用)
		// ExtractTextPlugin('[name].[chunkhash].css'): 共用的js或css变: common js和css都会变; 模块内的js或css变, entry的js和css都会变
		// ExtractTextPlugin('[name].[contenthash].css'): 公共或entry的js变: js变, css不变; css变, js/css都变
		new HtmlWebpackPlugin({
			entry: 'index', // 指定用entry里的包 (变量给模板使用)
			filename: 'index.html', //相对 output.path目录
			template: 'src/tpl/index.html', //相对config目录
			// 不支持模板里require, github.com/ampedandwired/html-webpack-plugin/issues/11, 所以临时只能在js里面插入HTML;
		}),
	],
	devtool: isProduction ? null : 'inline-source-map',//inline-source-map
	module: {
		// webpack.github.io/docs/loader-conventions.html
		// webpack.github.io/docs/list-of-loaders.html
		loaders: [
			{
				test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!autoprefixer-loader?{cascade:false,browsers:["last 3 version", "> 1%", "ie > 7"]}')
			},
			{
				// sourceMap是scss代码: 1.css-loader?sourceMap,2.sass-loader?sourceMap&sourceMapContents, github.com/jtangelder/sass-loader/issues/7#issuecomment-74791811
				test: /\.scss$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!autoprefixer-loader?{browsers:["last 3 version", "> 1%", "ie > 7"]}'
				+ '!sass-loader'
				+ '?' + 'includePaths[]=' + './src/scss'//path.resolve(__dirname, './node_modules')
				+ '&' + 'includePaths[]=' + './src/css' + '&sourceMap&sourceMapContents')
				// Assertion failed: (handle->flags & UV_CLOSING), function uv__finish_close, file ../deps/uv/src/unix/core.c, line 209
				// github.com/sass/node-sass/issues/713, (多个mod @import('_base') 时经常遇到. sass-loader@1.0.0 用了node-sass@3.0.0-pre 会有这个问题)
				// cnpm un sass-loader && cnpm i sass-loader@0.5.0 --save
			},
			{
				test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!autoprefixer-loader!less-loader')
			},
			// {test: /\.css$/, loader: 'style-loader!css-loader!autoprefixer-loader'}, // 样式会转成js, 添加<style>到页面
			{test: /\.coffee$/, loader: 'coffee-loader'},
			// {test: /\.js$/, loader: 'jsx-loader?harmony'},
			{test: /\.json$/, loader: 'json-loader'},
			// <=8k的图片使用base64内联, 其他的继续用图片, name参数可以指定目录
			{test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=8192&name=i/[hash].[ext]'},
			// {test: /\.(png|jpg|gif)$/, loader: 'file-loader'}, // 图片独立(兼容<IE8的browser), 还可以再用image-loader压缩: github.com/tcoopman/image-webpack-loader
			{test: /\.(otf|eot|svg|ttf|woff)$/, loader: 'url-loader?limit=8192'},
		]
	},
};