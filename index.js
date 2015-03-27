var _            = require('lodash'),
    stream       = require('stream'),
    util_comps   = require('./components/utilcomps')


function Pipeline(config) {
	this.comps = [];
	this.context = {config: config};
	this.help = this.constructor.help;

	this.use = function(c) {
		if (c === undefined) {
			throw "The component is undefined. Did you forget 'new'?";
		}
		if (_.isFunction(c) && !(c instanceof stream.Stream)) {
			c = new util_comps.Mapper(c);
		}
		if (_.isFunction(c.init)) {
			c.init(this.context);
		}
		this.comps.push(c);
	}

	this.run = function(trigger) {
		trigger(function() {
			var str = null;
			this.comps.forEach(function(c) {
				if (str == null) {
					str = c;
				} else {
					str = str.pipe(c);
				}
			})
		}.bind(this), this.context);
	}

	this.toString = function() {
		return "Pipeline: \n" +
			_.map(this.comps, function(c, idx) {return (idx+1) + ": " + c}).join("\n");
	}
}

Pipeline.help = function() {
	console.log("Pipelines hold and execute a series of components, implicitly \n\
passing data between each component. To use a Pipeline, add components to the \n\
pipeline, then add a trigger to start the pipeline, then call 'run' \n\
\n\
Example:\n\
\n\
  config = {...};\n\
  Pipeline = require('conjunction');\n\
  triggers = require('conjunction/triggers');\n\
  util = require('conjunction/components/utilcomps');\n\
  \n\
  p = new Pipeline(config);\n\
  p.use(new util.Push('hello world'));\n\
  p.use(new util.Logger());\n\
  p.run(triggers.once);\n\
\n\
  Run 'Pipeline.help_components()' for a description of standard components.\n\
");
}	

module.exports = Pipeline;
