var hbase = require('hbase')
var redisReader = require('./redisreader')
var HTableParser = require('./hbaseparser');

var client = hbase({ protocol: 'http', host: 'localhost', port: 8081 });
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


function stringHashCode(str){
    var hash = 5381;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash << 5) + hash) + char; /* hash * 33 + c */
		hash = hash & hash; // limit to 32bit
    }
    return hash;
}


function int64hi(num) {
	return (num >> 32);
}

function int64lo(num) {
	return (num & 0xFFFFFFFF);
}

function userActionKey(company,uid,datetime,ev) {
	console.log('%s %s %s',company,uid,datetime);
	var keybuf = new ArrayBuffer(20);
	var keyview = new DataView(keybuf);

	keyview.setInt32(0,stringHashCode(company));
	keyview.setInt32(4,stringHashCode(uid));
	if( datetime ) {
		var ts = Date.parse(datetime);
		if( ts == null ) {
			return null;
		}
		keyview.setInt32(8,int64hi(ts));
		keyview.setInt32(12,int64lo(ts));
	} else {
		keyview.setInt32(8,0xFFFFFFFF);
		keyview.setInt32(12,0xFFFFFFFF);
	}
	if( ev ) {
		keyview.setInt32(16,stringHashCode(ev));
	} else {
		keyview.setInt32(16,0xFFFFFFFF);
	}
	return new Uint8Array(keybuf);
}

function ua2hex(ua) {
	var hex ='';
	for(var i=0; i < ua.length; i++) {
		hex += ua[i].toString(16) + ' ';
	}
	return hex;
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
		ctx._onCells = function(err,cells) {
			if( cells ) {
				var parser = HTableParser.create();
				for(var i=0; i < cells.length; i++) {
					parser.merge(cells[i]);
				}
				var rows = parser.getRows();
				console.info('getRows: %d',rows.length);
				this.callback(err,rows);
			} else if( err ) {
				console.error(err);
				console.error(err.stack);
				this.callback(err);
			}
		}.bind(ctx);
		ctx._scan = function(err,company) {
			if( err || company == null ) {
				this.callback('company not found',null);
			}
			console.info('scan: company=%s uid=%s start=%s',company,this.options.uid,this.options.start);

			var scanOpt = {};
			scanOpt.maxVersion = 1;
			scanOpt.startRow = userActionKey(company,this.options.uid,this.options.start,null);
			if( this.options.end ) {
				scanOpt.endRow = userActionKey(company,this.options.uid,this.options.end,null);
			} else {
				scanOpt.endRow = userActionKey(company,this.options.uid);
			}
			console.info('startRow: %s', ua2hex(scanOpt.startRow));
			console.info('endRow: %s', ua2hex(scanOpt.endRow));
			this.scaner = tableUserAction.scan(scanOpt,this._onCells);
		}.bind(ctx);

		redisReader.readKeyValue('db:user:' + options.uid + ':company',ctx._scan);
	},
}

module.exports = reader;
