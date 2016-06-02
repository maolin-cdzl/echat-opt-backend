var RedisSub = require('../models/redissub');

function requestProc(req,res,next) {
	var channel;
	if( req.params.entityid == undefined ) {
		channel = '*';
	} else {
		channel = this.prefix + req.params.entityid;
	}
	this.register(channel,req,res);

	console.info('register client for %s',channel);
	res.writeHead(200, {
    	'Content-Type': 'text/event-stream',  // <- Important headers
    	'Cache-Control': 'no-cache',
    	'Connection': 'keep-alive'
    });
    res.write('\n');
}

function onMessage(pattern,channel,message) {
	console.info('PMESSAGE %s %s %s',pattern,channel,message);

	var chunk = message + '\n\n';

	var l = this.clients.length;
	for(var i =0; i < l; i++) {
		var client = this.clients[i];
		console.info('check client with %s',client.channel);
		if( client.channel == '*' || client.channel == channel ) {
			console.info('send message');
			client.res.write(chunk);
		}
	}
}

function unregisterClient(client) {
	console.info('try to unregister client: %s', client.channel);
	var idx;
	for(idx=0; idx < this.clients.length; idx++) {
		if( this.clients[idx] === client ) {
			break;
		}
	}
	if( idx >= this.clients.length ) {
		console.info('not found');
		return;
	}
	console.info('unregisted');
	this.clients.splice(idx,1);
}

function registerClient(channel,req,res) {
	var client = {};
	client.channel = channel;
	client.req = req;
	client.res = res;
	req.socket.on('close',unregisterClient.bind(this,client));

	this.clients.push(client);

}

function closeSse() {
	console.info('closeSse');
	this.sub.unsub();
}


var SSE = {
	create : function(pattern,prefix) {
		var sse = {};
		sse.prefix = prefix;
		sse.clients = [];

		sse.sub = RedisSub.createPSub(pattern,onMessage.bind(sse));
		sse.register = registerClient.bind(sse);
		sse.request = requestProc.bind(sse);

		process.on('exit',closeSse.bind(sse));
		return sse;
	},

};

module.exports = SSE;

