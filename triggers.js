var http        = require('http'),
    express     = require('express');
    bodyParser  = require('body-parser')

function once(context, callback, shutdown) {
	callback(function() {;
		shutdown();
	});
}

function timer(options) {
	var interval = options.interval || 60;
	function run(context, callback, finish) {
		setTimeout(callback, interval*1000);
	}
	return run;
}

function http_post(path, options) {
	path = path || '/trigger';
	function run(context, callback, finish) {
		if (!context.express) {
			context.express = express();
			context.express.use( bodyParser.json() ); 
		}
		if (!context.http_server) {
			var server = http.createServer(context.express);
			var port = context.config.port || 5000;
			server.listen(port, function() {
			  context.log('HTTP trigger listening on port ' + port);
			});
			context.http_server = server;
		}
		context.log('HTTP trigger on path: ' + path);
		context.express.post(path, function(req, res) {
			callback([req.body]);
			res.status(200).send('OK');
		});
	}

	return run;
}

module.exports = {
	once: once,
	timer: timer,
	http_post: http_post
}
