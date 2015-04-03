console.log('c.js', 'run');
function privateFn() {
	console.log('c.js', 'privateFn');
};
module.exports = {
	show: function(){
		console.log('c.js', 'show');
		// privateFn();
	}
};
