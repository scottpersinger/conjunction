module.exports = function(config) {
	database = require('conjunction/components/database');
	util = require('conjunction/components/utilcomps');
	Pipeline = require('conjunction');

	p = new Pipeline(config);
	p.use(new database.Connection());
	p.use(new database.Query('select 2', 'database1'));
	p.use(function(msgs, context, callback) {
		context.database1.select(['id','email']).from('mirror_herokuuser').then(function(rows) {
			rows.forEach(function(row) {
				callback(row, true);
			});
			callback(null, false);
		});
	});
	p.use(new util.Logger());

	return p;
}
