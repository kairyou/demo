// dialog plugin
// console.log($$);
$.extend({
	dialog: function(options) {
		var defs = {
			msg: '123'
		};
		var $body = $('body');
		var opts = $.extend({}, defs, options || {});
		var $dialog = $('<div>' +opts.msg+ '</div>');
		return $dialog.appendTo($body);
	}
});
var t = {t:1};
module.exports = {m:1}

