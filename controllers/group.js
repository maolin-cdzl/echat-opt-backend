var redis = require('../models/redisreader');
var hbase = require('../models/hbasereader');
var JsonResponser = require('./json-responser');

var groupProvider = {
	count: function(req,res,next) {
		var key = 'group-set';
		redis.readSetSize(key,JsonResponser.create(req,res,next).integerResponser);
	},
	tg_count: function(req,res,next) {
		var key = 'tempgroup-set';
		redis.readSetSize(key,JsonResponser.create(req,res,next).integerResponser);
	},
	list : function(req,res,next) {
		var key = 'group-set';
        console.info('get group list: %s', key);
		redis.readSet(key,JsonResponser.create(req,res,next).arrayResponser);
	},
	tg_list: function(req,res,next) {
		var key = 'tempgroup-set';
        console.info('get temp group list: %s', key);
		redis.readSet(key,JsonResponser.create(req,res,next).arrayResponser);
	},
	users: function(req,res,next) {
		var key = 'group:' + req.params.group + ':user';
		redis.readSet(key,JsonResponser.create(req,res,next).arrayResponser);
	},
	tg_users: function(req,res,next) {
		var key = 'tgroup:' + req.params.group + ':user';
		redis.readSet(key,JsonResponser.create(req,res,next).arrayResponser);
	},
	server: function(req,res,next) {
		var key = 'group:' + req.params.group + ':server';
		redis.readKeyValue(key,JsonResponser.create(req,res,next).stringResponser);
	},
	tg_server: function(req,res,next) {
		var key = 'tgroup:' + req.params.group + ':server';
		redis.readKeyValue(key,JsonResponser.create(req,res,next).stringResponser);
	},
	events: function(req,res,next) {
		var query = require('url').parse(req.url,true).query;
		if( ! query.start ) {
			console.info('required start');
			res.status(400);
			res.end();
			return;
		}
		var opt = { group: req.params.group, start: query.start };
		if( query.end ) {
			opt.end = query.end;
		}
		hbase.groupEvent(opt,JsonResponser.create(req,res,next).arrayResponser);
	},
};

module.exports = groupProvider;

