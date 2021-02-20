var font1;
var font2;
var da = new Date();
var T0 = da.getTime();
var pd1 = {};
var pd2 = {};
var w = {};
var debug = false;
function sliceClosedCurves(pd) {
    var pdc = [];
    var pdci = [];
    var L = pd.length;
    for(var key in pd) {
	var item = pd[key];
	pdci.push(item);
	if(item.type == "Z" || key == L-1) {
	    pdc.push(pdci);
	    pdci = [];
	}
    };
    return pdc;
}
function loadFonts() {
    document.getElementById("anim").disabled = true;
    opentype.load('/fonts/LinLibertine_R.otf', function(err, font) {
	if(err) {
    alert('Font1 could not be loaded: ' + err);
	} else {
	    font1 = font;
	}
	for(var key in font1.glyphs.glyphs) {
	    var glyph = font1.glyphs.glyphs[key];
	    var pdc = glyph.getPath(0,120,72).commands;
	    var chr = String.fromCharCode(glyph.unicode);
	    var spdc = sliceClosedCurves(pdc);
	    pd1["uni"+glyph.unicode] = spdc;
	};
    });
    opentype.load('/fonts/LinBiolinum_R.otf', function(err, font) {
	if (err) {
	    alert('Font2 could not be loaded: ' + err);
	} else {
	    font2 = font;
	}
	for(var key in font2.glyphs.glyphs) {
	    var glyph = font2.glyphs.glyphs[key];
	    var pdc = glyph.getPath(0,120,72).commands;
	    var chr = String.fromCharCode(glyph.unicode);
	    var spdc = sliceClosedCurves(pdc);
	    pd2["uni"+glyph.unicode] = spdc;
	    var options = { decimalPlaces: 4 };
	    w["uni"+glyph.unicode] = font2.getAdvanceWidth(chr, 72, options);
	};
    });
    var intId = setInterval(function() {
	if(pd1 && pd2) {
	    document.getElementById("anim").disabled = false;
	    clearInterval(intId);
	}
    },1000);
}
function animtext() {
    var worker1 = new Worker('font-transition.js');
    worker1.addEventListener('message', function(e) {
	setAnimation(e.data.xyt,e.data.chr);
    }, false);
    resetSVG();
    var chars = document.getElementById("chars").value;
    worker1.postMessage({pd1: pd1, pd2: pd2, chars: chars, w: w});
}
function resetSVG() {
    var tnode =  document.getElementById("font-display");
    tnode.innerHTML = "";
}
