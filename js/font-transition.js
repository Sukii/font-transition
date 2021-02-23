var MAX = 1000000000;
var M = 500;
var mM = 100;
var N = 10;
var X = 0;
var Y = -50;
var R = 2;
var eps = 0.01;
var debug = false;
self.addEventListener("message", function(e) {
    var chars = e.data.chars;
    var h = 0;
    var v = Y;
    for(var i=0; i<chars.length; i++) {
	var chr = chars[i];
	var pdata1 = e.data.pd1["uni" + chr.charCodeAt(0)];
	var pdata2 = e.data.pd2["uni" + chr.charCodeAt(0)];
	var w = e.data.w["uni" + chr.charCodeAt(0)];
	var r = anim(pdata1,pdata2,chr,h,v);
	h += w;
	if(chr == " ") {
	    if(h > 800) { h = 0; v += 200/R; }
	}
	self.postMessage({xyt: r.xyt, chr: chr});
    }
}, false);
function fontTransition(pds1,pds2,chr) {
    //console.log("pds1:",pds1);
    //console.log("pds2:",pds2);
    var xy1 = [];
    var len1 = [];
    var x1m = [];
    var y1m = [];
    var xy2 = [];
    var len2 = [];
    var x2m = [];
    var y2m = [];
    var res1;
    var res2;
    if(chr != " ") {
	pds1.forEach(function(item, k) {
	    var pp = getPathPoints(item,M*N);
	    xy1.push(pp.xy);
	    len1.push(pp.len);
	    x1m.push(pp.xm);
	    y1m.push(pp.ym);
	});
	res1 = reorderArray(xy1,len1,x1m,y1m);
	//-------font2 starts here
	pds2.forEach(function(item, k) {
	    var pp = getPathPoints(item,M);
	    xy2.push(rotateArray(pp.xy));
	    len2.push(pp.len);
	    x2m.push(pp.xm);
	    y2m.push(pp.ym);
	});
	res2 = reorderArray(xy2,len2,x2m,y2m);
    }
    return {res1: res1, res2: res2};
}
function getOrigin(chr) {
    var X0 = 0;
    var Y0 = 0;
    if(chr == "rx") {
	X0 = 400;
	Y0 = 100;
    }
    if(chr == "Tx") {
	X0 = 37;
	Y0 = 80;
    }
    if(chr == "fx") {
	Y0 = 90;
    }
    return {x: X0, y: Y0};
}
function getAnimMode(chr) {
    var Q = false;
    if(chr.match(/^(c|e|g|o|s|t|B|C|O|S|Q|J)$/)) {
	Q = true;
    }
    return Q;
}
function makeDotPolarity(xy1,xy2) {
    function makePolarityArray(arr) {
	var newdot = [];
	var newpol = [];
	var L = arr.length;
	for(var i=0; i<L; i++) {
	    if(i == 0) {
		newdot.push(dotproduct(arr[L-1],arr[0],arr[0],arr[1]));
		newpol.push(getPolarity(arr[L-1],arr[0],arr[0],arr[1]));
	    }
	    else if(i > 0 && i < L-1) {
		newdot.push(dotproduct(arr[i-1],arr[i],arr[i],arr[i+1]));
		newpol.push(getPolarity(arr[i-1],arr[i],arr[i],arr[i+1]));
	    }
	    else if(i == L-1) {
		newdot.push(dotproduct(arr[L-2],arr[L-1],arr[L-1],arr[0]));
		newpol.push(getPolarity(arr[L-2],arr[L-1],arr[L-1],arr[0]));
	    }
	}
	return {dot: newdot, pol: newpol};
    }
    var dot1 = [];
    var dot2 = [];
    var pol1 = [];
    var pol2 = [];
    xy1.forEach(function(item, k) {
	var val = makePolarityArray(xy1[k]);
	dot1.push(val.dot);
	pol1.push(val.pol);
    });
    xy2.forEach(function(item, k) {
	var val = makePolarityArray(xy2[k]);
	dot2.push(val.dot);
	pol2.push(val.pol);
    });
    return {dot1: dot1, dot2: dot2, pol1: pol1, pol2: pol2};
}
function getTopLeftIndex(xy,X0,Y0) {
    var rmin = 10000000000;
    var topleft = 0;
    xy.forEach(function(item, i) {
	var rxymin = (item.x-X0)**2+(item.y-Y0)**2;
	if(rxymin < rmin) {
	    rmin = rxymin;
	    topleft = i;
	}
    });
    return topleft;
}
function reorderArray(arr,len,xm,ym) {
    //console.log("before reorder:",arr,len,xm,ym);
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
    var newxm = [];
    var newym = [];
    newarr.push(arr[ilenmax]);
    newlen.push(len[ilenmax]);
    newxm.push(xm[ilenmax]);
    newym.push(ym[ilenmax]);
    len.forEach(function(item,i) {
	if(i != ilenmax) {
	    newarr.push(arr[i])
	    newlen.push(len[i])
	    newxm.push(xm[i])
	    newym.push(ym[i])
	}
    });
    if(ym.length == 3) {
	var nlen1 = newlen[1];
	var nlen2 = newlen[2];
	var nxm1 = newxm[1];
	var nxm2 = newxm[2];
	var nym1 = newym[1];
	var nym2 = newym[2];
	if(nym2 < nym1) {
	    var narr1 = newarr[1];
	    var narr2 = newarr[2];
	    newarr[2] = narr1;
	    newarr[1] = narr2;
	    newxm[2] = nxm1;
	    newxm[1] = nxm2;
	    newym[2] = nym1;
	    newym[1] = nym2;
	    newlen[2] = nlen1;
	    newlen[1] = nlen2;	    
	}
    }
    //console.log("reorder:",arr,len,xm,ym);
    return {arr: newarr, len: newlen, xm: newxm, ym: newym };
}
function rotateArray(arr,chr) {
    var r = getOrigin(chr);
    var X0 = r.x;
    var Y0 = r.y;
    var istart = getTopLeftIndex(arr,X0,Y0);
    var prevArray = arr.slice(0,istart);
    var nextArray = arr.slice(istart);
    return nextArray.concat(prevArray);
}
function anim(pds1,pds2,chr,h,v) {
    var xyt = [];
    if(chr != " ") {
	var res = fontTransition(pds1,pds2,chr);
	var xy1 = res.res1.arr;
	var xy2 = res.res2.arr;
	if(xy2.length != xy1.length) {
	    alert("The two glyhs are not homeomorphic!");
	}
	else {
	    xy1 = resetOriginForXy1(xy1,chr);
	    var dp = makeDotPolarity(xy1,xy2);
	    var xy1x = getXy1x(xy1,xy2,dp,chr);
	    //console.log("xy1:",xy1);
	    //console.log("xy2:",xy2);
	    //console.log("xy1x:",xy1x);
	    xy2.forEach(function(ktem, k) {
		var xytk = [];
		for(var it=0; it<11; it++) {
		    var xyti = [];
		    ktem.forEach(function(item, i) {
			var xt = it*xy1x[k][i].x/10 + (10-it)*item.x/10;
			var yt = it*xy1x[k][i].y/10 + (10-it)*item.y/10;
			var loc = {x: (xt+h)/R, y: (yt+v)/R, type: xy1x[k][i].type};
			xyti.push(loc); 
		    });
		    xytk.push(xyti);
		}
		xyt.push(xytk);
	    });
	}
    }
    //console.log(xyt);
    return {xyt: xyt, chr: chr};
}
function getXy1x(xy1,xy2,dp,chr) {
    //console.log("xy1:",xy1);
    //console.log("xy2:",xy2);
    var dot1 = dp.dot1;
    var dot2 = dp.dot2;
    var pol1 = dp.pol1;
    var pol2 = dp.pol2;
    var Q = getAnimMode(chr);
    xy1x = [];
    xy2.forEach(function(ktem, k) {
	if(k > 0) { Q = true; }
	var N2 = Math.round(N/2);
	var jmin = 0;
	xy1xk = [];
	var L2 = ktem.length;
	var L1 = xy1[k].length;
	var flag = 0;
	ktem.forEach(function(item, i) {
	    var x = item.x;
	    var y = item.y;
	    var type0 = item.type;
	    var type_1 = xy2[k][L2-1].type;
	    if(i > 0) {
		type_1 = xy2[k][i-1].type;
	    }
	    var min = 1000000;
	    var alpha_0 = pol1[k][L1-N][0];
	    var alpha_1 = pol1[k][L1-N][1];
	    if(jmin > N-1) {
		alpha_0 = pol1[k][jmin-N][0];
		alpha_1 = pol1[k][jmin-N][1];
	    }
	    var alpha0 = pol1[k][jmin][0];
	    var alpha1 = pol1[k][jmin][1];
	    var dalpha = alpha1-alpha0;
	    var t1 = dir(alpha_0) + "," + dir(alpha0);
	    var theta_0 = pol2[k][L2-1][0];
	    var theta_1 = pol2[k][L2-1][1];
	    if(i > 0) {
		theta_0 = pol2[k][i-1][0];
		theta_1 = pol2[k][i-1][1];
	    }
	    var theta0 = pol2[k][i][0];
	    var theta1 = pol2[k][i][1];
	    var theta2 = 0;
	    var theta3 = 0;
	    if(i < L2-1) {
		theta2 = pol2[k][i+1][0];
		theta3 = pol2[k][i+1][1];
	    }
	    var dtheta = theta1-theta0;
	    var ddtheta = theta3-theta_0;
	    if(dtheta > 135)  { dtheta = dtheta - 180; }
	    if(dtheta < -135)  { dtheta = dtheta + 180; }
	    if(ddtheta > 135)  { ddtheta = ddtheta - 180; }
	    if(ddtheta < -135)  { ddtheta = ddtheta + 180; }
	    var t2 = dir(theta_0) + "," + dir(theta0);
	    var t2x = dir(theta_0) + "," + dir(theta1);
	    var t2xx = dir(theta_0) + "," + dir(theta3);
	    var jm = jmin;
	    var item1 = xy2[k][L2-1];
	    if(i > 0) {
		item1 = xy2[k][i-1];
	    }
	    if(flag==0 && (t2.match(/^(-?H,-?(V|L))$/)
			   || t2x.match(/^(-?H,-?(V|L))$/)
			  ) // (type0.replace(/_/,"") != type_1.replace(/_/,"") && Math.abs(ddtheta) > 70)
	      ) {
		flag = 1;
	    }
	    var jmax = jmin+N+N2+1;
	    if(flag > 0) {
		jmax = jmin+10*N+N2+1;
		flag++;
	    }
	    if(flag > M/25) { flag = 0; }
	    var js = jmin-N2+1;
	    if(js < 0) { js = 0; }
	    for(var j=js; j<jmax && j<M*N-1 && !Q; j++) {
		jr = j;
		if(jr < 0) { jr = L2 + jr };
		d = getDistance(xy1[k][jr],item);
		if(d == 0) { d = eps/1000000;}
		if(Q) {
		    r = d;
		    if(r < min) {
			min = r;
			jm = jr;
		    }
		}
		else {
		    r = getDistanceY(xy1[k][jr],item);
		    if(t2x.match(/^(H,H|-H,-H)$/) && t2xx.match(/^(H,H|-H,-H)$/)) {
			r = getDistanceX(xy1[k][jr],item);
		    }
		    if(r < min) { //  + eps/d
			min = r;
			jm = jr;
		    }
		}
	    }
	    jmin = jm;
	    var d = getDistance(xy1[k][jmin],item);
	    var ntype = "none";
	    if(type0 != type_1 && (Math.abs(dtheta) > 1000 || Math.abs(ddtheta) > 70)) { ntype = "x"; }
	    var loc = {x: xy1[k][jmin].x, y: xy1[k][jmin].y, type: ntype};
	    //if(type0 != type_1) { console.log("type boundary:",i,jmin,type0,type_1,dtheta); }
	    xy1xk.push(loc);		
	    if(jmin < M*N-N-3) {
		jmin = jmin +  N;
	    }
	});
	xy1x.push(xy1xk);
    });
    return xy1x;
}
function resetOriginForXy1(xy1,chr) {
    var r = getOrigin(chr);
    var X0 = r.x;
    var Y0 = r.y;
    xy1.forEach(function(item, i) {
	var arr = xy1[i];
	var istart = getTopLeftIndex(arr,X0,Y0);
	var prevArray = arr.slice(0,istart);
	var nextArray = arr.slice(istart);
	xy1[i] = nextArray.concat(prevArray);
    });
    return xy1;
}
function dir(t) {
    var del = 15;
    var foo = "L";
    if(Math.abs(t+90) < del) {
	foo = "-V";
    }
    else if(Math.abs(t-90) < del) {
	foo = "V";
    }
    else if(Math.abs(t) < del && t < 0) {
	foo = "-H";
    }
    else if(Math.abs(t) < del && t > 0) {
	foo = "H";
    }
    return foo;
}
function getDistance(xyA1,xyA2) {
    return Math.sqrt((xyA1.x-xyA2.x)**2+(xyA1.y-xyA2.y)**2);
}

