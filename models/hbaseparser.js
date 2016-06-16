
var UserActionTable = {
	createFromCell: function(cell) {
		var fc = cell.column.toString().split(':');
		if( fc.length != 2 ) {
			console.log('bad column: %s',cell.column.toString());
			return {};
		}

		var c = {
			key : cell.key.toString('hex'),
			family : fc[0],
			column : fc[1],
			value : cell.$.toString()
		};
		return c;
	}
}


module.exports = { UserAction: UserActionTable };

