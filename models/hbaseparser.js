
// family MUST NOT name 'key'

function dataToCell(data) {
	var fc = data.column.toString().split(':');
	if( fc.length != 2 ) {
		console.log('bad column: %s',data.column.toString());
		return null;
	}

	var c = {
		key : data.key.toString('hex'),
		family : fc[0],
		column : fc[1],
		value : data.$.toString()
	};
	return c;
}

function cellToRow(cell) {
	var row = {
		key : cell.key
	};
	var col =  {};
	col[cell.column] = cell.value;
	row[ cell.family ] = col;
	return row;
}

function mergeToRow(row,cell) {
	if( ! cell.family in row ) {
		row[cell.family] = {};
	}
	row[cell.family][cell.column] = cell.value;
}

var HTableParser = {

	create: function() {
		var parser = {};
		parser._rowMap = {};

		parser.merge = function(date) {
			var cell = dataToCell(data);
			if( cell == null )
				return;
			if( ! cell.key in this._rowMap ) {
				this._rowMap[ cell.key ] = cellToRow(cell);
			} else {
				mergeToRow( this._rowMap[cell.key],cell );
			}
		}.bind(parser);
		parser.getRows = function() {
			var rows = [];
			for(var key in this._rowMap) {
				rows.push( this._rowMap[key] );
			}
			return rows;
		}.bind(parser);

		return parser;
	}
}


module.exports = HTableParser;

