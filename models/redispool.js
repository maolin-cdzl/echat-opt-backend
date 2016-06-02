var Pool = require('generic-pool').Pool;
var redis = require('redis');
var redisConf = require('./redisconf');

var pool = new Pool({
	name: 'redis',
	create: function(callback) {
		var client = redis.createClient(redisConf);

		client.on('error', function (err) {  
            console.error('error at connect redis: %s', err.stack);  
        }); 
		callback(null,client);
	},
	destroy: function(client) {
		client.quit();
	},
	max: 10,
	min: 1,
	idleTimeoutMillis: 30000,
	log: false
});

process.on('exit',function(){
    console.info('Redis Pool exit');
	pool.drain(function() {
		pool.destroyAllNow();
	});
});

module.exports = pool;
