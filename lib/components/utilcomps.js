var util = require('util');
var Stream = require('stream');
var _ = require('lodash');
var fninfo = require('fninfo');

util.inherits(Logger, Stream.Transform);

function Logger(prefix) {
	this.constructor.super_.call(this, {objectMode:true});
	prefix = prefix || '';

	this._transform = function(msg, encoding, callback) {
		console.log(prefix + (_.isString(msg) ? msg : util.inspect(msg)));
		this.push(msg);
		callback();
	}
}

util.inherits(Mapper, Stream.Transform);

function Mapper(f) {
	this.constructor.super_.call(this, {objectMode:true});
	this.f = f;
	this.useCallback = fninfo(f).params.length == 3;

	this.init = function(context) {
		this.context = context;
	}

	this._transform = function(msg, encoding, callback) {
		if (this.useCallback) {
			this.f(msg, this.context, function(msg, more_coming) {
				this.push(msg);
				if (!more_coming) {
					callback();
				}
			}.bind(this));
 		} else {
			this.push(this.f(msg, this.context));
			callback();
		}
	}
}

util.inherits(Push, Stream.Duplex);

function Push(f, key) {
	if (!this.constructor.super_) {
		throw "Please construct the Push component with 'new' operator";
	}
	this.constructor.super_.call(this, {objectMode:true});
	this.msgs = _.flatten([_.isFunction(f) ? f() : f]);

	this._write = function(msg, encoding, callback) {
		this.msgs.unshift(msg);
		callback();
	}

	this._read = function() {
		this.push(this.msgs.shift() || null);
	}
}

util.inherits(Start, Stream.Readable);

function Start() {
	if (!this.constructor.super_) {
		throw "Please construct the Start component with 'new' operator";
	}
	this.constructor.super_.call(this, {objectMode:true});
	this.msgs = [{}];

	this._read = function() {
		this.push(this.msgs.pop() || null);
	}
}

module.exports = {
	Logger: Logger,
	Mapper: Mapper,
	Push: Push,
	Start: Start
}