<!-- x=1500 y=1000 rotate=90 -->
# Webpack +
<br><br>

<p align="center">
Webpack 使用介绍,  以及与gulp的搭配(顺带css-sprite)
</p>


---------
<!-- x=0 y=0 scale=0.5 -->
## Webpack简介
<br><br>

编译好资源给浏览器使用, 特点:
<br><br>

- 模块打包
- 无论CommonJs还是AMD都支持
- 支持模块按需加载
- 任何用到的资源都可作为模块被require(js/css/图片/字体/html...)
- 预编译(sass/less/coffeescript/图片转base64...)
- 优化: 压缩/文件缓存
- 切分并提取公共代码
- Shim支持
- source-map支持

<br><br>
Bowserify,RequireJS 应该可以被完全取代, 很多Grunt 跟 Gulp的功能也能做到

---------
<!-- x=-1500 y=0 scale=0.5 -->
## 基本用法
<br><br>

```js
//webpack.config.js
module.exports = {
    context: __dirname + '/src',
    entry: { //打包成2个文件index.js,about.js
        index: ['./a.js', './a.css', './b.js', './b.css'], //css和js打包到一起, 用<style>添加到页面
        about: ['./a.js', './a.css', './c.js', './c.css'],
    },
    output: {
        path: './build',
        publicPath: 'build/', // 生成文件内用到的URL路径, 比如背景图等(可以设成http的地址)
        filename: '[name].js' // index.js, about.js
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: 'style-loader!css-loader' }, // 针对.css文件用2个加载器预处理
        ]
    },
};
```
<br><br>
命令行执行: webpack 或者 webpack --config webpack.config.js  
参见:  https://github.com/petehunt/webpack-howto

---------
<!-- x=-500 y=500 z=500 -->
## 模块化开发
<br><br>

```js
// a.js
function show() { // 私有的
    console.log('a.js', 'show');
};
module.exports = { //CommonJS方式
    show: function(){ //外部接口
        show();
    }
}
```
<br>
```js
// b.js
var a = require('./a');
a.show(); // 调用a提供的接口
```

<br><br>
即使没用过 RequireJS, Node.js也很容易理解  
不再需要RequireJS或我们的Hub等等来组织模块(也降低了学习成本),   
也不再需要去写define(...)之类的把模块包起来,  
var fn, function fn(){}随便用, 不必担心和其他模块冲突, 因为webpack会用代码把模块包起来;

---------
<!-- x=1500 y=3000 z=-900 -->
## 模块加载
<br><br>

```js
// sync加载2种方式
var a = require('./a.js'); // CommonJs (推荐)
//a.show();

define(['./b.js', './c.js'], function(dep1, dep2) { // AMD
    dep2.show();
});
```
<br>
```js
// async按需加载2种方式
require(['./a.js'], function(module){ // AMD (推荐)
    module.show();
    var c = require('./c.js').show(); //c.js会和a.js打包到一起
});

require.ensure([], function(require) { // CommonJs
    require('./b.js').show(); // c.js会和b.js打包到一起
    var c = require('./c.js').show(); // 前面已经执行过, 这里的c不会再执行(c的接口可正常使用)
});
```
<b style="color:#068b6c">那么问题来了, 代码重复: a,b都含有c的代码(webpack -p模式也一样);</b>  
<font color="#666">\* 同步require('./c.js')后, c的代码才可以自动优化掉</font>  
<br>
异步方式可用include优化(webpack扩展的方法):
```js
require.include('./c'); //只加载不执行(c被打包到当前js里, 但不会被执行), 和 require('./c') 的区别就是是否执行c
```
这样后续的异步依赖c时, 打包时就不会包含c了 (当模块被多次异步依赖时, 优化的效果就明显了)  
<br><br>
题外话: require.ensure(['./c'], ...) 也是只加载不执行(但功能不同, 异步加载, fn里再require()才执行);

---------
<!-- x=2500 y=1000 rotate=90 -->
## scss/less/css的使用
<br><br>

方式1: 直接js内require:
```js
require('./a.scss'); // 推荐, 模块依赖清晰
```
<br>
方式2: webpack.config.js的entry里添加, 比如: 
```js
 entry: {index: ['./index.js', './index.scss']}
```

