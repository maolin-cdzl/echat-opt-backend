var hbase = require('hbase')
var redisReader = require('./redisreader')
var HRowDecoder = require('./hbaseutil').HRowDecoder;
var HKeyGenerator = require('./hbaseutil').HKeyGenerator;

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
			this.scaner = tableUserAction.scan(scanOpt,onCells.bind(this));
		}.bind(ctx);

		redisReader.readKeyValue('db:user:' + options.uid + ':company',ctx._scan);
	},
}

module.exports = reader;
