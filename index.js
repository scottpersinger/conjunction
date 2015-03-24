var fninfo       = require('fninfo'),
    _            = require('lodash'),
    async        = require('asyncjs');

function Pipeline() {
	this.comps = [];
	this.msgs = [];
	this.context = {config: {}};
	this.triggers = [];

	this.trigger = function(trigger) {
		this.triggers.push(trigger);
	}

	this.use = function(cfunc) {
		this.comps.push(cfunc);
	}

	this.debugRun = function(info) {
		//console.log("Running component: '", info.name, "'");
	}

	this.reportError = function(info, e) {
		console.log("Component '", info.name, "' error: ", e);
	}

	this.configure = function(config) {
		_.assign(this.context.config, config);
	}

	this.consumeResult = function(info, err, msgs) {
		if (err) {
			this.reportError(info, err);
		}
		if (msgs) {
			if (_.isArray(msgs)) {
				this.msgs = this.msgs.concat(msgs);
			} else {
				this.msgs.push(msgs);
			}
		}
	}

	this.run = function() {
		// Initialize all components
		async.map(_.filter(this.comps, 'init'), function(comp, callback) {
			comp.init(this.context, callback);
		}.bind(this), function(err, results) {
			if (err) {
				console.log("Component init error: ", err, ", pipeline aborted.");
			} else {
				this.triggers.forEach(function(trigger) {
					trigger(_.bind(this.runFrom, this));
				}.bind(this));
			}
		}.bind(this));
	}

	this.runFrom = function(msgs, from) {
		if (msgs) {
			if (_isArray(msgs)) {
				this.msgs = this.msgs.contact(msgs);
			} else {
				this.msgs.push(msgs);
			}
		}
		from = from || 0;
		for (var index = from; index < this.comps.length; index++) {
			var comp = this.comps[index];
			var info = fninfo(comp);
			var action = comp;
			if (_.isFunction(comp.run)) {
				action = comp.run;
				info.name = fninfo(comp).name;
			}
			info = fninfo(action);
			if (info.params.length >= 3) {
				return this.runAsync(comp, action, index, info);
			} else if (info.params.length == 2 || info.params.length == 0) {
				this.debugRun(info);
				try {
					this.consumeResult(info, null, action.call(comp, this.msgs, this.context));
				} catch(e) {
					this.reportError(info, e);
				}
			} else {
				_.map(this.msgs, function(msg) {
					return action.call(comp, msg) || msg;
				});
			}
		}
		this.close();
	}

	this.runAsync = function(comp, action, index, info) {
		this.debugRun(info);
		action.call(comp, this.msgs, this.context, function(err, msgs) {
			this.consumeResult(info, err, msgs);
			this.runFrom(null, index+1);
		}.bind(this))
	}

	this.close = function() {
		this.comps.forEach(function(comp) {
			if (_.isFunction(comp.close)) {
				comp.close(this.context);
			}
		}.bind(this));
	}
}

module.exports = Pipeline;
