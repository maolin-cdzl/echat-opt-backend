var restify = require('restify');

var server = restify.createServer({
  name: 'echt-backend',
  version: '1.0.0'
});

var getUser = require('./controllers/getuser');

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/echo/:name', function (req, res, next) {
  res.send(req.params);
  return next();
});


server.get('/rt/user/:uid/state',getUser.state);
server.get('/rt/user/:uid/entity',getUser.entity);
server.get('/rt/user/:uid/group',getUser.group);
server.get('/rt/user/:uid/listengroup',getUser.listenGroup);
server.get('/rt/user/:uid/login/last',getUser.lastLogin);
server.get('/rt/user/:uid/login/all',getUser.loginHistory);
server.get('/rt/user/:uid/logout/last',getUser.lastLogout);
server.get('/rt/user/:uid/logout/all',getUser.logoutHistory);
server.get('/rt/user/:uid/broken/all',getUser.brokenHistory);
server.get('/rt/user/:uid/session/all',getUser.sessionHistory);
server.get('/rt/user/:uid/entityset',getUser.entitySet);
server.get('/rt/user/:uid/groupset',getUser.groupSet);
server.get('/rt/user/:uid/deviceset',getUser.deviceSet);

server.listen(3000, function () {
  console.log('%s listening at %s', server.name, server.url);
});
