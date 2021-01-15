var M = 100;
var X = -50;
var Y = 80;
var xy1 = [];
var xy2 = [];
function fontTransition() {
    var char = prompt("Please input a single character", "H").charAt(0);
    opentype.load('dev/LinLibertine_R.otf', function(err, font) {
	if (err) {
	    alert('Font could not be loaded: ' + err);
	} else {
	    // Now display it on a canvas with id 'canvas'
	    const ctx = document.getElementById('canvas1').getContext('2d');
	    // Construct a Path object containing the letter shapes of the given text.
	    // The other parameters are x, y and fontSize.
	    // Note that y is the position of the baseline.
	    const path = font.getPath(char, 0, 150, 72);
	    // If you just want to draw the text you can also use font.draw(ctx, text, x, y, fontSize).
	    path.draw(ctx);
	    var pathdata1 = Raphael.parsePathString(path.toPathData());
	    var length1 = Raphael.getTotalLength(pathdata1);
	    for(var i=0; i<M+1; i++) {
		var s = length1*i/M;
		var point = Raphael.getPointAtLength(pathdata1, s);
		var loc = {x: point.x, y: point.y};
		xy1.push(loc);
	    }
	}
    });
    opentype.load('dev/LinBiolinum_R.otf', function(err, font) {
	if (err) {
	    alert('Font could not be loaded: ' + err);
	} else {
	    // Now display it on a canvas with id "canvas"
	    const ctx = document.getElementById('canvas2').getContext('2d');
	    // Construct a Path object containing the letter shapes of the given text.
	    // The other parameters are x, y and fontSize.
	    // Note that y is the position of the baseline.
	    const path = font.getPath(char, 0, 150, 72);
	    // If you just want to draw the text you can also use font.draw(ctx, text, x, y, fontSize).
	    path.draw(ctx);
	    var pathdata2 = Raphael.parsePathString(path.toPathData());
	    var length2 = Raphael.getTotalLength(pathdata2);
	    for(var i=0; i<M+1; i++) {
		var s = length2*i/M;
		var point = Raphael.getPointAtLength(pathdata2, s);
		var loc = {x: point.x, y: point.y};
		xy2.push(loc);
	    }
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
function rotateArray(arr) {
    var istart = getTopLeftIndex(arr);
    var prevArray = arr.slice(0,istart);
    var nextArray = arr.slice(istart);
    return nextArray.concat(prevArray);
}
function anim() {
    xy1 = rotateArray(xy1);
    xy2 = rotateArray(xy2);
    var speed = parseInt(document.getElementById("speed").value);
    var dt = 3000/speed;
    var xyt = [];
    for(var it=0; it<11; it++) {
	var xyti = "";
	xy1.forEach(function(item, i) {
	    var xt = it*item.x/10 + (10-it)*xy2[i].x/10;
	    var yt = it*item.y/10 + (10-it)*xy2[i].y/10;
	    var loc = (xt-X) + "," +  (yt-Y);
	    xyti += loc + " ";
	});
	xyti = xyti.replace(/ +$/,"");
	xyt.push(xyti);
    }
    setTimeout(function() {
	document.getElementById("animPolygon").setAttribute("points",xyt[0]);
    }, 0);
    setTimeout(function() {
	document.getElementById("animPolygon").setAttribute("points",xyt[1]);
    }, dt);
    setTimeout(function() {
	document.getElementById("animPolygon").setAttribute("points",xyt[2]);
    }, 2*dt);
    setTimeout(function() {
	document.getElementById("animPolygon").setAttribute("points",xyt[3]);
    }, 3*dt);
    setTimeout(function() {
	document.getElementById("animPolygon").setAttribute("points",xyt[4]);
    }, 4*dt);
    setTimeout(function() {
	document.getElementById("animPolygon").setAttribute("points",xyt[5]);
    }, 5*dt);
    setTimeout(function() {
	document.getElementById("animPolygon").setAttribute("points",xyt[6]);
    }, 6*dt);
    setTimeout(function() {
	document.getElementById("animPolygon").setAttribute("points",xyt[7]);
    }, 7*dt);
    setTimeout(function() {
	document.getElementById("animPolygon").setAttribute("points",xyt[8]);
    }, 8*dt);
    setTimeout(function() {
	document.getElementById("animPolygon").setAttribute("points",xyt[9]);
    }, 9*dt);
    setTimeout(function() {
	document.getElementById("animPolygon").setAttribute("points",xyt[10]);
    }, 10*dt);
}
