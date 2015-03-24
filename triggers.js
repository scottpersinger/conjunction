function once(callback) {
	callback();
}

function timer(options) {
	var interval = options.interval || 60;
	function run(callback) {
		setTimeout(callback, interval*1000);
	}
	return run;
}

module.exports = {
	once: once,
	timer: timer
}
