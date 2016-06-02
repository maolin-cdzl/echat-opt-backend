
var redisConf = {
	port: 6379,
	//host: "192.168.1.181",
	host: "127.0.0.1",
	retry_strategy: function (options) {
		if (options.error.code === 'ECONNREFUSED') {
			console.error('The server refused the connection');  
			return new Error('The server refused the connection');
		}
		if (options.total_retry_time > 1000 * 60 * 60) {
			// End reconnecting after a specific timeout and flush all commands with a individual error
			return new Error('Retry time exhausted');
		}
		if (options.times_connected > 10) {
			// End reconnecting with built in error
			return undefined;
		}
		// reconnect after
		return Math.max(options.attempt * 100, 3000);
	}
};

module.exports = redisConf;
