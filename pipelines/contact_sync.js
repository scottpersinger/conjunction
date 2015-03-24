Pipeline = require('conjunction');
database = require('conjunction/components/database');
util = require('conjunction/components/util');

p = new Pipeline();
p.use(new database.del('berkeley.contact'));
p.use(new database.query('select * from salesforce.contact'));
p.use(function(contact) {
	contact.externalid__c = contact.sfid;
	delete(contact.sfid);
	delete(contact.id);
});
p.use(new database.insert('berkeley.contact'));

module.exports = p;
