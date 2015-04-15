#!/usr/bin/env node
var fs     = require('fs'),
	path   = require('path'),
	runner = require('./lib/runner'),
	argv = require('minimist')(process.argv.slice(2))
	;

"use strict";

var script_template = "\
module.exports = function(config) {\n\
	duality = require('duality');\n\
\n\
	p = new duality.Pipeline(config);\n\
	p.use(new duality.util.Push('hello world'));\n\
	p.use(new duality.util.Logger());\n\
\n\
	return p;\n\
}\n\
";

function create_project(args) {
	var dir = args[0];
	if (!dir) {
		return "Error, provide the project path";
	}

	var files = {
		'package.json': JSON.stringify({name:path.basename(dir), version:'1.0.0',
							main:'index.js',dependencies:'duality'}, null, 4) + "\n",
		'scripts/script1.js': script_template,
		'config.js' : 'module.exports = {}\n'
	};

	function mkdirs(full_path) {
		var p = "";
		full_path.split("/").forEach(function(part) {
			p += part + "/";
			try {
				fs.mkdirSync(p);
			} catch (e) {}
		});
	}

	try {
		fs.statSync(dir);
		return "Error, path '" + dir + "' already exists";
	} catch (e) {
		console.log("==> Directory '" + dir + "'");
		mkdirs(dir);
		for (var f in files) {
			if (f.indexOf("/") != -1) {
				mkdirs(dir + "/" + path.dirname(f));
			}
			err = fs.writeFileSync(dir + "/" + f, files[f]);
		    if (err) {
		        return console.log(err);
		    } else {
				console.log("==> " + dir + "/" + f);
			}
		}

		return null;
	}
}

function new_script(args) {
	var f = args[0];
	if (fs.existsSync("./scripts") && f.indexOf("scripts/") == -1) {
		f = "./scripts/" + f;
	}
	if (f.indexOf('.js', f.length - '.js'.length) == -1) {
		f += ".js";
	}
	console.log("==> " + f);
	fs.writeFileSync(f, script_template);
}

function run_script(args, argv) {
	var f = args[0];
	if (!fs.existsSync(f)) {
		f = "scripts/" + f;
	}
	runner(f, argv).run();
}

if (process.argv.length < 3) {
	var h = "\
Usage: duality <command> [options]\n\
\n\
   duality create <project path>     - Creates a new project structure\n\
   duality new <script>              - Creates a new script template\n\
\n\
   duality run                       - Runs all scripts\n\
   duality run <script>              - Runs a single script. Use -l <level> or -d to control logging\n\
";
	console.log(h);      
} else {
	var cmd = argv._[0];
	var r = null;
	switch (cmd) {
		case 'create':
			r = create_project(argv._.slice(1));
			break;
		case 'new':
			r = new_script(argv._.slice(1));
			break;
		case 'run':
			r = run_script(argv._.slice(1), argv);
			break;
	}
	if (r) {
		console.log(r);
		//process.exit(1);
	} else {
		//process.exit(0);
	}
}
