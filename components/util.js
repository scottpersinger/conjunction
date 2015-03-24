function debugnode() {
	function debugnode(msgs, context) {
		msgs.forEach(function(msg) {
			console.log("[debug] ", msg);
		});
	}
	return debugnode;
}

module.exports = {
	debugnode: debugnode
}
