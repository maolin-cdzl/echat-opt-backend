var redis = require('../models/redisreader');
var hbase = require('../models/hbasereader');
var JsonResponser = require('./json-responser');

var agentProvider = {
	count: function(req,res,next) {
		var key = 'db:agent';
		redis.readSetSize(key,JsonResponser.create(req,res,next).integerResponser);
	},
	list: function(req,res,next) {
		var key = 'db:agent';
		redis.readSet(key,JsonResponser.create(req,res,next).arrayResponser);
	},
	company: function(req,res,next) {
		var key = 'db:agent:' + req.params.agent + ':company';
		redis.readSet(key,JsonResponser.create(req,res,next).arrayResponser);
	},
	subs: function(req,res,next) {
		var key = 'db:agent:' + req.params.agent + ':subs';
		redis.readSet(key,JsonResponser.create(req,res,next).arrayResponser);
	},
};

module.exports = agentProvider;
