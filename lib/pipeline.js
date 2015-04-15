var _            = require('lodash'),
    stream       = require('stream'),
    util_comps   = require('./components/utilcomps')


function Pipeline(config, name) {
	this.name = name;
	this.comps = [];
	this.context = {config: config};
	this.help = this.constructor.help;
	this.debug = config ? config.debug : false;
	this.log_level = Pipeline.INFO;

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

	this.log = function(level) {
		if (level <= this.log_level) {
			console.log(_.compact(Array.prototype.slice.call(arguments, 1)).join(" "));
		}
	}

	this.context.debug = function() {
		this.log.apply(this, [Pipeline.DEBUG].concat(Array.prototype.slice.call(arguments, 0)));
	}.bind(this);

	this.context.info = function() {
		this.log.apply(this, [Pipeline.INFO].concat(Array.prototype.slice.call(arguments, 0)));
	}.bind(this);

	this.context.error = function() {
		this.log.apply(this, [Pipeline.ERROR].concat(Array.prototype.slice.call(arguments, 0)));
	}.bind(this);

	this.config = function(c) {
		if (_.isFunction(c.init)) {
			c.init(this.context);
		}
	}

	this.run = function(callback) {
		var str = null;
		this.comps.forEach(function(c) {
			if (str == null) {
				str = c;
			} else {
				str = str.pipe(c);
			}
			if (callback && str == this.comps[this.comps.length-1]) {
				str.on('finish', callback);
			}
		}.bind(this));
	}

	this.toString = function() {
		return "Pipeline: \n" +
			_.map(this.comps, function(c, idx) {return (idx+1) + ": " + c}).join("\n");
	}
}

Pipeline.DEBUG = 40;
Pipeline.INFO  = 30;
Pipeline.WARN  = 20;
Pipeline.ERROR = 10;

Pipeline.help = function() {
	console.log("Pipelines hold and execute a series of components, implicitly \n\
passing data between each component. To use a Pipeline, add components to the \n\
pipeline, then add a trigger to start the pipeline, then call 'run' \n\
\n\
Example:\n\
\n\
  config = {...};\n\
  dualty = require('duality');\n\
  \n\
  p = new duality.Pipeline(config);\n\
  p.use(new duality.util.Push('hello world'));\n\
  p.use(new duality.util.Logger());\n\
  p.run();\n\
\n\
  Run 'Pipeline.help_components()' for a description of standard components.\n\
");
}	

module.exports = Pipeline;
