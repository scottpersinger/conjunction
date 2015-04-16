var _ = require('lodash');
var util = require('util');
var Stream = require('stream');
var knexLIB = require('knex');
var interpolate = require('interpolate');

util.inherits(DBConn, Stream.Readable);
function DBConn(db_key) {
	this.constructor.super_.call(this, {objectMode:true});
	this.conn = null;
	this.msgs = [];
	db_key = db_key || 'database1';

	this.init = function(context) {
		if (!context.config[db_key]) {
			throw "DBConn must have config key '" + db_key + "'";
		}
		this.conn = knexLIB({client:'pg', connection:context.config[db_key], debug:context.config.debug});
		context[db_key] = this.conn;
		this.msgs.push(this.conn);
		this.context = context;
	}

	this._read = function() {
		if (this.msgs.length) {
			this.push(this.msgs[0]);
			this.msgs.pop();
		} else {
			this.push(null);
		}
	}

	this.on('end', function() {
		this.context.debug("Destroying db connection '" + db_key + "'");
		this.conn.destroy();
	});
}

util.inherits(DBWriter, Stream.Writable);
function DBWriter(table, db_key) {
	this.knex = null;
	this.table = table;
	this.constructor.super_.call(this, {objectMode:true});

	db_key = db_key || 'database1';

	this.init = function(context) {
		this.context = context;
		if (!context[db_key]) {
			throw "DBWriter must have database conn on key '" + db_key + "'";
		} else {
			this.knex = context[db_key];
		}
	}

	this._write = function(msg, encoding, callback) {
		if (_.isFunction(table)) {
			table(msg, this.context, callback);
		} else {
			this.knex(this.table).insert(msg).then(function() {
				callback();
			}).catch(function(err) {
				callback(err);
			});
		}
	}
}

util.inherits(DBTransformOp, Stream.Transform);
function DBTransformOp(db_key) {
	this.knex = null;
	Stream.Transform.call(this, {objectMode:true});

	db_key = db_key || 'database1';

	this.init = function(context) {
		this.context = context;
		if (!context[db_key]) {
			throw "Query component missing db connection on key '" + db_key + "'. Did you configure a Connection?";
		} else {
			this.knex = context[db_key];
		}
	}

	this.log = function() {
		this.context.debug.apply(null, ["[" + this.constructor.name + "]"].
			concat(Array.prototype.slice.call(arguments)));
	}
}


util.inherits(DBquery, DBTransformOp);
function DBquery(query, db_key) {
	this.constructor.super_.call(this, db_key);

	this._transform = function(inMsg, encoding, callback) {
		var that = this;
		var fullQ = interpolate(query, inMsg);
		fullQ = interpolate(fullQ, this.context.config);
		this.log("Query '" + fullQ + "'");
		that.knex.raw(fullQ).stream(function(str) {
			str.on('readable', function(msg) {
				that.push(str.read());
			});
			str.on('finish', function() {
				callback(null, null);
			})
		});
	}
}

util.inherits(CreateTable, DBTransformOp);
function CreateTable(table, definition, db_key) {
	this.constructor.super_.call(this, db_key);

	this._transform = function(inMsg, encoding, callback) {
		callback();
	}
}

module.exports = {
	Connection: DBConn,
	Query: DBquery,
	Writer: DBWriter
}

