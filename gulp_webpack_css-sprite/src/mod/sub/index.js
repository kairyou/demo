// __DEV__: webpack-dev-server使用; __DEBUG__: 非生产环境使用(local/staging)
// var $ = require('jquery'); // CommonJs
// __DEBUG__ && console.log($);

require('./index.scss'); //css/scss/ @import的也会自动reload

if (__DEV__) {
    require('html!../../tpl/index.html');
    var html = require('html!./index.html');
    $('i[mod=sub]').replaceWith(html);
}

if (__DEBUG__) {console.log('sub mod');}