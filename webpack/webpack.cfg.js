// webpack --config webpack.cfg.js
// webpack-dev-server --config webpack.cfg.js --hot --quiet --content-base dist/

// var path = require('path');
var del = require('del');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var args = process.argv,
	isProduction = args.indexOf('-p') > -1; // console.log(process.env.BUILD_DEV); //BUILD_DEV=0 webpack -p
console.log('production', isProduction);

// del.sync(['dist/*.js', '!dist/index.js']);
del.sync(['dist/*']);

module.exports = {
	context: __dirname + '/src',
	resolve: {
		alias: {
			editor: './editor.js',
			// 'lightbox': '../dist/lightbox.js',
		},
		// modulesDirectories: ['web_modules', 'node_modules', 'js', 'mod/index'], // require('xx')时, 会去这些目录找(相对context)
	},
	entry: { // page list
		// test: ['./a.scss'],
		// index: ['./main.js'], post: ['./a.js', './b.js', './a.scss'],
		index: ['webpack/hot/dev-server', './main.js', './a.scss'], post: ['./a.js', './b.js', './a.scss'],
		// index: ['webpack/hot/dev-server', './main.js', './a.scss', './b.js'], post: ['./a.js', './b.js', './a.scss', './b.js'], // test common
	},
	output: {
		path: './dist', // 编译后文件存放的路径(可用[hash])
		publicPath: '', // 生成文件内用到的URL路径, 比如背景图等(可以设成http的地址)
		filename: '[name].[chunkhash].js', // 文件名规则 for entry
		chunkFilename: '[id].[chunkhash].js', //[id].bundle.js, 文件名规则 for 块文件(比如异步加载的文件)
		// library: 'xxx', libraryTarget: 'umd', // 需要打包成一个组件给其他地方引用的情况(library:组件名称可忽略), webpack.github.io/docs/configuration.html#output-library
	},
	externals: { // require这些不需要再编译(作为全局变量使用)
		jquery: 'jQuery', // shim(让非AMD或CJS的API可被使用): github.com/webpack/docs/wiki/shimming-modules
		// 'moment'
	},
	plugins: [ //http://webpack.github.io/docs/list-of-plugins.html
		function() { // 文件名带[hash]的时候, 必须依赖stats. webpack.github.io/docs/long-term-caching.html
			this.plugin('done', function(stats) { // stats.json的assetsByChunkName, 包含了build后的文件列表
				var datas = stats.toJson(), stats;
				stats = './stats.json'; // path.join(__dirname, '..', 'stats.json'),
				require('fs').writeFileSync(stats, JSON.stringify(datas.assetsByChunkName));
			});
		},
		/*new webpack.ProvidePlugin({ // 让变量直接在模块内可用(意义不太大)
			$$: './jquery.min.js' // 可以用alias/externals里定义的变量 (路径/alias方式会把文件内容插进来, 而externals的不会)
		}),*/
		new webpack.DefinePlugin({ // 可以定义一些公共变量在代码里使用
			__DEBUG__: isProduction ? false : true //.js: __DEBUG__ && console.log($);
		}),
		// 把css独立, 但对于异步加载的js里的css不会独立(因为这样的基本都是组件, 不需要独立), webpack.github.io/docs/stylesheets.html
		new ExtractTextPlugin('[name].[contenthash:20].css'), // 文件名规则 for css, 限定hash长度20
		new webpack.optimize.CommonsChunkPlugin('common', 'common.[chunkhash].js'), // 生成公共文件(每个entry都用到的, 参数1是公共chunk name(css用), 参数2是filename给js用)
		// ExtractTextPlugin('[name].[chunkhash].css'): 共用的js或css变: common js和css都会变; 模块内的js或css变, entry的js和css都会变
		// ExtractTextPlugin('[name].[contenthash].css'): 公共或entry的js变: js变, css不变; css变, js/css都变
		new HtmlWebpackPlugin({
			filename: 'index.html', //相对 output.path目录
			template: '_index.html', //相对context目录
		}),
	],
	devtool: isProduction ? null : '#inline-source-map',
	module: {
		// http://webpack.github.io/docs/loader-conventions.html
		// http://webpack.github.io/docs/list-of-loaders.html
		loaders: [
			{
				test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!autoprefixer-loader')
			},
			{
				test: /\.scss$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!autoprefixer-loader!sass-loader')
			},
			{
				test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!autoprefixer-loader!less-loader')
			},
			// 样式会转成js, 添加<style>到页面
			// {test: /\.css$/, loader: 'style-loader!css-loader!autoprefixer-loader'},
			{test: /\.coffee$/, loader: 'coffee-loader'},
			// {test: /\.js$/, loader: 'jsx-loader?harmony'},
			{test: /\.json$/, loader: 'json-loader'},
			{test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=8192'}, // <=8k的图片使用base64内联, 其他的继续用图片
			// {test: /\.(png|jpg|gif)$/, loader: 'file-loader'}, // 图片独立(兼容<IE8的browser), 还可以再优化: https://www.npmjs.com/package/image-webpack-loader
			{test: /\.(otf|eot|svg|ttf|woff)$/, loader: 'url-loader?limit=8192'},
		]
	},
};