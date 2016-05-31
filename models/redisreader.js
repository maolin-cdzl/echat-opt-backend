var pool = require('../models/redispool');

var redisReader = {
	readKeyValue: function(key,callback) {
		pool.acquire(function(err,client) {
			if( err ) {
				callback(err,null);
			} else {
				client.get(key,callback);
			}
		});
	},

	readSet: function(key,callback) {
		pool.acquire(function(err,client) {
			if( err ) {
				callback(err,null);
			} else {
				client.smembers(key,callback);
			}
		});
	},

	readList: function(key,callback) {
		pool.acquire(function(err,client) {
			if( err ) {
				callback(err,null);
			} else {
				client.lrange(key,0,-1,callback);
			}
		});
	},

	readListLast: function(key,callback) {
		pool.acquire(function(err,client) {
			if( err ) {
				callback(err,null);
			} else {
				client.lrange(key,0,0,function(err,values) {
					if( err ) {
						callback(err,null);
					} else if( values != null && values.length > 0 ) {
						callback(null,values[0]);
					} else {
						callback(null,null);
					}
				});
			}
		});
	}
};

module.exports = redisReader;
