// __DEV__: webpack-dev-server使用; __DEBUG__: 非生产环境使用(local/staging)
// var $ = require('jquery'); // CommonJs
// __DEBUG__ && console.log($);

require('./index.scss'); //css/scss/ @import的也会自动reload

if (__DEV__) { // 静态页测试
	require('html!../../tpl/index.html'); // 作用: 修改可让webpack-dev-server自动reload
	var html = require('html!./index.html'); //会把<img 用到的本地图片也当做模块(生成到dist目录)
	// var html = require('raw!./index.html'); // 纯内容
	$('i[mod=main]').replaceWith(html);
}

if (__DEBUG__) {console.log('main mod');}


function test(){
    __DEBUG__ && console.log('!!');
}
module.exports = {
    test: function(){
        console.log(111);
        test();
    }
}

// 按需加载
// require(['./test2.js'], function(module){ //AMD
//     console.log('amd', module);
//     module.show();
// });