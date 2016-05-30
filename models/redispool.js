var Pool = require('generic-pool').Pool;
var redis = require("redis");


var pool = new Pool({
	name: 'redis',
	create: function(callback) {
		var opt = {
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
		var client = redis.createClient(opt);

		client.on('error', function (err) {  
            console.error('error at connect redis: %s', err.stack);  
        }); 
		callback(null,client);
	},
	destroy: function(client) {
		client.quit();
	},
	validateAsync: function(client,callback) {
	},
	max: 10,
	min: 1,
	idleTimeoutMillis: 30000,
	log: false
});

process.on('exit',function(){
	pool.drain(function() {
		pool.destroyAllNow();
	});
})

module.exports = pool;
