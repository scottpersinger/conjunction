function debugnode() {
	function debugnode(msgs, context) {
		msgs.forEach(function(msg) {
			console.log("[debug] ", msg);
		});
	}
	return debugnode;
}

function print(msg) {
	console.log(msg);
}

module.exports = {
	debugnode: debugnode,
	print: print
}
