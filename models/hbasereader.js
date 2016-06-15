var hbase = require('hbase')
var redisReader = require('./redisreader')

var client = hbase({ protocol: 'http', host: 'localhost', port: 8080});
var tableUserAction = client.table('user_action');
var tableUserSession = client.table('user_session');
var tableBrokenHistory = client.table('broken_history');
var tableGroupEvent = client.table('group_event');
var tableTempGroupEvent = client.table('temp_group_event');
var tableGroupSpeaking = client.table('group_speaking');
var tableTempGroupSpeaking = client.table('temp_group_speaking');
var tableServerUserLoad = client.table('server_user_load');
var tableServerSpeakLoad = client.table('server_speak_load');
var tableCompanyUserLoad = client.table('company_user_load');
var tableCompanySpeakLoad = client.table('company_speak_load');


function stringHashCode(str) {
	var hash = 5381;
	for(var i=0; i < str.length; i++) {
		hash = hash * 33 + str[i];
	}
	return hash;
}

function userActionKey(company,uid,datetime,ev) {
	var keybuf = new ArrayBuffer(20);
	var keyview = new DataView(keybuf);
	keyview.setInt32(0,stringHashCode(company));
	keyview.setInt32(4,stringHashCode(uid));
	if( datetime ) {
		var ts = Date.parse(datetime);
		if( ts == null ) {
			return null;
		}
		keyview.setInt64(8,ts);
	}
	if( ev ) {
		keyview.setInt32(16,stringHashCode(ev));
	}
	return keybuf;
}

var reader = {
	userAction: function(options,callback) {
		if( options.uid == null || options.start == null || callback == null ) {
			callback('bad options',null);
			return;
		}

		var ctx = {}
		ctx.options = options;
		ctx.callback = callback;
		ctx._onRows = function(err,rows) {
			if( rows ) {
				console.info('getRows: %d',rows.length);
				console.info(rows);
			}
			this.callback(err,rows);
		}.bind(ctx);
		ctx._scan = function(err,company) {
			if( err || company == null ) {
				this.callback('company not found',null);
			}
			console.info('company: %s',company);

			var scanOpt = {};
			scanOpt.startRow = userActionKey(company,this.options.uid,this.options.start,null);
			if( this.options.end ) {
				scanOpt.endRow = userActionKey(company,this.options.uid,this.options.end,null);
			}
			var scaner = tableUserAction.scan(scanOpt,this._onRows);
		}.bind(ctx);

		redisReader.readKeyValue('db:user:' + options.uid + ':company',ctx._scan);
	},
}

module.exports = reader;
