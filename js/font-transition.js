var M = 200;
var X = -50;
var Y = 50;
var xy1 = [];
var len1 = [];
var y1m = [];
var xy2 = [];
var len2 = [];
var y2m = [];
var dt;
function fontTransition() {
    var char = prompt("Please input a single character", "H").charAt(0);
    opentype.load('/fonts/LinLibertine_R.otf', function(err, font) {
	if (err) {
	    alert('Font could not be loaded: ' + err);
	} else {
	    // Now display it on a canvas with id 'canvas'
	    const ctx = document.getElementById('canvas1').getContext('2d');
	    // Construct a Path object containing the letter shapes of the given text.
	    // The other parameters are x, y and fontSize.
	    // Note that y is the position of the baseline.
	    const path = font.getPath(char, 0, 120, 72);
	    // If you just want to draw the text you can also use font.draw(ctx, text, x, y, fontSize).
	    path.draw(ctx);
	    var pdata1 = path.toPathData();
	    var pds1 = pdata1.split("M");
	    pds1.forEach(function(item, k) {
		if(item != "") {
		    var pathdata1 = Raphael.parsePathString("M"+item);
		    var length1 = Raphael.getTotalLength(pathdata1);
		    var xy1k = [];
		    var y1mk = 0;
		    for(var i=0; i<M+1; i++) {
			var s = length1*i/M;
			var point = Raphael.getPointAtLength(pathdata1, s);
			var loc = {x: point.x, y: point.y};
			y1mk += point.y;
			xy1k.push(loc);
		    }
		    xy1.push(rotateArray(xy1k));
		    len1.push(length1);
		    y1m.push(y1mk/(M+1));
		}
	    });
	    xy1 = reorderArray(xy1,len1,y1m);
	}
    });
    opentype.load('/fonts/LinBiolinum_R.otf', function(err, font) {
	if (err) {
	    alert('Font could not be loaded: ' + err);
	} else {
	    // Now display it on a canvas with id "canvas"
	    const ctx = document.getElementById('canvas2').getContext('2d');
	    // Construct a Path object containing the letter shapes of the given text.
	    // The other parameters are x, y and fontSize.
	    // Note that y is the position of the baseline.
	    const path = font.getPath(char, 0, 120, 72);
	    // If you just want to draw the text you can also use font.draw(ctx, text, x, y, fontSize).
	    path.draw(ctx);
	    var pdata2 = path.toPathData();
	    var pds2 = pdata2.split("M");
	    pds2.forEach(function(item, k) {
		if(item != "") {
		    var pathdata2 = Raphael.parsePathString("M"+item);
		    var length2 = Raphael.getTotalLength(pathdata2);
		    var xy2k = [];
		    var y2mk = 0;
		    for(var i=0; i<M+1; i++) {
			var s = length2*i/M;
			var point = Raphael.getPointAtLength(pathdata2, s);
			var loc = {x: point.x, y: point.y};
			y2mk += point.y;
			xy2k.push(loc);
		    }
		    xy2.push(rotateArray(xy2k));
		    len2.push(length2);
		    y2m.push(y2mk/(M+1));
		}
	    });
	    xy2 = reorderArray(xy2,len2,y2m);
	}
    });
}
function getTopLeftIndex(xy) {
    var rmin = 10000000000;
    var topleft = 0;
    xy.forEach(function(item, i) {
	var rxymin = item.x**2+item.y**2;
	if(rxymin < rmin) {
	    rmin = rxymin;
	    topleft = i;
	}
    });
    return topleft;
}
function reorderArray(arr,len,ym) {
    var lenmax = 0;
    var ilenmax = 0;
    len.forEach(function(item,i) {
	if(item > lenmax) {
	    ilenmax = i;
	    lenmax = item;
	}
    });
    var newarr = [];
    var newlen = [];
    var newym = [];
    newarr.push(arr[ilenmax]);
    newlen.push(len[ilenmax]);
    newym.push(ym[ilenmax]);
    len.forEach(function(item,i) {
	if(i != ilenmax) {
	    newarr.push(arr[i])
	    newlen.push(len[i])
	    newym.push(ym[i])
	}
    });
    if(ym.length == 3) {
	if(newym[2] < newym[1]) {
	    var narr1 = newarr[1];
	    var narr2 = newarr[2];
	    newarr[2] = narr1;
	    newarr[1] = narr2;
	}
    }
    return newarr;
}
function rotateArray(arr) {
    var istart = getTopLeftIndex(arr);
    var prevArray = arr.slice(0,istart);
    var nextArray = arr.slice(istart);
    return nextArray.concat(prevArray);
}
function anim() {
    var speed = parseInt(document.getElementById("speed").value);
    dt = 3000/speed;
    var xyt = [];
    xy1.forEach(function(ktem, k) {
	var xytk = [];
	for(var it=0; it<11; it++) {
	    var xyti = "";
	    ktem.forEach(function(item, i) {
		var xt = it*item.x/10 + (10-it)*xy2[k][i].x/10;
		var yt = it*item.y/10 + (10-it)*xy2[k][i].y/10;
		var loc = (xt-X) + "," +  (yt-Y);
		xyti += loc + " ";
	    });
	    xyti = xyti.replace(/ +$/,"");
	    xytk.push(xyti);
	}
	xyt.push(xytk);
    });
    setAnimation(xyt);
}
