var pool = require('../models/redispool');

var redisHelper = {
	readKeyValue: function(req,res,next,key) {
		pool.acquire(function(err,client) {
			if( err ) {
				res.status(503);
				res.end();
				return next();
			} else {
				client.get(key,function(err,value) {
					if( !err ) {
						if( !value ) {
							res.status(404);
							res.end();
						} else {
							console.info('get value %s',value);
							res.json(value);
						}
					} else {
						res.status(500);
						res.end(err.message);
					}
					pool.release(client);
					return next();
				});
			}
		});
	},

	readSet: function(req,res,next,key) {
		pool.acquire(function(err,client) {
			if( err ) {
				res.status(503);
				res.end();
				return next();
			} else {
				client.smembers(key,function(err,values) {
					if( !err ) {
						if( !values || values.length == 0) {
							res.status(404);
							res.end();
						} else {
							var set = []
								values.forEach(function(v,i) {
									set.push(v);
								});
							res.json(JSON.stringify(set));
						}
					} else {
						res.status(500);
						res.end(err.message);
					}
					pool.release(client);
					return next();
				});
			}
		});
	},

	readList: function(req,res,next,key) {
		pool.acquire(function(err,client) {
			if( err ) {
				res.status(503);
				res.end();
				return next();
			} else {
				client.lrange(key,0,-1,function(err,values) {
					if( !err ) {
						if( !values || values.length == 0) {
							res.status(404);
							res.end();
						} else {
							var set = []
								values.forEach(function(v,i) {
									set.push(v);
								});
							res.json(JSON.stringify(set));
						}
					} else {
						res.status(500);
						res.end(err.message);
					}
					pool.release(client);
					return next();
				});
			}
		});
	},

	readListLast: function(req,res,next,key) {
		pool.acquire(function(err,client) {
			if( err ) {
				res.status(503);
				res.end();
				return next();
			} else {
				client.lrange(key,0,0,function(err,values) {
					if( !err ) {
						if( !values || values.length == 0 ) {
							res.status(404);
							res.end();
						} else {
							res.json(values[0]);
						}
					} else {
						res.status(500);
						res.end(err.message);
					}
					pool.release(client);
					return next();
				});
			}
		});
	}
};

module.exports = redisHelper;
