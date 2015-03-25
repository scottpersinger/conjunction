var util = require('util');
var Stream = require('stream');
var _ = require('lodash');

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

	this._transform = function(chunk, encoding, callback) {
		this.push(this.f(chunk));
		callback();
	}
}

util.inherits(Push, Stream.Readable);

function Push(f) {
	if (!this.constructor.super_) {
		throw "Please construct the Push component with 'new' operator";
	}
	this.constructor.super_.call(this, {objectMode:true});
	this.msgs = [_.isFunction(f) ? f() : f];

	this._read = function() {
		this.push(this.msgs.pop() || null);
	}
}

module.exports = {
	Logger: Logger,
	Mapper: Mapper,
	Push: Push
}