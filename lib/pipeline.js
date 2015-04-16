var _            = require('lodash'),
    stream       = require('stream'),
    util_comps   = require('./components/utilcomps'),
    util         = require('util')


function Pipeline(config, name) {
	this.name = name;
	this.comps = [];
	this.config_comps = [];
	this.test_setup = null;
	this.context = {config: config};
	this.help = this.constructor.help;
	this.debug = config ? config.debug : false;
	this.log_level = Pipeline.INFO;

	adapt_component = function(c) {
		if (c === undefined) {
			throw "The component is undefined. Did you forget 'new'?";
		}
		if (_.isFunction(c) && !(c instanceof stream.Stream)) {
			c = new util_comps.Mapper(c);
		}
		if (_.isPlainObject(c) || _.isArray(c)) {
			c = new util_comps.Push(c);
		}
		if (_.isFunction(c.init)) {
			c.init(this.context);
		}
		return c;
	}.bind(this);

	this.use = function(c, name) {
		this.comps.push({c: adapt_component(c), name:name});
	}

	this.add = function(c, name) {
		return this.use(c, name);
	}

	this.replace = function(name, c) {
		var tuple = _.find(this.comps, function(t) {return t.name == name});
		if (tuple) {
			this.log(Pipeline.DEBUG, "Replacing comp with name '" + name + "'");
			tuple.c = adapt_component(c);
		} else {
			throw "Cannot find component '" + name + "' to relace";
		}
	}

	this.remove = function(name) {
		var idx = _.findIndex(this.comps, function(t) {return t.name == name});
		if (idx >= 0) {
			this.log(Pipeline.DEBUG, "Removing comp at " + idx + " comps length " + this.comps.length);
			this.comps[idx] = null;
			this.comps = _.compact(this.comps);
			this.log(Pipeline.DEBUG, "Comps length " + this.comps.length);
		} else {
			throw "Cannot find component '" + name + "' to relace";
		}
	}

	this.when_test = function(callback) {
		this.test_setup = callback;
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
		this.config_comps.push(c);
		if (_.isFunction(c.init)) {
			c.init(this.context);
		}
	}

	this.shutdown = function() {
		this.config_comps.forEach(function(c) {
			if (_.isFunction(c.emit)) {
				c.emit('end');
			}
		});
	}

	this.run = function(callback, use_tests) {
		var str = null;
		if (use_tests && this.test_setup) {
			this.test_setup(this);
		}
		
		_.compact(this.comps).forEach(function(t, index) {
			var c = t.c;
			if (str == null) {
				str = c;
			} else {
				str = str.pipe(c);
			}
			if (index == this.comps.length-1) {
				str.on('finish', function() {
					this.context.debug("Pipeline data finished.");
					this.shutdown();
					if (callback) {
						callback();
					}
				}.bind(this));
			}
		}.bind(this));
	}

	this.test_run = function(callback) {
		this.run(callback, true);
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
