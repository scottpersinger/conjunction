// Query rows from a table
Pipeline = require('conjunction');
database = require('conjunction/components/database');
util = require('conjunction/components/util');

p = new Pipeline();
p.use(new database.query('select * from salesforce.contact', 'database1'));
p.use(new util.debugnode());

module.exports = p

