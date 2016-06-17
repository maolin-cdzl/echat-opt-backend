var reader = require('../models/redisreader');
var JsonResponser = require('./json-responser');

var devProvider = {
	devSet: function(req,res,next) {
		reader.readSetSetCount('dev-set','dev:',':user',function(err,devs){
			if( !err && devs && devs.length > 0 ) {
				res.json(devs);
			} else {
				res.status(404);
				res.end();
			}
			return next();
		});
	},
};

module.exports = devProvider;
