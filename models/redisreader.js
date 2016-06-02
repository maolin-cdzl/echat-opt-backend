var pool = require('../models/redispool');


var redisReader = {
	readKeyValue: pool.pooled( function(client,key,callback) {
		client.get(key,callback);
	}),

	readSet: pool.pooled( function(client,key,callback) {
		client.smembers(key,callback);
	}),

	readList: pool.pooled( function( client,key,callback) {
		client.lrange(key,0,-1,callback);
	}),

	readListLast: pool.pooled( function(key,callback) {
		client.lrange(key,0,0,function(err,values) {
			if( err ) {
				callback(err,null);
			} else if( values != null && values.length > 0 ) {
				callback(null,values[0]);
			} else {
				callback(null,null);
			}
		});
	})
};


module.exports = redisReader;
