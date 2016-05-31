var redis = require('./redishelper');

var getuser = {
	state : function(req,res,next) {
		var key = 'user:' + req.params.uid + ':state';
        console.info('get state : %s', key);
		redis.readKeyValue(req,res,next,key);
	},
	entity: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':entity';
		redis.readKeyValue(req,res,next,key);
	},
	group: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':group';
		redis.readKeyValue(req,res,next,key);
	},
	listenGroup: function(req,res,next) {
		var key = 'user:' + req.params.uid + ':listen-groups';
		redis.readSet(req,res,next,key);
	},
	lastLogin: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':login-history';
		redis.readListLast(req,res,next,key);
	},
	lastLogout: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':logout-history';
		redis.readListLast(req,res,next,key);
	},
	loginHistory: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':login-history';
		redis.readList(req,res,next,key);
	},
	logoutHistory: function(req,res,next) {
		var key = 'user:' + req.params.uid + ':logout-history';
		redis.readList(req,res,next,key);
	},
	brokenHistory: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':broken-history';
		redis.readList(req,res,next,key);
	},
	sessionHistory: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':session-history';
		redis.readList(req,res,next,key);
	},
	entitySet: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':entity-set';
		redis.readSet(req,res,next,key);
	},
	groupSet: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':group-set';
		redis.readSet(req,res,next,key);
	},
	deviceSet: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':dev-set';
		redis.readSet(req,res,next,key);
	}
};

module.exports = getuser;
