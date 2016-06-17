var dateformat = require('dateformat');
var hbase = require('hbase-rpc-client');
var redisReader = require('./redisreader');
var HRowDecoder = require('./hbaseutil').HRowDecoder;
var HKeyGenerator = require('./hbaseutil').HKeyGenerator;

var hclient = hbase({ 
	zookeeperHosts: ["base001.hdp.echat.com","base003.hdp.echat.com","base002.hdp.echat.com"],
    zookeeperRoot: "/hbase-unsecure",
    zookeeperReconnectTimeout: 20000,
    rootRegionZKPath: "/meta-region-server",
    rpcTimeout: 30000,
    callTimeout: 5000,
    tcpNoDelay: false,
    tcpKeepAlive: true
});

hclient.on('error',function(err){
	console.log('hbase client error:',err);
});


/*
var tableUserAction = hclient.table('user_action');
var tableUserSession = hclient.table('user_session');
var tableBrokenHistory = hclient.table('broken_history');
var tableGroupEvent = hclient.table('group_event');
var tableTempGroupEvent = hclient.table('temp_group_event');
var tableGroupSpeaking = hclient.table('group_speaking');
var tableTempGroupSpeaking = hclient.table('temp_group_speaking');
var tableServerUserLoad = hclient.table('server_user_load');
var tableServerSpeakLoad = hclient.table('server_speak_load');
var tableCompanyUserLoad = hclient.table('company_user_load');
var tableCompanySpeakLoad = hclient.table('company_speak_load');
*/

var kgUserAction = HKeyGenerator.create([
		HKeyGenerator.FieldEnum.STRING_HASH,						// company
		HKeyGenerator.FieldEnum.STRING_HASH,						// uid
		HKeyGenerator.FieldEnum.DATETIME_TIMESTAMP,				// ts
		HKeyGenerator.FieldEnum.STRING_HASH						// event
]);
var kgUserSession = HKeyGenerator.create([
		HKeyGenerator.FieldEnum.STRING_HASH,						// company
		HKeyGenerator.FieldEnum.DATETIME_TIMESTAMP,				// login
		HKeyGenerator.FieldEnum.DATETIME_TIMESTAMP,				// logout
		HKeyGenerator.FieldEnum.STRING_HASH						// uid
]);

// broken list has not implements in storm yet. 
//var kgBrokenHistory = HKeyGenerator.create([
//]);

var kgGroupEvent = HKeyGenerator.create([
		HKeyGenerator.FieldEnum.STRING_HASH,						// company
		HKeyGenerator.FieldEnum.STRING_HASH,						// gid
		HKeyGenerator.FieldEnum.DATETIME_TIMESTAMP,				// ts
		HKeyGenerator.FieldEnum.STRING_HASH						// event
]);
var kgTempGroupEvent = HKeyGenerator.create([
		HKeyGenerator.FieldEnum.STRING_HASH,						// company
		HKeyGenerator.FieldEnum.DATETIME_TIMESTAMP,				// ts
		HKeyGenerator.FieldEnum.STRING_HASH,						// server
		HKeyGenerator.FieldEnum.STRING_HASH,						// gid
		HKeyGenerator.FieldEnum.STRING_HASH						// event
]);
var kgGroupSpeaking = HKeyGenerator.create([
		HKeyGenerator.FieldEnum.STRING_HASH,						// company
		HKeyGenerator.FieldEnum.STRING_HASH,						// gid
		HKeyGenerator.FieldEnum.DATETIME_TIMESTAMP,				// start
		HKeyGenerator.FieldEnum.DATETIME_TIMESTAMP,				// end
		HKeyGenerator.FieldEnum.STRING_HASH						// uid
]);
var kgTempGroupSpeaking = HKeyGenerator.create([
		HKeyGenerator.FieldEnum.STRING_HASH,						// company
		HKeyGenerator.FieldEnum.DATETIME_TIMESTAMP,				// start
		HKeyGenerator.FieldEnum.DATETIME_TIMESTAMP,				// end
		HKeyGenerator.FieldEnum.STRING_HASH,						// uid
		HKeyGenerator.FieldEnum.STRING_HASH						// gid
]);

var kgLoadReport = HKeyGenerator.create([
		HKeyGenerator.FieldEnum.STRING_HASH,						// server or company
		HKeyGenerator.FieldEnum.DATETIME_TIMESTAMP,				// ts
]);


