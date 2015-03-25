module.exports = function(config) {
	database = require('conjunction/components/database');
	p = require('conjunction')(config);

	p.use(new database.Query('select 2', 'database1'));
	p.use(function(msgs, context, callback) {
		context.database1.raw('select id, email from mirror_herokuuser').then(function(result) {
			console.log("Rows ", result.rows);
			callback();
		});
	})

	return p;
}
