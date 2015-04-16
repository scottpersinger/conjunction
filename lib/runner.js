var path = require('path');

module.exports = function(script_path, argv) {
	var duality = require('duality');
	var config = require(path.resolve('config.js'));
	var pipeline = require(path.resolve(script_path))(config);

	if (argv.d) {
		pipeline.log_level = duality.Pipeline.DEBUG;
	}
	if (argv.l) {
		switch (argv.l) {
			case 'debug':
				pipeline.log_level = duality.Pipeline.DEBUG;
				break;
			case 'info':
				pipeline.log_level = duality.Pipeline.INFO;
				break;
			case 'error':
				pipeline.log_level = duality.Pipeline.ERROR;
				break;
		}
	}
	if (pipeline.log_level == duality.Pipeline.DEBUG) {
		pipeline.context.config.debug = true;
	}

	function run() {
		console.log("Running pipeline '" + pipeline.name + "'");
		if (argv.test) {
			pipeline.test_run();
		} else {
			pipeline.run();
		}
	}

	return {
		run: run
	} 
}