var reader = {
	userAction: function(options,callback) {
		if( options.uid == null || options.start == null || callback == null ) {
			callback('bad options',null);
			return;
		}
		
		redisReader.readKeyValue('db:user:' + options.uid + ':company',function(err,company) {
			if( err || company == null ) {
				callback('company not found',null);
				return;
			}
			console.info('scan: company=%s uid=%s start=%s',company,options.uid,options.start);

			var startRow = kgUserAction.generate(company,options.uid,options.start);
			var endRow = kgUserAction.generate(company,options.uid,options.end || HKeyGenerator.ValueEnum.MAX);
			var decoder = HRowDecoder.create();
			var scanner = hclient.getScanner('user_action',startRow,endRow);
			scanner.each(function(err,row){
				if( row ) {
					decoder.merge(row);
				} else if( err ) {
					console.error('scanner error: ',err);
					callback(err);
				}
			},function(){
				callback(null,decoder.getObjs());
			});

		});

	},
	userSessionByUid: function(options,callback) {
		if( options.uid == null || options.start == null ) {
			callback('bad options',null);
			return;
		}
		redisReader.readKeyValue('db:user:' + options.uid + ':company',function(err,company) {
			if( err || company == null ) {
				callback('company not found',null);
				return;
			}
			options.company = company;
			reader.userSessionByCompany(options,callback);
		});
	},
	userSessionByCompany: function(options,callback) {
		if( options.company == null || options.start == null ) {
			callback('bad options',null);
			return;
		}
		var startRow = kgUserSession.generate(options.company,options.start);
		var endRow = kgUserSession.generate(options.company,options.end || HKeyGenerator.ValueEnum.MAX);
		var scanner = hclient.getScanner('user_session',startRow,endRow);
		if( options.uid ) {
			var fl = new hbase.FilterList();
			fl.addFilter({ singleColumnValueFilter: {
				columnFamily: "l",
				columnQualifier: "uid",
				compareOp: "EQUAL",
				comparator: {
					stringComparattor: {
						str: options.uid
					}
				},
				filterIfMissing: true,
				latestVersionOnly: true
			}});
			scanner.setFilter(fl);
		}
		var decoder = HRowDecoder.create();
		scanner.each(function(err,row){
			if( row ) {
				decoder.merge(row);
			} else if( err ) {
				console.error('scanner error: ',err);
				callback(err);
			}
		},function(){
			callback(null,decoder.getObjs());
		});
	},
	serverUserLoad: function(options,callback) {
		options.table = 'server_user_load';
		options.entity = options.server;
		reader.loadReport(options,callback);
	},
	serverSpeakLoad: function(options,callback) {
		options.table = 'server_speak_load';
		options.entity = options.server;
		reader.loadReport(options,callback);
	},
	companyUserLoad: function(options,callback) {
		options.table = 'company_user_load';
		options.entity = options.company;
		reader.loadReport(options,callback);
	},
	companySpeakLoad: function(options,callback) {
		options.table = 'company_speak_load';
		options.entity = options.company;
		reader.loadReport(options,callback);
	},

	
	loadReport: function(options,callback) {
		if( options.entity == null || options.table == null || options.start == null ) {
			callback('bad options',null);
			return;
		}
		var startRow = kgLoadReport.generate(options.entity,options.start);
		var endRow = kgLoadReport.generate(options.entity,options.end || HKeyGenerator.ValueEnum.MAX);
		var scanner = hclient.getScanner(options.table,startRow,endRow);
		var decoder = HRowDecoder.create({
			include_key: true,
			keyname: 'time',
			keytrans: function(keybuf) {
				var hi = keybuf.readUInt32BE(4);
				var low = keybuf.readUInt32BE(8);
				var ts = hi * 0x100000000 + low;
				return dateformat(new Date(ts),"yyyy-mm-dd HH:MM:ss");
			},
			'l:report' : function(val) {
				return JSON.parse(val.toString());
			}
		});
		scanner.each(function(err,row){
			if( row ) {
				decoder.merge(row);
			} else if( err ) {
				console.error('scanner error: ',err);
				callback(err);
			}
		},function(){
			callback(null,decoder.getObjs());
		});
	},
}

module.exports = reader;
