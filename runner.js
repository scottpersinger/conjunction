var triggers = require('conjunction/triggers');

if (process.argv.length < 3) {
	console.log("Please provide a pipeline name");
	process.exit(1);
}
var config = require('./pipelines/config.js');
p = require('./pipelines/' + process.argv[2])(config);

p.run(triggers.once);
