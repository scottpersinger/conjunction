var path = require('path');

module.exports = function(script_path) {
	var triggers = require('./triggers');

	var config = require(path.resolve('config.js'));
	p = require(path.resolve(script_path))(config);

	p.run(function() {
		// pipeline is done
	});
}

