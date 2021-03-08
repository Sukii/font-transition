function getX(pt) {
    return parseFloat(pt.replace(/,[^,]*$/,""));
}
function getY(pt) {
    return parseFloat(pt.replace(/^[^,]*,/,""));
}
function addPolyElement(points, fill) {
    var tnode =  document.getElementById("font-display");
    var poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    var pt = document.createAttribute("points");
    pt.value = points;
    var fl = document.createAttribute("fill");
    fl.value = fill;
    poly.setAttributeNode(pt);
    poly.setAttributeNode(fl);
    showTime("before append polygon:");
    tnode.appendChild(poly);
    showTime("after append polygon:");
}
function setPolygonAtTimeInterval(xyt,i,chr,h,v) {
    var pts = pointsFromXy(xyt[0][i],h,v).points.join(" ");
    var fill = "black";
    addPolyElement(pts,fill);
    if(xyt[1]) {
	fill = "white";
	if(chr.match(/^(i|j)$/)) {
	    fill = "black";
	}
	pts = pointsFromXy(xyt[1][i],h,v).points.join(" ");
	addPolyElement(pts,fill);
    }
    if(xyt[2]) {
	pts = pointsFromXy(xyt[2][i],h,v).points.join(" ");
	addPolyElement(pts,"white");
    }
    if(xyt[3]) {
	pts = pointsFromXy(xyt[3][i],h,v).points.join(" ");
	addPolyElement(pts,"white");
    }
    if(xyt[4]) {
	pts = pointsFromXy(xyt[3][i],h,v).points.join(" ");
	addPolyElement(pts,"white");
    }
    fill = "none";
    pointsFromXy(xyt[0][i],h,v).xpoints.forEach(function(item, i) {
	addCircleElement(item.x,item.y,2,fill);
    });
}
function setAnimation(xyts,chrs) {
    resetSVG();
    var flag = false;
    if(chrs.length == 1) {
	chrs = charToChars(chrs);
	flag = true;
    }
    var chs = charsToUniqueCharArray(chrs);
    var h = 0;
    var v = -50;
    var it = Math.round(parseInt(document.getElementById("it").value)/10);
    if(flag) { it = 0; }
    var ind = 0;
    for(var i=0; i<chrs.length; i++) {
	var chr = chrs[i];
	if(chs.indexOf(chr) !== -1) {
	    ind = chs.indexOf(chr);
	}
	if((chr == " " && h > 800) || chr == "\n") {
	   h = 0; v += 100;
	}
	if(chr != " " && chr != "\n") {
	    setPolygonAtTimeInterval(xyts[ind],it,chr,h,v);
	    if(flag && it < 10) { it++; }
	}
	var wd = 0;
	if(chr != "\n") {
	    wd = 0.1*(10-it)*w2["uni" + chr.charCodeAt(0)]+0.1*it*w1["uni" + chr.charCodeAt(0)];
	}
	h += wd;
    }

}
function charsToUniqueCharArray(chrs) {
    var chs = chrs.split("");
    var cs = [];
    for(var i=0; i<chs.length; i++) {
	var chr = chs[i];
	if(cs.indexOf(chr) == -1) {
	    cs.push(chr);
	}
    }
    return cs;
}
function showTime(msg) {
    if(debug) {
	var d = new Date();
	console.log(msg,(d.getTime()-T0)/1000);
    }
}
function addCircleElement(cxv,cyv,rv,fill) {
    var tnode =  document.getElementById("font-display");
    var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    var cx = document.createAttribute("cx");
    cx.value = cxv;
    var cy = document.createAttribute("cy");
    cy.value = cyv;
    var r = document.createAttribute("r");
    r.value = rv;
    var fl = document.createAttribute("fill");
    fl.value = fill;
    circle.setAttributeNode(cx);
    circle.setAttributeNode(cy);
    circle.setAttributeNode(r);
    circle.setAttributeNode(fl);
    tnode.appendChild(circle);
}
function pointsFromXy(arr,h,v) {
    var points = [];
    var xpoints = [];
    arr.forEach(function(item, i) {
	var x = item.x+h;
	var y = item.y+v;
	var xy = x + "," + y;
	points.push(xy);
	if(item.type == "x") {
	    var loc = {x: x, y: y};
	    xpoints.push(loc);
	}
    });
    return {points: points, xpoints: xpoints}
}
function charToChars(chr) {
    var chars_ = chr + " ";
    var ch_3 = chars_.repeat(3);
    var ch_4 = chars_.repeat(4);
    return ch_4 + "\n" + ch_4 + "\n" + ch_3;
}



