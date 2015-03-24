Pipeline = require('conjunction');
database = require('conjunction/components/database');
util = require('conjunction/components/util');

p = new Pipeline();
p.use(function() {
	return 'hello world';
});
p.use(new database.query('select * from mirror_herokuuser', 'database1'));
p.use(util.print);

module.exports = p;
