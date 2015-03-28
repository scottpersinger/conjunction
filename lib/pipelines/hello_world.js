module.exports = function(config) {
	duality = require('duality');

	p = new duality.Pipeline(config);
	p.use(new duality.util.Push(['hello world', 'goodbye!']));
	p.use(new duality.util.Logger());

	return p;
}
