var pool = require('../models/redispool');

function readKeyValue(req,res,next,key) {
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
}

function readSet(req,res,next,key) {
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
}

function readList(req,res,next,key) {
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
}

function readListLast(req,res,next,key) {
	pool.acquire(function(err,client) {
		if( err ) {
			res.status(503);
			res.end();
			return next();
		} else {
			client.lrange(key,0,0,function(err,values) {
				if( !err ) {
					if( !values || values.length == 0 ) {
						res.json(values[0]);
					} else {
						res.status(404);
						res.end();
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

var getuser = {
	state : function(req,res,next) {
		var key = 'user:' + req.params.uid + ':state';
        console.info('get state : %s', key);
		readKeyValue(req,res,next,key);
	},
	entity: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':entity';
		readKeyValue(req,res,next,key);
	},
	group: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':group';
		readKeyValue(req,res,next,key);
	},
	listenGroup: function(req,res,next) {
		var key = 'user:' + req.params.uid + ':listen-groups';
		readSet(req,res,next,key);
	},
	lastLogin: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':login-history';
		readListLast(req,res,next,key);
	},
	lastLogout: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':logout-history';
		readListLast(req,res,next,key);
	},
	loginHistory: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':login-history';
		readList(req,res,next,key);
	},
	logoutHistory: function(req,res,next) {
		var key = 'user:' + req.params.uid + ':logout-history';
		readList(req,res,next,key);
	},
	brokenHistory: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':broken-history';
		readList(req,res,next,key);
	},
	sessionHistory: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':session-history';
		readList(req,res,next,key);
	},
	entitySet: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':entityset';
		readSet(req,res,next,key);
	},
	groupSet: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':groupset';
		readSet(req,res,next,key);
	},
	deviceSet: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':deviceset';
		readSet(req,res,next,key);
	}
};

module.exports = getuser;
