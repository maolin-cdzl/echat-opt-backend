var redis = require('../models/redisreader');
var hbase = require('../models/hbasereader');
var JsonResponser = require('./json-responser');

var pttsvcProvider = {
	list : function(req,res,next) {
		var key = 'server-set';
        console.info('get server list: %s', key);
		redis.readSet(key,JsonResponser.create(req,res,next).arrayResponser);
	},
	userCount: function(req,res,next) {
		var key = 'server:' + req.params.server + ':user';
		redis.readSetSize(key,JsonResponser.create(req,res,next).integerResponser);
	},
	users: function(req,res,next) {
		var key = 'server:' + req.params.server + ':user';
		redis.readSet(key,JsonResponser.create(req,res,next).arrayResponser);
	},
	userLoad: function(req,res,next) {
		var query = require('url').parse(req.url,true).query;

		if( ! query.start ) {
			console.info('required start');
			res.status(400);
			res.end();
			return;
		}
		var opt = { server: req.params.server, start: query.start };
		if( query.end ) {
			opt.end = query.end;
		}
		hbase.serverUserLoad(opt,JsonResponser.create(req,res,next).arrayResponser);
	},
	speakLoad: function(req,res,next) {
		var query = require('url').parse(req.url,true).query;

		if( ! query.start ) {
			console.info('required start');
			res.status(400);
			res.end();
			return;
		}
		var opt = { server: req.params.server, start: query.start };
		if( query.end ) {
			opt.end = query.end;
		}
		hbase.serverSpeakLoad(opt,JsonResponser.create(req,res,next).arrayResponser);
	},
};

module.exports = pttsvcProvider;
