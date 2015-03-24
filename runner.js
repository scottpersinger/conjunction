var Triggers = require('conjunction/triggers');

if (process.argv.length < 3) {
	console.log("Please provide a pipeline name");
	process.exit(1);
}
p = require('./pipelines/' + process.argv[2]);
p.configure(require('./pipelines/config.js'));

p.trigger(Triggers.once);
p.run();
