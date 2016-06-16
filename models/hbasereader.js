var hbase = require('hbase-rpc-client')
var redisReader = require('./redisreader')
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
var kgServerUserLoad = HKeyGenerator.create([
		HKeyGenerator.FieldEnum.STRING_HASH,						// server
		HKeyGenerator.FieldEnum.DATETIME_TIMESTAMP,				// ts
]);
var kgServerSpeakLoad = HKeyGenerator.create([
		HKeyGenerator.FieldEnum.STRING_HASH,						// server
		HKeyGenerator.FieldEnum.DATETIME_TIMESTAMP,				// ts
]);
var kgCompanyUserLoad = HKeyGenerator.create([
		HKeyGenerator.FieldEnum.STRING_HASH,						// company
		HKeyGenerator.FieldEnum.DATETIME_TIMESTAMP,				// ts
]);
var kgCompanySpeakLoad = HKeyGenerator.create([
		HKeyGenerator.FieldEnum.STRING_HASH,						// company
		HKeyGenerator.FieldEnum.DATETIME_TIMESTAMP,				// ts
]);


function onCells(err,cells) {
	if( cells ) {
		var decoder = HRowDecoder.create();
		for(var i=0; i < cells.length; i++) {
			decoder.merge(cells[i]);
		}
		var rows = decoder.getRows();
		console.info('getRows: %d',rows.length);
		this.callback(err,rows);
	} else if( err ) {
		console.error(err);
		console.error(err.stack);
		this.callback(err);
	}
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
		ctx._scan = function(err,company) {
			if( err || company == null ) {
				this.callback('company not found',null);
			}
			console.info('scan: company=%s uid=%s start=%s',company,this.options.uid,this.options.start);

			var scanOpt = {};
			scanOpt.maxVersion = 1;
			scanOpt.startRow = kgUserAction.generate(company,this.options.uid,this.options.start);
			scanOpt.endRow = kgUserAction.generate(company,this.options.uid,this.options.end | HKeyGenerator.ValueEnum.MAX);
			var scanner = hclient.getScanner('user_action',scanOpt.startRow,scanOpt.endRow);
			scanner.each(function(err,row){
				if( row ) {
					console.log(row);
				} else if( err ) {
					console.error('scanner error: ',err);
				}
			});

		}.bind(ctx);

		redisReader.readKeyValue('db:user:' + options.uid + ':company',ctx._scan);
	},
}

module.exports = reader;
