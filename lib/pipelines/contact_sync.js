module.exports = function(config) {
	Pipeline = require('conjunction');
	db = require('conjunction/components/database');
	util = require('conjunction/components/utilcomps');

	p = new Pipeline(config);
	p.use(new db.Connection('database1'));
	p.use(new db.Query('select * from mirror_herokuuser', 'database1'));
	p.use(new util.Logger('[heroku_user] '));
	p.use(function(contact) {
		return {email:contact.email, birthdate: contact.last_login};
	});
	p.use(new util.Logger(['[trans contact] ']));
	p.use(new db.Writer('berkeley.contact','database1'));

	return p;
}
