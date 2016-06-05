var restify = require('restify');

var server = restify.createServer({
  name: 'echt-backend',
  version: '1.0.0'
});

server.use(restify.CORS({
	// Defaults to ['*'].
	origins: ['*'], 
	// Defaults to false.
	credentials: false,
		// Sets expose-headers.
	headers: ['*']   
}));

var user = require('./controllers/user');
var dev = require('./controllers/dev');
var pttsvc = require('./controllers/pttsvc');

server.acceptable.push('text/event-stream');
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


server.get('/rt/user/count',user.count);
server.get('/rt/user/:uid/state',user.state);
server.get('/rt/user/:uid/entity',user.entity);
server.get('/rt/user/:uid/group',user.group);
server.get('/rt/user/:uid/listengroup',user.listenGroup);
server.get('/rt/user/:uid/lastlogin',user.lastLogin);
server.get('/rt/user/:uid/lastlogout',user.lastLogout);
server.get('/rt/user/:uid/brokens',user.brokenHistory);
server.get('/rt/user/:uid/sessions',user.sessionHistory);
server.get('/rt/user/:uid/entityset',user.entitySet);
server.get('/rt/user/:uid/groupset',user.groupSet);
server.get('/rt/user/:uid/deviceset',user.deviceSet);

server.get('/rt/dev/info',dev.devSet);

server.get('/rt/server/list',pttsvc.list);

var SSE = require('./controllers/sse');
var serverSse = SSE.create('pttsvc*','server');

server.get('/rt/server/pub',serverSse.request);
server.get('/rt/server/:channel/pub',serverSse.request);


process.on('SIGINT',function(){
    console.info('SIGINT');
	process.exit(0);
});

server.listen(3000, function () {
  console.log('%s listening at %s', server.name, server.url);
});