function getDistanceX(xyA1,xyA2) {
    return Math.abs(xyA1.x-xyA2.x);
}
function getDistanceY(xyA1,xyA2) {
    return Math.abs(xyA1.y-xyA2.y);
}
function getPolarity(xyA1,xyA2,xyB1,xyB2) {
    var ang = [];
    ang.push(getAngleFromSlope(getSlopeFromFromTwoPoints(xyA1,xyA2)));
    ang.push(getAngleFromSlope(getSlopeFromFromTwoPoints(xyB1,xyB2)));
    return ang;
}
function dotproduct(xyA1,xyA2,xyB1,xyB2) {
    var m1 = getSlopeFromFromTwoPoints(xyA1,xyA2);
    var m2 = getSlopeFromFromTwoPoints(xyB1,xyB2);
    var v1 = getUnitVectorFromSlope(m1);
    var v2 = getUnitVectorFromSlope(m2);
    var dp = v1.x*v2.x + v1.y*v2.y;
    return dp;
}
function getUnitVectorFromSlope(m) {
    var cos = Math.sqrt(1/(1+m**2));
    var sin = m*cos;
    var v = {x: cos, y: sin}
    return v;
}
function getSlopeFromFromTwoPoints(xya,xyb) {
    var m = MAX;
    xya.x = Math.round(xya.x*10000)/10000;
    xya.y = Math.round(xya.y*10000)/10000;
    xyb.x = Math.round(xyb.x*10000)/10000;
    xyb.y = Math.round(xyb.y*10000)/10000;
    var dx = xyb.x-xya.x;
    var dy = xyb.y-xya.y;
    if(dx != 0) {
	m = dy/dx;
    }
    if(Math.abs(m) > 4 && dy != 0) {
	m = Math.abs(m)*(dy/Math.abs(dy));
    }
    if(Math.abs(m) < 0.5 && dx != 0) {
	m = Math.abs(m)*(dx/Math.abs(dx));
    }
    if(m == 0 && dx != 0) {
	m = 0.000000001*(dx/Math.abs(dx));
    }
    return m;
}
function getAngleFromSlope(m) {
    var theta = (180/Math.PI)*Math.atan(m);
    //if(theta < 0) { theta += 180; }
    //if(theta > 135) { theta = theta - 180; }
    return theta;
}
function showTime(msg) {
    if(debug) {
	var d = new Date();
	console.log(msg,(d.getTime()-T0)/1000);
    }
}
function createSVGPath(d) {
    var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var att = document.createAttribute("d");
    att.value = d;
    p.setAttributeNode(att);
    return p;
}
function getPathPoints(pd,K) {
    var xy = [];
    var r0 = {x: 0, y: 0 };
    var len = [];
    for(var i in pd) {
	var item = pd[i];
	if(item.type == "M") {
	    r0.x = item.x;
	    r0.y = item.y;
	    var L = 0;
	    len.push(L);
	}
	else if(item.type == "C") {
	    var r1 = { x: item.x1, y: item.y1};
	    var r2 = { x: item.x2, y: item.y2};
	    var r3 = { x: item.x, y: item.y};
	    var L1 =  getDistance(r0,r3);
	    var L2 =  getDistance(r0,r1)+getDistance(r1,r2)+getDistance(r2,r3);
	    var L = 2*L2/3 + L1/3;
	    len.push(L);
	    r0 = r3;
	}
	else if(item.type == "Q") {
	    var r1 = { x: item.x1, y: item.y1};
	    var r2 = { x: item.x, y: item.y};
	    var L1 =  getDistance(r0,r2);
	    var L2 =  getDistance(r0,r1)+getDistance(r1,r2);
	    var L = 2*L2/3 + L1/3;
	    len.push(L);
	    r0 = r2;
	}
	else if(item.type == "L") {
	    var r1 = {x: item.x, y: item.y };
	    var L = getDistance(r0,r1);
	    len.push(L);
	    r0 = r1;
	}
	else if(item.type == "Z") {
	    var L = 0;
	    len.push(L);
	}
	else {
	    console.log("not yet handled!! error!!");
	    fail;
	}
    };
    var L = 0;
    len.forEach( function(item, i) {
	L += item;
    });
    //---create m = (len[i]/L)*K points uniformly along the sub-paths    
    var xy = [];
    //console.log("L:",L);
    var mt = 0;
    var r0 = {x: 0, y: 0 };
    for(var i in pd) {
	var item = pd[i];
    	var m = Math.round(K*len[i]/L);
	if(m > 0) { m = Math.ceil(K*len[i]/L); }
	mt += m;
	if(mt > K) { m = m-(mt-K); }
	if(item.type == "M") {
	    r0.x = item.x;
	    r0.y = item.y;
	}
	else if(item.type == "C") {
	    var r1 = { x: item.x1, y: item.y1};
	    var r2 = { x: item.x2, y: item.y2};
	    var r3 = { x: item.x, y: item.y};
	    if(mt > K-5 && mt < K) { m = m+(K-mt); }
	    //console.log("Cubicx:",i,r0,r1,r2,r3,m)
	    var ty = "C";
	    for(var i=0; i<m; i++) {
		var t = i;
		if(m > 1) { t = i/(m-1); };
		var r = getPointInCubicBrezier(r0,r1,r2,r3,t);
		if(i == m-1) { ty = "C_"; }
		xy.push({x: r.x, y: r.y, type: ty});
	    }
	    r0 = r3;
	}
	else if(item.type == "Q") {
	    var r1 = { x: item.x1, y: item.y1};
	    var r2 = { x: item.x, y: item.y};
	    if(mt > K-5 && mt < K) { m = m+(K-mt); }
	    //console.log("Quadraticx:",i,r0,r1,r2,m)
	    var ty = "Q";
	    for(var i=0; i<m; i++) {
		var t = i;
		if(m > 1) { t = i/(m-1); };
		var r = getPointInQuadraticBrezier(r0,r1,r2,t);
		if(i == m-1) { ty = "Q_"; }
		xy.push({x: r.x, y: r.y, type: ty});
	    }
	    r0 = r2;
	}
 	else if(item.type == "L") {
	    var r1 = { x: item.x, y: item.y};
	    if(mt > K-5 && mt < K) { m = m+(K-mt); }
	    //console.log("Linearx:",i,r0,r1,m)
	    var ty = "L";
	    for(var i=0; i<m; i++) {
		var t = i;
		if(m > 1) { t = i/(m-1); };
		var r = getPointInLine(r0,r1,t);
		if(i == m-1) { ty = "L_"; }
		xy.push({x: r.x, y: r.y, type: ty});
	    }
	    r0 = r1;
	}
    };
    var xm = 0;
    var ym = 0;
    xy.forEach(function(item, i) {
	xm += item.x;
	ym += item.y;
    });
    xm = xm/xy.length;
    ym = ym/xy.length;
    //console.log("getPathPoints xy:",xy);
    return {xy: xy, len: L, xm: xm, ym: ym};
}
function getPointInCubicBrezier(r0,r1,r2,r3,t) {
    var u = 1 - t;
    var x = (u**3)*r0.x + 3*t*(u**2)*r1.x + 3*(t**2)*u*r2.x + (t**3)*r3.x;
    var y = (u**3)*r0.y + 3*t*(u**2)*r1.y + 3*(t**2)*u*r2.y + (t**3)*r3.y;
    var r = {x: x, y: y};
    return r;
}
function getPointInQuadraticBrezier(r0,r1,r2,t) {
    var u = 1 - t;
    var x = (u**2)*r0.x + 2*t*u*r1.x + (t**2)*r2.x;
    var y = (u**2)*r0.y + 2*t*u*r1.y + (t**2)*r2.y;
    var r = {x: x, y: y};
    return r;
}
function getPointInLine(r0,r1,t) {
    var u = 1 - t;
    var x = u*r0.x + t*r1.x;
    var y = u*r0.y + t*r1.y;
    var r = {x: x, y: y}; 
    return r;
}
    
