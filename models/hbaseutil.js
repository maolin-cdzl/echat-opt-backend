
function rawrowToRow(rawrow) {
	var row = { key: rawrow.row.toString('hex') };
	var rowcols = {};
	for(var col in rawrow.cols) {
		var cell = rawrow.cols[col];
		rowcols[ col ] = cell.value.toString();
	}
	row.cols = rowcols;
	return row;
}

var rowDecoder = {
	create: function() {
		var decoder = {};
		var _rows = [];

		decoder.merge = function(rawrow) {
			_rows.push( rawrowToRow(rawrow) );
		};
		decoder.getRows = function() {
			return _rows;
		};
		return decoder;
	}
};

function stringHashCode(str){
    var hash = 5381;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash << 5) + hash) + char; /* hash * 33 + c */
		hash = hash & hash; // limit to 32bit
    }
    return hash;
}


function int64hi(hi) {
	hi = Math.abs(hi);
	hi = hi / 0x100000000;
	hi = hi | 0;
	return hi;
}

function int64lo(num) {
	return (num & 0xFFFFFFFF);
}


function stringToBuffer(str) {
	var hash = stringHashCode(str);
	var buf = new Buffer(4);
	buf.writeInt32BE(hash,0);
	return buf;
}

function datetimeToBuffer(datetime) {
	var ts = Date.parse(datetime);

	var buf = new Buffer(8);
	buf.writeUInt32BE(int64hi(ts),0);
	buf.writeUInt32BE(int64lo(ts),4);
	return buf;
}

function maxBuffer(len) {
	var buf = new Buffer(len);
	for(var i=0; i < len; i++){
		buf[i] = 0xFF;
	}
	return buf;
}

function minBuffer(len) {
	var buf = new Buffer(len);
	for(var i=0; i < len; i++){
		buf[i] = 0;
	}
	return buf;
}

var keyGenerator = {
	FieldEnum : {
		STRING_HASH : 0,
		DATETIME_TIMESTAMP : 1
	},
	ValueEnum : {
		MIN : 0,
		MAX : 1
	},
	create: function(fields) {
		var gen = {};
		gen._fields = fields;

		gen.generate = function() {
			if( arguments.length > this._fields.length ) {
				throw new RangeError('too many arguments');
			}
			var ba = [];
			for(var i=0; i < arguments.length; i++) {
				if( this._fields[i] === keyGenerator.FieldEnum.STRING_HASH ) {
					if( typeof(arguments[i]) === 'string' ) {
						var buf = stringToBuffer(arguments[i]);
						ba.push(buf);
					} else if( arguments[i] === keyGenerator.ValueEnum.MIN ) {
						ba.push(minBuffer(4));
					} else if( arguments[i] === keyGenerator.ValueEnum.MAX ) {
						ba.push(maxBuffer(4));
					} else {
						throw new TypeError('Unknown value type: ' + typeof(arguments[i]));
					}
				} else if( this._fields[i] === keyGenerator.FieldEnum.DATETIME_TIMESTAMP ) {
					if( typeof(arguments[i]) === 'string' ) {
						var buf = datetimeToBuffer(arguments[i]);
						ba.push(buf);
					} else if( arguments[i] === keyGenerator.ValueEnum.MIN ) {
						ba.push(minBuffer(8));
					} else if( arguments[i] === keyGenerator.ValueEnum.MAX ) {
						ba.push(maxBuffer(8));
					} else {
						throw new TypeError('Unknown value type: ' + typeof(arguments[i]));
					}
				} else {
					throw new TypeError('Unknown field type: ' + this._fields[i].toString());
				}
			}
			if( ba.length > 0 ) {
				return Buffer.concat(ba);
			}
		}.bind(gen);

		return gen;
	}
};


module.exports = {
	HRowDecoder : rowDecoder,
	HKeyGenerator : keyGenerator
};

