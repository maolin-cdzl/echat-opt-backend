var restify = require('restify');

var webserver = restify.createServer({
  name: 'echt-backend',
  version: '1.0.0'
});

webserver.use(restify.CORS({
	// Defaults to ['*'].
	origins: ['*'], 
	// Defaults to false.
	credentials: false,
		// Sets expose-headers.
	headers: ['*']   
}));

var user = require('./controllers/user');
var dev = require('./controllers/dev');
var server = require('./controllers/server');
var company = require('./controllers/company.js');
var group = require('./controllers/group.js');
var agent = require('./controllers/agent.js');

webserver.acceptable.push('text/event-stream');
webserver.use(restify.acceptParser(webserver.acceptable));
webserver.use(restify.queryParser());
webserver.use(restify.bodyParser());


webserver.get('/rt/user/count',user.count);
webserver.get('/rt/user/:uid/info',user.info);
webserver.get('/rt/user/:uid/company',user.company);
webserver.get('/rt/user/:uid/state',user.state);
webserver.get('/rt/user/:uid/server',user.server);
webserver.get('/rt/user/:uid/group',user.group);
webserver.get('/rt/user/:uid/device',user.device);
webserver.get('/rt/user/:uid/lastlogin',user.lastLogin);
webserver.get('/rt/user/:uid/lastlogout',user.lastLogout);

webserver.get('/rt/user/:uid/actions',user.actions);
webserver.get('/rt/user/:uid/sessions',user.sessions);
webserver.get('/rt/user/:uid/brokens',user.brokens);

webserver.get('/rt/dev/info',dev.devSet);

webserver.get('/rt/server/list',server.list);
webserver.get('/rt/server/:server/usercount',server.userCount);
webserver.get('/rt/server/:server/users',server.users);
webserver.get('/rt/server/:server/groupcount',server.groupcount);
webserver.get('/rt/server/:server/groups',server.groups);
webserver.get('/rt/server/:server/userload',server.userLoad);
webserver.get('/rt/server/:server/speakload',server.speakLoad);

webserver.get('/rt/agent/count',agent.count);
webserver.get('/rt/agent/list',agent.list);
webserver.get('/rt/agent/:agent/company',agent.company);
webserver.get('/rt/agent/:agent/subs',agent.subs);

webserver.get('/rt/company/count',company.count);
webserver.get('/rt/company/list',company.list);
webserver.get('/rt/company/:company/agent',company.agent);
webserver.get('/rt/company/:company/subs',company.subs);
webserver.get('/rt/company/:company/usercount',company.userCount);
webserver.get('/rt/company/:company/users',company.users);
webserver.get('/rt/company/:company/groupcount',company.groupCount);
webserver.get('/rt/company/:company/groups',company.groups);
webserver.get('/rt/company/:company/tempgroupcount',company.tempgroupCount);
webserver.get('/rt/company/:company/tempgroups',company.tempgroups);
webserver.get('/rt/company/:company/userload',company.userLoad);
webserver.get('/rt/company/:company/speakload',company.speakLoad);
webserver.get('/rt/company/:company/sessions',company.sessions);

webserver.get('/rt/group/count',group.count);
webserver.get('/rt/group/list',group.list);
webserver.get('/rt/group/:group/users',group.users);
webserver.get('/rt/group/:group/server',group.server);
webserver.get('/rt/tempgroup/count',group.tg_count);
webserver.get('/rt/tempgroup/list',group.tg_list);
webserver.get('/rt/tempgroup/:group/users',group.tg_users);
webserver.get('/rt/tempgroup/:group/server',group.tg_server);


var SSE = require('./controllers/sse');
var serverSse = SSE.create('appload-*','serverload');

webserver.get('/rt/server/pub',serverSse.request);
webserver.get('/rt/server/:channel/pub',serverSse.request);

process.on('SIGINT',function(){
    console.info('SIGINT');
	process.exit(0);
});

webserver.listen(8080, function () {
  console.log('%s listening at %s', webserver.name, webserver.url);
});
