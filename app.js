var restify = require('restify');

var server = restify.createServer({
  name: 'echt-backend',
  version: '1.0.0'
});

var user = require('./controllers/user');

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


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

var SSE = require('./controllers/sse');
var loadSse = SSE.create('load-pttsvc*','load-');


server.get('/rt/entity/:entityid/load',loadSse.request);


process.on('SIGINT',function(){
    console.info('SIGINT');
	process.exit(0);
});

server.listen(3000, function () {
  console.log('%s listening at %s', server.name, server.url);
});
