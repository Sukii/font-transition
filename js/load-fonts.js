var font1;
var font2;
var da = new Date();
var T0 = da.getTime();
var pd1 = {};
var pd2 = {};
var w1 = {};
var w2 = {};
var debug = false;
var xyts;
var intId;
var worker1;
var chars;
var M = 500;
var N = 10;
var MD = 1;
var M100 = M/3;
var DANG = [0,3,5,10,15,20,30,50,100];
function sliceClosedCurves(pd) {
    var pdc = [];
    var pdci = [];
    var L = pd.length;
    for(var key in pd) {
	var item = pd[key];
	pdci.push(item);
	if(item.type == "Z" || key == L-1) {
	    if(pdci.length > 3) {
		pdc.push(pdci);
	    }
	    pdci = [];
	}
    };
    return pdc;
}
function loadFonts() {
    pd1 = {};
    pd2 = {};
    w1 = {};
    w2 = {};
    var fff1 = "LinLibertine_R.otf";
    var fff2 = "LinBiolinum_R.otf";
    var chrs = document.getElementById("chars").value.trim();
    var type = document.getElementById("transtype").value.trim();
    //console.log("type:",type);
    if(!chrs.match(/[a-zA-Z]/)) {
	fff1 = "NotoSerifTamil-Regular.ttf";
	fff2 = "NotoSansTamil-Regular.ttf";
    }
    else if(type == "dejavu") {
	document.getElementById("chars").value = chrs;
	fff1 = "DejaVuSerif.ttf";
	fff2 = "DejaVuSans.ttf";
    }
    else if(type == "bold") {
	document.getElementById("chars").value = chrs;
	fff1 = "LinBiolinum_RB.otf";
	fff2 = "LinBiolinum_R.otf";
    }
    else if(type == "bold_serif") {
	document.getElementById("chars").value = chrs;
	fff1 = "LinLibertine_RB.otf";
	fff2 = "LinBiolinum_R.otf";
    }
    else if(type == "italic_serif") {
	document.getElementById("chars").value = chrs;
	fff1 = "LinLibertine_RI.otf";
	fff2 = "LinBiolinum_R.otf";
    }
    else if(type == "italic") {
	document.getElementById("chars").value = chrs;
	fff1 = "LinBiolinum_RI.otf";
	fff2 = "LinBiolinum_R.otf";
    }
    //console.log(fff1,fff2);
    document.getElementById("anim").disabled = true;
    document.getElementById("itr").onmouseup = function() {
	if(chars.length > 1) {
	    setAnimation(xyts,chars);
	}
    }
    document.getElementById("itr").ontouchend = function() {
	if(chars.length > 1) {
	    setAnimation(xyts,chars);
	}
    }
    document.getElementById("itr").oninput = function() {
	document.getElementById("it").value = document.getElementById("itr").value;
	if(chars.length > 1) {
	    setAnimation(xyts,chars);
	}
    }
    document.getElementById("it").oninput = function() {
	document.getElementById("itr").value = document.getElementById("it").value;
    }    
    opentype.load('/fonts/' + fff1, function(err, font) {
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
	    var uni = "uni"+glyph.unicode;
	    if(uni == "uni109" && spdc.length > 1) {
		spdc.pop();
	    }
	    pd1[uni] = spdc;
	    var options = { decimalPlaces: 4 };
	    w1["uni"+glyph.unicode] = font1.getAdvanceWidth(chr, 72, options);
	};
    });
    opentype.load('/fonts/' + fff2, function(err, font) {
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
	    var uni = "uni"+glyph.unicode;
	    pd2[uni] = spdc;
	    var options = { decimalPlaces: 4 };
	    w2["uni"+glyph.unicode] = font2.getAdvanceWidth(chr, 72, options);
	};
    });
    intId = setInterval(function() {
	if(!isEmpty(pd1) && !isEmpty(pd2)) {
	    //console.log("pd1:", pd1);
	    //console.log("pd2:", pd2);
	    clearInterval(intId);
	    animtext();
	}
    },1000);
    worker1 = new Worker('/js/font-transition.js');
    worker1.addEventListener('message', function(e) {
	xyts = e.data.xyts;
	chrs = e.data.chars;
	document.getElementById("anim").disabled = false;
	setAnimation(xyts,chrs);
    }, false);
}
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
function animtext() {
    var K = {};
    var alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ".split("");
    alphabets.forEach(function(item, i) {
	K[item] = false;
	if(item.match(/^[Q]$/)) {
	    K[item] = true;
	}
    });
    chars = document.getElementById("chars").value.trim();
    //console.log(pd1,pd2);
    worker1.postMessage({pd1: pd1, pd2: pd2, chars: chars, MD: MD, K: K, DANG: DANG, M: M, N: N});
}
function resetSVG() {
    var tnode =  document.getElementById("font-display");
    tnode.innerHTML = "";
}
