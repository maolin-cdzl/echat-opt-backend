var redis = require('../models/redisreader');
var hbase = require('../models/hbasereader');
var JsonResponser = require('./json-responser');

var userProvider = {
	count: function(req,res,next) {
		var key = 'online-user';
		redis.readSetSize(key,JsonResponser.create(req,res,next).integerResponser);
	},
	info: function(req,res,next) {
		var key = 'db:user:' + req.params.uid + ':info';
		redis.readKeyValue(key,JsonResponser.create(req,res,next).jsonStringResponser);
	},
	company: function(req,res,next) {
		var key = 'db:user:' + req.params.uid + ':company';
		redis.readKeyValue(key,JsonResponser.create(req,res,next).stringResponser);
	},
	state : function(req,res,next) {
		var key = 'user:' + req.params.uid + ':state';
		redis.readKeyValue(key,JsonResponser.create(req,res,next).stringResponser);
	},
	server: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':server';
		redis.readKeyValue(key,JsonResponser.create(req,res,next).stringResponser);
	},
	group: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':group';
		redis.readKeyValue(key,JsonResponser.create(req,res,next).stringResponser);
	},
	lastLogin: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':last-login';
		redis.readKeyValue(key,JsonResponser.create(req,res,next).jsonStringResponser);
	},
	lastLogout: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':last-logout';
		redis.readKeyValue(key,JsonResponser.create(req,res,next).jsonStringResponser);
	},
	device: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':dev';
		redis.readKeyValue(key,JsonResponser.create(req,res,next).stringResponser);
	},
	actions: function(req,res,next) {
		var query = require('url').parse(req.url,true).query;

		if( ! query.start ) {
			res.status(400);
			res.end();
			return;
		}
		var opt = { uid: req.params.uid, start: query.start };
		if( query.end ) {
			opt.end = query.end;
		}
		hbase.userAction(opt,JsonResponser.create(req,res,next).arrayResponser);
	},
	sessions: function(req,res,next) { 
		var query = require('url').parse(req.url,true).query;
		if( ! query.start ) {
			res.status(400);
			res.end();
			return;
		}
		var opt = { uid: req.params.uid, start: query.start };
		if( query.end ) {
			opt.end = query.end;
		}
		hbase.userSessionByUid(opt,JsonResponser.create(req,res,next).arrayResponser);
	},
	brokens: function(req,res,next) { 
		var key = 'user:' + req.params.uid + ':brokens';
		redis.readList(key,JsonResponser.create(req,res,next).arrayResponser);
	},
};

module.exports = userProvider;
