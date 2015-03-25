var _ = require('lodash');
var util = require('util');
var Stream = require('stream');
var knexLIB = require('knex');

util.inherits(DBWriter, Stream.Writable);
function DBWriter(table, db_key) {
	this.knex = null;
	this.table = table;
	this.constructor.super_.call(this, {objectMode:true});

	db_key = db_key || 'database1';

	this.init = function(context) {
		if (!context[db_key]) {
			throw "DBWriter must have database conn on key '" + db_key + "'";
		} else {
			this.knex = context[db_key];
		}
	}

	this._write = function(msg, encoding, callback) {
		this.knex(this.table).insert(msg).then(function() {
			callback();
		}).catch(function(err) {
			callback(err);
		});
	}
}

util.inherits(DBquery, Stream.Transform);
function DBquery(query, db_key) {
	this.knex = null;
	this.constructor.super_.call(this, {objectMode:true});

	db_key = db_key || 'database1';

	this.init = function(context) {
		if (!context[db_key]) {
			throw "Query component missing db connection on key '" + db_key + "'. Did you configure a Connection?";
		} else {
			this.knex = context[db_key];
		}
	}

	this._transform = function(inMsg, encoding, callback) {
		var that = this;
		that.knex.raw(query).stream(function(str) {
			str.on('readable', function(msg) {
				that.push(str.read());
			});
			str.on('finish', function() {
				callback(null, null);
			})
		});
	}
}

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
		this.conn = knexLIB({client:'pg', connection:context.config[db_key]});
		context[db_key] = this.conn;
		this.msgs.push(this.conn);
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
		setTimeout(function() {
			this.conn.destroy();
		}.bind(this), 200);
	});
}

module.exports = {
	Connection: DBConn,
	Query: DBquery,
	Writer: DBWriter
}

/*

var klib         = require('knex'),
    _            = require('lodash'),
    async        = require('asyncjs');


// Database connection component.
function connection(db_name) {
	this.db_name = db_name || 'database1';

	this.init = function(context, callback) {
		if (!context.config[this.db_name]) {
			throw "Require " + this.db_name + " config key";
		}
		var dburl = context.config[this.db_name];
		if (dburl.indexOf('?') == -1 && dburl.indexOf('localhost') == -1) {
			dburl = dburl + "?ssl=true";
		}
		var knex = klib({client:'pg', connection:dburl});
		context[this.db_name] = knex;
		if (callback) {
			callback();
		}
	}

	this.run = function(msgs, callback) {
	}

	this.close = function(context) {
		context[this.db_name].destroy();
	}
}

function query(query, db_name) {
	this.run = function(msgs, context, callback) {
		context[this.db_name].raw(query).then(function(result) {
			callback(null, result.rows);
		}).catch(function(err) {
			callback(err);
		});
	}

}
query.prototype = new connection();

function del(table, where) {
	this.run = function(msgs, context, callback) {
		context[this.db_name].raw("DELETE FROM " + table + (where ? (" WHERE " + where) : '')).then(function(row_count) {
			callback();
		}).catch(callback);
	}
}
del.prototype = new query();

function insert(table) {
	this.run = function(msgs, context, callback) {
		// Construct an insert assuming the properties of the object equal the column names
		var db_name = this.db_name;

		function insert_record(msg, callback) {
			context[db_name](table).insert(msg, 'id').then(function(rowid) {
				msg.id = rowid;
				callback();
			}).catch(function(err) {
				callback(err);
			});
		}
		async.map(msgs, insert_record, function(err, results) {
			callback(err);
		});
	}
}
insert.prototype = new query();

module.exports = {
	connection: connection,
	query: query,
	insert: insert,
	del: del
}
*/
