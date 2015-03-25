var Pipeline = require('conjunction'),
	Triggers = require('conjunction/triggers'),
    database = require('conjunction/components/database'),
    util = require('conjunction/components/util')
    ;

p = new Pipeline();
p.trigger(Triggers.http_post('/event'));
p.use(new database.del('berkeley.contact'));
p.use(new database.query('select * from salesforce.contact'));
p.use(function(contact) {
	contact.externalid__c = contact.sfid;
	delete(contact.sfid);
	delete(contact.id);
});
p.use(new database.insert('berkeley.contact'));
p.use(util.print);

module.exports = p;
