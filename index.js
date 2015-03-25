var _            = require('lodash'),
    stream       = require('stream'),
    util_comps   = require('./components/utilcomps')


function Pipeline(config) {
	this.comps = [];
	this.context = {config: config};

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
}

Pipeline.help = "Pipelines hold and execute a series of components, implicitly \
passing data between each component. To use a Pipeline, add components to the \
pipeline, then add a trigger to start the pipeline, then call 'run'.";	

module.exports = Pipeline;
