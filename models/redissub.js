var redisConf = require('./redisconf');
var redis = require('redis');

var RedisSub = {
	createSub : function(channel,callback) {
		var sub = {};
		client = redis.createClient(redisConf);
		client.on('message',callback);
		
		sub.unsub = function() {
			client.unsubscribe();
			client.quit();
		};

		client.subscribe(channel);
		return sub;
	},
	createPSub : function(channelPatten,callback) {
		var sub = {};
		client = redis.createClient(redisConf);
		client.on('pmessage',callback);
		
		sub.unsub = function() {
			client.punsubscribe(channelPatten);
			client.quit();
		};

		client.psubscribe(channelPatten);
		return sub;
	}
};

module.exports = RedisSub;
