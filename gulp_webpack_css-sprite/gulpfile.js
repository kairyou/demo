/*
webpack.github.io/docs/usage-with-gulp.html
github.com/webpack/webpack-with-common-libs
*/

var gulp = require('gulp');
var gutil = require('gulp-util');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var webpackConfig = require('./webpack.cfg.js');
var sprite = require('css-sprite').stream;
var extend = require('util')._extend; 
var del = require('del');
var merge = require('merge-stream'); //multiple sources in one task
var gulpif = require('gulp-if');

var fs = require('fs'),
	path = require('path');

function getDirs(srcpath, ignores) {
	ignores = ignores || [];
	var reg = new RegExp(ignores.join('|'));
	return fs.readdirSync(srcpath).filter(function(file) {
		return fs.statSync(path.join(srcpath, file)).isDirectory() && !file.match(reg);
	});
}

// development
gulp.task('dev-server', ['webpack-dev-server']);
gulp.task('default', ['dev-server']);

// test|staging
gulp.task('build-test', ['webpack:build-dev']);
gulp.task('build-test-watch', ['webpack:build-dev'], function() {
	gulp.watch(['src/**/*'], ['webpack:build-dev']);
});

// css sprite
var prefix = 'as-'; // 图片和scss名称加前缀, 名称不能太普通(方便批量清理), as: auto-sprite
gulp.task('sprite', ['css-sprite:build']);
gulp.task('clean', function(callback) {
	// del.sync(['dist/*.js', '!dist/index.js']);
	del(['./src/img/' + prefix +'*', './src/css/' + '_' + prefix +'*'], callback);
});
gulp.task('css-sprite:build', ['clean'], function(callback) {
	// * 不同目录的png, 文件名要加前缀区分; @import多个icon时, 如果有文件名重复(比如: 都有home.png, 再@include sprite($home);时会有bug)
	var folders = getDirs('./src/img', ['^_']); // 子目录(忽略"_"开头的目录)
	// console.log(folders);
	var opts = {
		out: './src/img', // 生成的sprites目录
		cssPath: '../img/', //css里使用的图片路径(可以是URL地址)
		processor: 'scss', //生成的格式: css, less, sass, scss, stylus
		margin: 5, //icon间隔
		// retina: true, // 创建@2x的图片(源图就应该是2x的图), 并添加@media样式
	};
	var args = [];
	folders.forEach(function(folder, i) {
		var opt = extend(opts, {
			name: prefix + folder, // 生成sprites图的文件名, xxx-header.png
			style: '_' + prefix + folder + '.scss', // 生成的scss, _xxx-header.scss
			prefix: prefix + folder, // 样式前辍. 因为会生成多个, 所以名称也要独立. .xxx-header
			cssPath: '../../img/' // webpack编译时, 是相对用到的模块(src/mod/index/index.scss); 而不是相对生成的scss文件;
		});
		var stream = gulp.src(['./src/img/' + folder + '/*.png']) // 源目录
			.pipe(sprite(opt))
			.pipe(gulpif('*.png', gulp.dest(opt.out), gulp.dest('./src/css/')));
		args.push(stream);
		gutil.log('[css-sprite]', folder, 'done');
	});
	return merge.apply(null, args);
});

// production
gulp.task('build-prod', ['webpack:build']);
gulp.task('webpack:build', ['sprite'], function(callback) {
	// modify some webpack config options
	var cfg = Object.create(webpackConfig);
	cfg.plugins = cfg.plugins.concat(
		new webpack.DefinePlugin({
			'process.env': {
				// This has effect on the react lib size
				'NODE_ENV': JSON.stringify('production')
			}
		}),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin()
	);

	// run webpack
	webpack(cfg, function(err, stats) {
		if(err) throw new gutil.PluginError('webpack:build', err);
		gutil.log('[webpack:build]', stats.toString({
			colors: true
		}));
		callback();
	});
});

// test|staging, 相当于webpack命令行加了--display-chunks --display-modules参数(可在stats.toString的chunks, modules关闭)
var testConfig = Object.create(webpackConfig);
testConfig.devtool = 'inline-source-map'; //不产生多余文件
testConfig.debug = true;

// create a single instance of the compiler to allow caching
var devCompiler = webpack(testConfig);
gulp.task('webpack:build-dev', ['sprite'], function(callback) {
	// run webpack
	devCompiler.run(function(err, stats) {
		if(err) {throw new gutil.PluginError('webpack:build-dev', err);}
		gutil.log('[webpack:build-dev]', stats.toString({
			children: false,
			chunks: false,
			// modules: false,
			colors: true
		}));
		callback();
	});
});
// dev server
gulp.task('webpack-dev-server', ['sprite'], function(callback) {
	// modify some webpack config options
	var cfg = Object.create(webpackConfig);
	// cfg.devtool = 'eval';
	cfg.debug = true;

	// Start a webpack-dev-server
	new WebpackDevServer(webpack(cfg), {
		publicPath: '/' + cfg.output.publicPath,
		stats: {
			children: false,
			chunks: false,
			colors: true
		}
	}).listen(8080, 'localhost', function(err) {
		if(err) throw new gutil.PluginError('webpack-dev-server', err);
		gutil.log('[dev-server]', 'http://localhost:8080/webpack-dev-server/index.html');
	});
});
