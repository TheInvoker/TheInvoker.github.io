XLSX.utils.book_new = function() {
    return {
        SheetNames : [],
        Sheets : {}
    };
};
XLSX.utils.book_append_sheet = function(wb, ws, name) {
    wb.SheetNames.push(name);
    wb.Sheets[name] = ws;
};
XLSX.utils.s2ab = function (s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
};
XLSX.utils.aoa_to_sheet = function(data, opts, setStyle) {
    function datenum(v, date1904) {
        if(date1904) v+=1462;
        var epoch = Date.parse(v);
        return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
    }

	var ws = {};
	var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
	for(var R = 0; R != data.length; ++R) {
		for(var C = 0; C != data[R].length; ++C) {
			if(range.s.r > R) range.s.r = R;
			if(range.s.c > C) range.s.c = C;
			if(range.e.r < R) range.e.r = R;
			if(range.e.c < C) range.e.c = C;
			var cell = {v: data[R][C]};
			if(cell.v == null) continue;
			var cell_ref = XLSX.utils.encode_cell({c:C,r:R});
			
			if(typeof cell.v === 'number') cell.t = 'n';
			else if(typeof cell.v === 'boolean') cell.t = 'b';
			else if(cell.v instanceof Date) {
				cell.t = 'n'; cell.z = XLSX.SSF._table[14];
				cell.v = datenum(cell.v);
			}
			else cell.t = 's';
			
			cell.s = setStyle(R, C, opts);
			
			ws[cell_ref] = cell;
			
			//if (cell_ref == "A2") {
			//	ws[cell_ref] = {};
			//   // ws[cell_ref].t = 'n';
			//	ws[cell_ref].l = { Target: "http://sheetjs.com", Tooltip: "Find us @ SheetJS.com!" };
			//	//ws[cell_ref].f = '=HYPERLINK("http://www.google.com","Google")';
			//	//ws[cell_ref].v = '<a href="http://google.com">Google</a>';
			//	ws[cell_ref].v = 'Find us @ SheetJS.com!';
			//}
		}
	}
	if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
	return ws;
};

//# sourceURL=XLSX_polyfill.js