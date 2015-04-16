var http       = require('http'),
    express = require('express'),
    bodyParser = require('body-parser');

var Stream = require('stream');
var util = require('util');

util.inherits(HTTPRequest, Stream.Readable);

function HTTPRequest(method, path, options) {
	var path = path || '/trigger';
	var app = express();
	var server = null;

	if (!this.constructor.super_) {
		throw "Please construct the herokuconnect_trigger component with 'new' operator";
	}
	Stream.Readable.call(this, {objectMode:true});

	this.init = function(context) {
		this.context = context;
	}

	this._read = function(size) {
		if (!server) {
			app.use( bodyParser.json() );
			server = http.createServer(app);
			var port = this.context.config.port || 5000;
			server.listen(port, function() {
		  		this.context.info("[http]", "Listening on port " + port);
			}.bind(this));
		}
		if (method == 'GET') {
			app.get(path, function(req, res) {
				this.context.debug("[http]", "GET " + path);
				if (!this.push(req.query)) {
					server.close();
				}
				res.status(200).send('OK');
			}.bind(this));

		} else if (method == 'POST') {
			app.post(path, function(req, res) {
				this.context.debug("[http]", "POST " + path);
				if (!this.push(req.body)) {
					server.close();
				}
				res.status(200).send('OK');
			}.bind(this));
		}
	}
}

util.inherits(GET, HTTPRequest);
function GET(path, options) {
	HTTPRequest.call(this, 'POST', path, options);
}

util.inherits(POST, HTTPRequest);
function POST(path, options) {
	HTTPRequest.call(this, 'POST', path, options);
}

module.exports = {
	get: GET,
	post: POST
}
