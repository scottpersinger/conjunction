var pg           = require('pg'),
    _            = require('lodash'),
    async        = require('asyncjs');

function query(query, db_name) {
	db_name = db_name || 'database1';

	this.init = function(context, callback) {
		if (!context.config[db_name]) {
			throw "Require " + db_name + " config key";
		}
		var dburl = context.config[db_name];
		if (dburl.indexOf('?') == -1 && dburl.indexOf('localhost') == -1) {
			dburl = dburl + "?ssl=true";
		}
		pg.connect(dburl, function(err, client, done) {
			context[db_name] = client;
			if (callback) {
				callback(err);
			}
		}.bind(this));
	}

	this.run = function(msgs, context, callback) {
		context[db_name].query(query, function(err, result) {
			callback(err, result.rows);
		});
	}

	this.close = function(context) {
		context[db_name].end();
	}
}

function del(table, where) {
	this.run = function(msgs, context, callback) {
		var sql = 'DELETE FROM ' + table + '';
		if (where) {
			sql += " WHERE " + where;
		}
		this.db.query(sql, function(err, result) {
			callback(err);
		});
	}
}

function insert(table) {
	this.run = function(msgs, context, callback) {
		// Construct an insert assuming the properties of the object equal the column names
		function insert_record(msg, callback) {
			console.log("INSERT ", msg);
			var sql = 'INSERT INTO ' + table + ' ';
			var cols = [];
			var symbols = [];
			var vals = [];
			_.forIn(msg, function(value, key) {
				if (key == '_headers') {
					next;
				}
				cols.push(key);
				symbols.push('$' + (symbols.length+1));
				vals.push(value);
			});
			sql = sql + "(" + cols.join(",") + ") VALUES (" + symbols.join(",") + ")";
			console.log("[sql] ", sql);
			db.query(sql, vals, callback);
		}
		async.map(msgs, insert_record, function(err, results) {
			callback(err);
		});
	}
}
insert.prototype = new query();

module.exports = {
	query: query,
	insert: insert,
	del: del
}