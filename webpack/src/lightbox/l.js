
require('./l.css');
function Lightbox() {
	this.body = document.querySelector('body');
	// require("url?name=img/[hash].[ext]&limit=1!./h5.png"); 
	// 注: 官方文档里面有句: url?prefix=img/!./file.png, 其实是没有prefix这个参数的, 放到独立文件夹, 需要设置name参数
};
Lightbox.prototype = {
	show: function(html) {
		var el = document.createElement('div');
		el.setAttribute('id', 'lightbox');
		el.innerHTML = html || '!!lightbox!!';
		this.body.appendChild(el);
	},
	hide: function() {
		var el = document.getElementById('lightbox');
		if (el) {
			el.parentNode.removeChild(el);
		}
	}
};
module.exports = {
	creat: function() {
		console.log('component: lightbox');
		return new Lightbox();
	}
}