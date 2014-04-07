var local = require('../').create('MyRequestLocal').run(function(err, ctx) {
	local.data.A = 'a';
	local.subLocal(true, function(err, ctx) {
		console.log('prints "a": ', local.data.A);  // prints 'a'
		local.data.A = 'b';
		setTimeout(function() {
			console.log('prints "b": ', local.data.A);  // prints 'b'
		}, 2000);
	});
	setTimeout(function() {
		console.log('prints "a": ', local.data.A);  // prints 'a'
	}, 1000);	
});