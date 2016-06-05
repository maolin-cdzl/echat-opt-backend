var reader = require('../models/redisreader');
var JsonResponser = require('./json-responser');

var pttsvcProvider = {
	list : function(req,res,next) {
		var key = 'entity:set';
        console.info('get server list: %s', key);
		reader.readSet(key,JsonResponser.create(req,res,next).arrayResponser);
	},
};

module.exports = pttsvcProvider;
