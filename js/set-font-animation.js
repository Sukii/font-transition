function getX(pt) {
    return parseFloat(pt.replace(/,[^,]*$/,""));
}
function getY(pt) {
    return parseFloat(pt.replace(/^[^,]*,/,""));
}
function simplifyPath(pts) {
    showTime("before simplify:");
    var pathdata = Raphael.parsePathString("M" + pts.replace(/ /g, "L").replace(/,/g," ") + "Z");
    var length = Raphael.getTotalLength(pathdata);
    var newarr = [];
    for(var i=0; i<mM; i++) {
	var s = length*i/(mM);
	var point = Raphael.getPointAtLength(pathdata, s);
	var loc = point.x + "," + point.y;
	newarr.push(loc);
    }
    showTime("after simplify:");
    return newarr.join(" ");
}
function forceDomPaint(el) {
    console.log(window.getComputedStyle(el).display);
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
    //forceDomPaint(tnode);
}
function setPolygonAtTimeInterval(xyt,i,chr) {
    var fill = "black";
    addPolyElement(xyt[0][i],fill);
    if(xyt[1]) {
	fill = "white";
	if(chr.match(/^(i|j)$/)) {
	    fill = "black";
	}
	addPolyElement(xyt[1][i],fill);
    }
    if(xyt[2]) {
	addPolyElement(xyt[2][i],"white");
    }
}
function setAnimation(xyt,chr) {
    var it = Math.round(parseInt(document.getElementById("it").value)/10);
    if(chr != " ") {
	setPolygonAtTimeInterval(xyt,it,chr);
    }
}
function showTime(msg) {
    if(debug) {
	var d = new Date();
	console.log(msg,(d.getTime()-T0)/1000);
    }
}