Ps: 默认会把css/js打包到一起, 再通过js添加style到页面;  
css 里用 @import url('./ui.css'), 会把ui.css内容加到当前文件的最上面 (优化掉@import);  
<span style="color:#666">\* 配合extract-text-webpack-plugin, 可以把css独立打包(和js一样也会自动合并多个);</span>
<br><br> 

图片的处理, webpack.config.js的loaders内设定: 
```js
{test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=8192'}, // <=8k的图片使用base64内联, 其他的继续用图片
{test: /\.(png|jpg|gif)$/, loader: 'file-loader'}, // 图片独立(兼容<IE8的browser)
```
图片还可以再优化:  github.com/tcoopman/image-webpack-loader
<br><br>
<font color="#666">\* Webpack里一切都可作为模块加载</font>

---------
<!-- x=2500 y=-1000 scale=0.5 -->
## 样式优化
<br>

还记得大明湖畔的`@mixin`? 比如方法border-radius:
```css
//_base.css
@mixin border-radius($radius: 5px) {
    -webkit-border-radius: $radius;-moz-border-radius: $radius;-khtml-border-radius: $radius;border-radius: $radius;
}
//main.scss
.test{@include border-radius(3px);} // 使用@include 简化开发
```
<br>
<b style="color:#068b6c">除去优点, 那么问题又来了: </b>
- 不太熟悉的人怎么用? 可能要再翻看下API(可能有N个@mixin方法, 更悲剧的可能有: borderRadius/border_radius...)
- border-radius已经支持的很好, 不再需要写-webkit-border-radius/-moz-border-radius了

<br>
使用autoprefixer可大量减少mixin的使用, webpack.config.js的module.loaders内设定: 
```js
{test: /\.css$/, loader: 'style-loader!css-loader!autoprefixer-loader?{cascade:false,browsers:["last 3 version", "> 1%", "ie > 7"]}'},
{test: /\.scss$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!autoprefixer-loader!sass-loader')}
{test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!autoprefixer-loader!less-loader')}
```
这样code只需要写: border-radius: 3px; <i style="color:#666">// 只需要写标准的就好</i>
<br><br>

config的plugins:[]内, 增加: `new ExtractTextPlugin('[name].css')`, 再加上loader内的规则, 就可以让css独立了  
<font color="#666">\* 异步加载的模块内用到的css不会独立</font>
<br>

注意事项: 
> www.npmjs.com/package/autoprefixer#faq  
> github.com/postcss/autoprefixer/wiki/support-list

---------
<!-- x=2500 y=-2500 z=-666 -->
```css
.swiper-wrapper { /*使用前*/
    position:relative;width:100%;
    -webkit-transition-property:-webkit-transform, left, top;
    -webkit-transition-duration:0s;
    -webkit-transform:translate3d(0px,0,0);
    -webkit-transition-timing-function:ease;

    -moz-transition-property:-moz-transform, left, top;
    -moz-transition-duration:0s;
    -moz-transform:translate3d(0px,0,0);
    -moz-transition-timing-function:ease;

    -o-transition-property:-o-transform, left, top;
    -o-transition-duration:0s;
    -o-transform:translate3d(0px,0,0);
    -o-transition-timing-function:ease;
    -o-transform:translate(0px,0px);

    -ms-transition-property:-ms-transform, left, top;
    -ms-transition-duration:0s;
    -ms-transform:translate3d(0px,0,0);
    -ms-transition-timing-function:ease;

    transition-property:transform, left, top;
    transition-duration:0s;
    transition-timing-function:ease;

    -webkit-box-sizing: content-box;
    -moz-box-sizing: content-box;
    box-sizing: content-box;
}
```

```css
.swiper-wrapper { /*使用后*/
    position:relative;width:100%;
    transition-property:transform, left, top;
    transition-duration:0s;
    transform:translate3d(0px,0,0);
    transition-timing-function:ease;
    box-sizing: content-box;
}
```

---------
<!-- x=2500 y=500 z=1700 rotate=90 -->
## 缓存优化 + 自动生成公共文件
<br>
文件名带hash, 多版本并存, 未变动的(缓存过)不需要重新下载. 

可把当前打包的hash map用json储存, 给页面调用.  
<br><br>

