module.exports = function(config) {
	// Query rows from a table
	Pipeline = require('conjunction');
	db = require('conjunction/components/database');
	util = require('conjunction/components/utilcomps');

	p = new Pipeline(config);
	p.use(new db.Connection());
	p.use(new db.Query('select * from salesforce.contact'));
	p.use(new util.Logger());

	return p;
}

