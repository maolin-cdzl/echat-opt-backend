var redis = require('../models/redisreader');
var hbase = require('../models/hbasereader');
var JsonResponser = require('./json-responser');

var companyProvider = {
	agent: function(req,res,next) {
		var key = 'db:company:' + req.params.company + ':agent';
		redis.readKeyValue(key,JsonResponser.create(req,res,next).stringResponser);
	},
	subs: function(req,res,next) {
		var key = 'db:company:' + req.params.company + ':subs';
		redis.readSet(key,JsonResponser.create(req,res,next).arrayResponser);
	},
	count: function(req,res,next) {
		var key = 'db:company';
		redis.readSetSize(key,JsonResponser.create(req,res,next).integerResponser);
	},
	list: function(req,res,next) {
		var key = 'db:company';
		redis.readSet(key,JsonResponser.create(req,res,next).arrayResponser);
	},
	userCount: function(req,res,next) {
		var key = 'company:' + req.params.company + ':user';
		redis.readSetSize(key,JsonResponser.create(req,res,next).integerResponser);
	},
	users: function(req,res,next) {
		var key = 'company:' + req.params.company + ':user';
		redis.readSet(key,JsonResponser.create(req,res,next).arrayResponser);
	},
	groupCount: function(req,res,next) {
		var key = 'company:' + req.params.company + ':group';
		redis.readSetSize(key,JsonResponser.create(req,res,next).integerResponser);
	},
	groups: function(req,res,next) {
		var key = 'company:' + req.params.company + ':group';
		redis.readSet(key,JsonResponser.create(req,res,next).arrayResponser);
	},
	tempgroupCount: function(req,res,next) {
		var key = 'company:' + req.params.company + ':tgroup';
		redis.readSetSize(key,JsonResponser.create(req,res,next).integerResponser);
	},
	tempgroups: function(req,res,next) {
		var key = 'company:' + req.params.company + ':tgroup';
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
		var opt = { company: req.params.company, start: query.start };
		if( query.end ) {
			opt.end = query.end;
		}
		hbase.companyUserLoad(opt,JsonResponser.create(req,res,next).arrayResponser);
	},
	speakLoad: function(req,res,next) {
		var query = require('url').parse(req.url,true).query;

		if( ! query.start ) {
			console.info('required start');
			res.status(400);
			res.end();
			return;
		}
		var opt = { company: req.params.company, start: query.start };
		if( query.end ) {
			opt.end = query.end;
		}
		hbase.companySpeakLoad(opt,JsonResponser.create(req,res,next).arrayResponser);
	},
	sessions: function(req,res,next) {
		var query = require('url').parse(req.url,true).query;

		if( ! query.start ) {
			console.info('required start');
			res.status(400);
			res.end();
			return;
		}
		var opt = { company: req.params.company, start: query.start };
		if( query.end ) {
			opt.end = query.end;
		}
		hbase.userSessionByCompany(opt,JsonResponser.create(req,res,next).arrayResponser);
	},
};

module.exports = companyProvider;