```js
// webpack.config.js内设定
output: {
    path: './dist', // 编译后文件存放的路径(可用[hash])
    filename: '[name].[chunkhash].js', // 文件名规则 for entry
    chunkFilename: '[id].[chunkhash].js', // 文件名规则 for 块文件(比如异步加载的文件)
},
plugins: [
    function() { // 文件名带[hash]的时候, 必须依赖stats
        this.plugin('done', function(stats) { // stats.json的assetsByChunkName, 包含了build后的文件列表
            var datas = stats.toJson(), stats;
            stats = './stats.json'; // path.join(__dirname, '..', 'stats.json'),
            require('fs').writeFileSync(stats, JSON.stringify(datas.assetsByChunkName));
        });
    },
    new ExtractTextPlugin('[name].[contenthash:20].css'), // 文件名规则 for css, 限定hash长度20
    // 生成公共文件(参数1是公共chunk name(css用), 参数2是给js用)
    new webpack.optimize.CommonsChunkPlugin('common', 'common.[chunkhash].js'), 
]
```
不需要上个版本的文件时, 可以根据上个版本的json取出文件列表直接删掉(对比目前的去重).

---------
<!-- x=3500 y=1500 scale=0.1 -->
## 打包组件
<br>

问题: 一个组件lightbox, 文件有 l.js, l.css, l.png...., 在页面要怎样使用?

<br>
- css和js分别加到header和footer
- 使用requirejs等加载器加载js和css(需要额外插件)

<font color="#666">方式1: 不能按需加载; 方式2: 必须依赖加载器,  增加css/js要在调用的地方调整</font>

<br>
Webpack, 所有js/css/图片都可以打包成一个文件来减少请求(不考虑<IE8)

+ 可以单独写一个webpack.lightbox.js 来打包
+ 直接传参数给webpack(执行命令的目录不能有webpack.config.js):
```
webpack ./l.js ./lightbox.pkg.js --module-bind 'css=style!css' --module-bind 'png=url-loader?limit=8192' --output-library-target 'umd'
// 如果不考虑base64, 可以直接用file-lorder代替url-loader(图片独立)
// libraryTarget是必须的. 否则被包起来后, 组件的方法不能被调用. 除非变量定义成 window.xxx;
// * umd(同时支持被amd/commonjs方式引用)
```

<br>
稍有不便:  
打包好的组件(有独立的图片的情况), 被require后, 再打包时, 不会把相关的图片转移到build目录(没有被当做模块)

<br>
解决(根据使用场景): 
- 打包的时强制用base64
- 打包设定成css文件独立
- 直接require源码(用到的时候才自动打包)

---------
<!-- x=4500 y=1500 scale=0.1 -->
## 定义global变量给模块debug
<br><br>

```js
// webpack.config.js内设定
var env = process.env.NODE_ENV,
    isProduction = 'production' == env,
    isDev = 'development' == env;
...
plugins: [
    new webpack.DefinePlugin({ // 可以定义一些公共变量在代码里使用
        __DEBUG__: isProduction ? false : true,
        __DEV__: isDev,
    }),
]
// 命令行执行: NODE_ENV=development webpack

// main.js
if (__DEBUG__) { // 这段代码 __DEBUG__为false时(NODE_ENV=production)会自动移除
    console.log('debug');
}
```
---------
<!-- x=5500 y=1500 scale=0.1 -->
## source-map
<br>

```js
// webpack.config.js内设定
devtool: isProduction ? null : 'inline-source-map', // inline-source-map 不额外生成.map文件
// module: {
loaders: [
{
  test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!autoprefixer-loader?{cascade:false,browsers:["last 3 version", "> 1%", "ie > 7"]}')
},{
  test: /\.scss$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!autoprefixer-loader?{browsers:["last 3 version", "> 1%", "ie > 7"]}'
  + '!sass-loader' + '?' + 'includePaths[]=' + './src/scss'
   + '&' + 'includePaths[]=' + './src/css' + '&sourceMap&sourceMapContents')
},
]


// Assertion failed: (handle->flags & UV_CLOSING), function uv__finish_close, file ../deps/uv/src/unix/core.c, line 209
// 多个模块有 `@import "xxx.scss";` 时经常遇到, sass-loader@0.5.0 - sass-loader@1.0.0 会安装node-sass@3.0.0-pre 会有这个问题)
// npm un sass-loader node-sass --save && cnpm i sass-loader@0.4.2 --save
```
---------
<!-- x=6500 y=1500 scale=0.1 -->
## Shim支持
<br>

