
var JsonResponser = {
	create : function(req,res,next) {
		var responser = {};
		responser.req = req;
		responser.res = res;
		responser.next = next;
		responser.integerResponser = function(err,value) {
			if( !err ) {
				if( !value ) {
					res.status(404);
					res.end();
				} else {
					console.info('get value %d',value);
					res.json(JSON.stringify(value));
				}
			} else {
				res.status(500);
				res.end(err.message);
			}
			next();
		};
		responser.stringResponser = function(err,value) {
			if( !err ) {
				if( !value ) {
					res.status(404);
					res.end();
				} else {
					console.info('get value %s',value);
					res.json(value);
				}
			} else {
				res.status(500);
				res.end(err.message);
			}
			next();
		};
		responser.jsonStringResponser = function(err,value) {
			if( !err ) {
				if( !value ) {
					res.status(404);
					res.end();
				} else {
					var obj = JSON.parse(value);
					res.json(obj);
				}
			} else {
				res.status(500);
				res.end(err.message);
			}
			next();
		};

		responser.arrayResponser = function(err,values) {
			if( !err ) {
				if( !values || values.length == 0) {
					res.status(404);
					res.end();
				} else {
					var set = []
					values.forEach(function(v,i) {
						set.push(v);
					});
					res.json(set);
				}
			} else {
				res.status(500);
				res.end(err.message);
			}
			next();
		};

		return responser;
	}
};

module.exports = JsonResponser;


