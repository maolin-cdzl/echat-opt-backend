var reader = require('../models/redisreader');
var JsonResponser = require('./json-responser');

var getuser = {
	state : function(req,res,next) {
		var key = 'user:' + req.params.uid + ':state';
        console.info('get state : %s', key);
		reader.readKeyValue(key,JsonResponser.create(req,res,next).stringResponser);
	},
	entity: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':entity';
		reader.readKeyValue(key,JsonResponser.create(req,res,next).stringResponser);
	},
	group: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':group';
		reader.readKeyValue(key,JsonResponser.create(req,res,next).stringResponser);
	},
	listenGroup: function(req,res,next) {
		var key = 'user:' + req.params.uid + ':listen-groups';
		reader.readSet(key,JsonResponser.create(req,res,next).arrayResponser);
	},
	lastLogin: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':last-login';
		reader.readKeyValue(key,JsonResponser.create(req,res,next).stringResponser);
	},
	lastLogout: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':last-logout';
		reader.readKeyValue(key,JsonResponser.create(req,res,next).stringResponser);
	},
	brokenHistory: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':brokens';
		reader.readList(key,JsonResponser.create(req,res,next).arrayResponser);
	},
	sessionHistory: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':sessions';
		reader.readList(key,JsonResponser.create(req,res,next).arrayResponser);
	},
	entitySet: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':entity-set';
		reader.readSet(key,JsonResponser.create(req,res,next).arrayResponser);
	},
	deviceSet: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':dev-set';
		reader.readSet(key,JsonResponser.create(req,res,next).arrayResponser);
	},
	groupSet: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':group-set';
		reader.readSet(key,JsonResponser.create(req,res,next).arrayResponser);
	}
};

module.exports = getuser;
