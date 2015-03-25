module.exports = function(config) {
	Pipeline = require('conjunction');
	database = require('conjunction/components/database');
	util = require('conjunction/components/utilcomps');

	p = new Pipeline();
	p.use(new util.Push(function() {
		return 'hello world';
	}));
	p.use(new util.Logger());

	return p;
}
