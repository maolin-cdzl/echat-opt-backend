var reader = require('../models/redisreader');
var JsonResponser = require('./json-responser');

var pttsvcProvider = {
	list : function(req,res,next) {
		var key = 'server-set';
        console.info('get server list: %s', key);
		reader.readSet(key,JsonResponser.create(req,res,next).arrayResponser);
	},
	userCount: function(req,res,next) {
		var key = 'server:' + req.params.server + ':user';
		readis.readSetSize(key,JsonResponser.create(req,res,next).integerResponser);
	},
	users: function(req,res.next) {
		var key = 'server:' + req.params.server + ':user';
		readis.readSet(key,JsonResponser.create(req,res,next).arrayResponser);
	}
};

module.exports = pttsvcProvider;
