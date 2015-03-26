module.exports = function(config) {
	Pipeline = require('conjunction');
	database = require('conjunction/components/database');
	util = require('conjunction/components/utilcomps');

	p = new Pipeline(config);
	p.use(new util.Push(['hello world', 'goodbye!']));
	p.use(new util.Logger());

	return p;
}