<i style="color:#666">shim - 让不兼容当前环境的API可用, 这里就是让非AMD或CJS的API可被使用

github.com/webpack/docs/wiki/shimming-modules 有很多方式可以实现, 作用主要是模块变量的导入/导出</i>
<br><br>

3种常用的:
```js
// imports: 让dialog.js里的$$可用 (依赖webpack.config.js定义的abc)
require(['imports?$$=abc!./jquery.dialog.js']);

// exports: 导出dialog.js的变量(代码后面加上了: module.exports = t)
require(['exports?abc!./jquery.dialog.js'], function(module){ 
    console.log(module, window.abc);
});

// expose: 导出dialog.js的变量为全局变量
require(['expose?abc!./jquery.dialog.js'], function(module){
    console.log(module, window.abc);
});
```
<br>

可能会被拿来比较的2种方式:
```js
externals: { // require这些不需要再编译(作为全局变量使用) 适合页面已经引入了JS
    jquery: 'jQuery',
},

plugins: [
    new webpack.ProvidePlugin({ // 让变量xx直接在模块内可用 (意义不太大)
        jquery: './jquery.min.js' // 会把文件内容插入require('jquery')的模块
    }),
]
```
---------
<!-- x=7500 y=1500 scale=0.1 -->
## webpack-dev-server
<br>
```
npm install -g webpack-dev-server # 安装
```

本地创建 localhost:8080/ 调试代码, 代码变动会自动reload. 主要是针对静态页(创建HTML)调试.
<br><br>

使用:
```
webpack-dev-server --config webpack.cfg.js --hot --content-base build/
# 文件在内存中(并没有在build目录生成)
```
前提: entry 里面要加上`'webpack/hot/dev-server'`, 比如: `index: ['webpack/hot/dev-server', './index.js']`

<br>
修改资源后, `http://localhost:8080/webpack-dev-server/` 就可以自动reload了  
<font color="#666">\* localhost:8080/ 如果HTML加上`<script src="http://localhost:8080/webpack-dev-server.js"></script>` 也可以自动reload</font>
<br><br>

带[hash]文件名的资源测试环境怎么引用?
```js
// 使用: html-webpack-plugin
new HtmlWebpackPlugin({
   test: true, // 传递变量给模板使用
   filename: 'index.html', //相对 output.path目录
   template: 'src/tpl/index.html', //相对config目录(根据模板生成HTML)
   // * @1.1.0还不支持模板里require, 所以临时只能在js里面插入HTML;
  })
// tpl/index.html:
// {%=o.htmlWebpackPlugin.assets.XXX%} - XXX指打好的包(entry里定义的)
// html就可以引入名称随机的资源了
```
<br>

http://webpack.github.io/docs/webpack-dev-server.html

---------
<!-- x=8500 y=1500 scale=0.1 -->
## 搭配 gulp + css-sprite 
<br>

搭配gulp/grunt:  
<font color="#666"> github.com/webpack/webpack-with-common-libs</font>  
适合: 复杂的项目, 有多个task, 或有多个 webpack build等
<br><br>

搭配css-sprite:
<font color="#666"> github.com/aslansky/css-sprite, 比Ruby的Compass Css Sprite性能好太多了~</font>

- 支持retina(ratios:1,2)
- 图片可选base64输出
- 支持less/scss/stylus

<br>

使用方式:
```
@import 'scss/_icons';
.icon-home {@include sprite($header-home);} //header-home是图片名称
```
<br>

例子可以看: `github.com/kairyou/demo/tree/master/gulp_webpack_css-sprite`

---------
<!-- x=9500 y=1500 scale=0.1 -->
## more
<br><br>

- 依赖可视化: http://webpack.github.io/analyse
- 调试React: http://gaearon.github.io/react-hot-loader/
- ...
<br><br>

坑?
- 一些插件不是太完善, 比如前面说的:sass-loader的bug
- html-webpack-plugin用起来还不是很爽, 模板不能require模板 (最后采用了js去append的方式).
- css-sprite(和webpack无关), &nbsp;同时创建多个sprite时也要注意, 图片名称不能重复
- ...忘记了

<br>

<span style="color:#666">\* 所以必须统一控制好npm package的版本</span>

---------
<!-- x=9500 y=1500 z=500 rotate=90 -->
## Questions?
