var pool = require('../models/redispool');

var CallbackContainer = {
	create: function(data,cb) {
		var container = { };
		container._callback = cb;
		container._data = data;
		container.callback = function(err,val) {
			this._callback(this._data,err,val);
		}.bind(container);
		return container;
	}
}	

var redisReader = {
	readKeyValue: pool.pooled( function(client,key,callback) {
		client.get(key,callback);
	}),

	readSet: pool.pooled( function(client,key,callback) {
		client.smembers(key,callback);
	}),

	readSetSize: pool.pooled( function(client,key,callback) {
		client.scard(key,callback);
	}),
	
	// first read names from set,and read item count of sets with name 'prefix' + name + 'suffix'.
	// return arrays with item { name: 'aaa', count: x }
	// callback prototype: function(err,vals),which vals is arrays
	readSetSetCount: pool.pooled( function(client,key,prefix,suffix,callback) {
		client.smembers(key,function(err,values){
			if( !err && values && values.length > 0 ) {
				var results = [values.length];
				for(var i=0; i < values.length; i++) {
					results[i] = { name: values[i], count: null };
					var c = CallbackContainer.create(i,function(idx,err,val){
						if( !err && val ) {
							results[idx].count = val;
						} else {
							results[idx].count = 0;
						}
						if( idx == results.length - 1 ) {
							callback(null,results);
						}
					});
					
					client.scard(prefix + values[i] + suffix,c.callback);
				};
				return;
			} else {
				callback(err,null);
			}
		});
	}),

	readSetSize: pool.pooled( function(client,key,callback) {
		client.scard(key,callback);
	}),

	readList: pool.pooled( function( client,key,callback) {
		client.lrange(key,0,-1,callback);
	}),

	readListLast: pool.pooled( function(client,key,callback) {
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
