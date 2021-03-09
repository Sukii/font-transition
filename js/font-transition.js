var MAX = 1000000000;
var M = 500;
var mM = 100;
var N = 10;
var X = 0;
var Y = -50;
var R = 1;
var eps = 0.01;
var debug = false;
self.addEventListener("message", function(e) {
    var chrs = e.data.chars;
    var MD = e.data.MD;
    var K = e.data.K;
    var DANG = e.data.DANG;
    M = e.data.M;
    N = e.data.N;
    var xyts = [];
    var chs = [];
    for(var i=0; i<chrs.length; i++) {
	var chr = chrs[i];
	if(chs.indexOf(chr) == -1) {
	    chs.push(chr);
	    var pdata1 = e.data.pd1["uni" + chr.charCodeAt(0)];
	    var pdata2 = e.data.pd2["uni" + chr.charCodeAt(0)];
	    var r = anim(pdata1,pdata2,chr,MD,K,DANG);
	    xyts.push(r.xyt);
	}
    }
    self.postMessage({xyts: xyts, chars: chrs});
}, false);
function fontTransition(pds1,pds2,chr) {
    var xy1 = [];
    var len1 = [];
    var x1m = [];
    var y1m = [];
    var xy2 = [];
    var len2 = [];
    var x2m = [];
    var y2m = [];
    var y2m = [];
    var ln1 = [];
    var ln2 = [];
    var res1;
    var res2;
    if(chr != " ") {
	pds1.forEach(function(item, k) {
	    var pp = getPathPoints(item,M*N);
	    xy1.push(pp.xy);
	    len1.push(pp.len);
	    x1m.push(pp.xm);
	    y1m.push(pp.ym);
	    ln1.push(pp.ln);
	});
	res1 = reorderArray(xy1,len1,x1m,y1m,ln1);
	//-------font2 starts here
	pds2.forEach(function(item, k) {
	    var pp = getPathPoints(item,M);
	    xy2.push(rotateArray(pp.xy));
	    len2.push(pp.len);
	    x2m.push(pp.xm);
	    y2m.push(pp.ym);
	    ln2.push(pp.ln);
	});
	res2 = reorderArray(xy2,len2,x2m,y2m,ln2);
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
function getAnimMode(chr,ln,len1,len2,pol,MF,DANG) {
    var hv = 0;
    var cn = 0;
    pol.forEach(function(item, i) {
	var o = getOrientations(pol,MF,i);
	if(o.t1.match(/^(-?H|-?V)$/)) {
	    hv++;
	}
	var tf = o.t_1 + o.t2;
	if(tf.match(/^(-?H-?V|-?V-?H)$/)
	  || o.dalpha > DANG ) {
	    cn++;
	}
    });
    var Q = true;
    if(chr.match(/[^ijcegosCOQ]$/)) {
	Q = false;
    }
    var hf = hv/(pol.length + 0.0001);
    var lf = ln.ll/(ln.lc + ln.lq + 0.0001);
    if(lf > 0.1
       || hf > 0.5) {
	Q = false;
    }
    if(chr.match(/[^a-zA-Z]/)) {
	Q = true;
    }
    var KF = factor(cn,lf,hf,len1,len2);
    return {flag: Q, KF: KF};
}
function factor(cn,lf,hf,len1,len2) {
    var KF = 1;
    if(lf > 0.1 && hf > 0.1) {
	if(len2 > 0) {
	    KF = 2*(len1/len2);
	}
    }
    if(cn > 0) {
	KF = KF/cn;
    }
    //console.log(cn,lf,hf,len1/len2,KF);
    return KF;
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
function reorderArray(arr,len,xm,ym,ln) {
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
    var newln = [];
    newarr.push(arr[ilenmax]);
    newlen.push(len[ilenmax]);
    newxm.push(xm[ilenmax]);
    newym.push(ym[ilenmax]);
    newln.push(ln[ilenmax]);
    len.forEach(function(item,i) {
	if(i != ilenmax) {
	    newarr.push(arr[i]);
	    newlen.push(len[i]);
	    newxm.push(xm[i]);
	    newym.push(ym[i]);
	    newln.push(ln[i]);
	}
    });
    if(ym.length == 3) {
	var narr1 = newarr[1];
	var narr2 = newarr[2];
	var nlen1 = newlen[1];
	var nlen2 = newlen[2];
	var nxm1 = newxm[1];
	var nxm2 = newxm[2];
	var nym1 = newym[1];
	var nym2 = newym[2];
	var nln1 = newln[1];
	var nln2 = newln[2];
	if(nym2 < nym1) {
	    newarr[2] = narr1;
	    newarr[1] = narr2;
	    newxm[2] = nxm1;
	    newxm[1] = nxm2;
	    newym[2] = nym1;
	    newym[1] = nym2;
	    newlen[2] = nlen1;
	    newlen[1] = nlen2;	    
	    newln[2] = nln1;
	    newln[1] = nln2;	    
	}
    }
    return {arr: newarr, len: newlen, xm: newxm, ym: newym, ln: newln };
}
function rotateArray(arr,chr) {
    arr = makeArrayDistinct(arr);
    var r = getOrigin(chr);
    var X0 = r.x;
    var Y0 = r.y;
    var istart = getTopLeftIndex(arr,X0,Y0);
    var prevArray = arr.slice(0,istart);
    var nextArray = arr.slice(istart);
    return nextArray.concat(prevArray);
}
function makeArrayDistinct(arr) {
    var L = arr.length;
    arr.forEach(function(item,i) {
	if(i > 0) {
	    var i1 = i+1 ;
	    if(i == L-1) { i1 = 0; }
	    if(arr[i-1].x == item.x && arr[i-1].y == item.y) {
		item.x = arr[i1].x*0.01+item.x*0.99;
		item.y = arr[i1].y*0.01+item.y*0.99;
	    }
	}
    });
    return arr;
}
function anim(pds1,pds2,chr,MF,K,DANG) {
    var xyt = [];
    if(chr != " " && chr != "\n") {
	var res = fontTransition(pds1,pds2,chr);
	var xy1 = res.res1.arr;
	var xy2 = res.res2.arr;
	var len1 = res.res1.len;
	var len2 = res.res2.len;
	var ln1 = res.res1.ln;
	var ln2 = res.res2.ln;
	if(xy2.length != xy1.length) {
	    console.log("The two glyhs of " + chr + " are not homeomorphic!");
	    console.log("xy1,xy2;",xy1,xy2);
	}
	else {
	    xy1 = resetOriginForXy1(xy1,chr);
	    var dp = makeDotPolarity(xy1,xy2);
	    var xy1x = getXy1x(xy1,xy2,ln1,ln2,len1,len2,dp,chr,MF,K,DANG);
	    xy2.forEach(function(ktem, k) {
		var xytk = [];
		for(var it=0; it<11; it++) {
		    var xyti = [];
		    ktem.forEach(function(item, i) {
			var xt = it*xy1x[k][i].x/10 + (10-it)*item.x/10;
			var yt = it*xy1x[k][i].y/10 + (10-it)*item.y/10;
			var loc = {x: xt, y: yt, type: xy1x[k][i].type};
			xyti.push(loc); 
		    });
		    xytk.push(xyti);
		}
		xyt.push(xytk);
	    });
	}
    }
    return {xyt: xyt, chr: chr};
}
function getXy1x(xy1,xy2,ln1,ln2,len1,len2,dp,chr,MF,K,DANG) {
    var dot1 = dp.dot1;
    var dot2 = dp.dot2;
    var pol1 = dp.pol1;
    var pol2 = dp.pol2;
    xy1x = [];
    xy2.forEach(function(ktem, k) {
	var re = getAnimMode(chr,ln2[k],len1[k],len2[k],pol2[k],MF,DANG);
	var Q = re.flag;
	if(k > 0) { Q = true; }
	var KF = re.KF;
	//console.log("chr,Q:", chr,Q);
	var N2 = Math.round(N/2);
	var jmt = 0;
	var jm = 0;
	var xy1xk = [];
	var L2 = ktem.length;
	var L1 = xy1[k].length;
	ktem.forEach(function(item, i) {
	    var x = item.x;
	    var y = item.y;
	    var min = 1000000;
	    //console.log(pol2[k],MF,i);
	    var o2 = getOrientations(pol2[k],MF,i);
	    var flag2 = o2.t0+o2.t1;
	    var flag2x = o2.t_1+o2.t2;
	    var jmax = i*N+K*N*KF;
	    var mode = "none";
	    for(var j=jmt; j<jmax && j<M*N-1 && !Q; j++) {
		var o1 = getOrientations(pol1[k],N,j);
		var flag1 = o1.t0+o1.t1;
		var flag1x = o1.t_1+o1.t2;
		var d = getDistance(xy1[k][j],item);
		var ry = getDistanceY(xy1[k][j],item);
		var rx = getDistanceX(xy1[k][j],item);
		if(flag2x.match(/^(HH|-H-H)$/)) {
		    r = rx + 0.1*ry;
		    mode = "h";
		}
		else {
		    r = ry + 0.1*rx;
		    mode = "v";
		}
		if(r < min) {
		    min = r;
		    jm = j;
		}
	    }
	    var o1 = getOrientations(pol1[k],N,jm);
	    //console.log("i,jm,flag1,flag2,min,mode,jm,o1,o2,xy1,xy2:",i,jm,flag1,flag2,min,mode,o1,o2,xy1[k][jm],xy2[k][i]);
	    var ntype = "none";
	    if((Math.abs(o1.dalpha) > (DANG-20) && Math.abs(o1.ddalpha) > DANG)
	       && (Math.abs(o2.dalpha) > (DANG-20) && Math.abs(o2.ddalpha) > DANG)
	      ) {
		if(i > 1 && i < xy2[k].length-2) {
		    //console.log(i,"x2:",o1,o2,xy2[k][i-2],xy2[k][i-1],xy2[k][i],xy2[k][i+1],xy2[k][i+2]);
		}
		else {
		    //console.log("none");
		}
		ntype = "x";
	    }
	    /*
	    if(flag2.match(/^(HH|-H-H)$/)) {
	    	ntype = "x";
	    }*/
	    var loc = {x: xy1[k][jm].x, y: xy1[k][jm].y, type: ntype};
	    xy1xk.push(loc);
	    if(Q) { jm += N; }
	    jmt = jm + 1;
	});
	xy1x.push(xy1xk);
    });
    return xy1x;
}
function normalize(theta) {
    if(theta > 90) { theta = 180 - theta; }
    if(theta < -90) { theta = 180 + theta; }
    return theta;
}
function getOrientations(polk,m,p) {
    var L = polk.length;
    var alpha_1 = polk[L-m][0];
    if(alpha_1 == 1111111) { alpha_1 = polk[L-m-1][0]; } 
    if(p > m-1) {
	alpha_1 = polk[p-m][0];
	if(alpha_1 == 1111111 && p > m) { alpha_1 = polk[p-m-1][0]; } 
    }
    //console.log("m,p,polk:",m,p,polk);
    var alpha0 = polk[p][0];
    if(alpha0 == 1111111) { alpha0 = alpha_1; } 
    var alpha1 = polk[p][1];
    if(alpha1 == 1111111) { alpha1 = alpha0; } 
    var alpha2;
    if(p < L-m) {
	alpha2 = polk[p+m][1];
    }
    else {
	alpha2 = polk[p+m-L][1];
    }
    if(alpha2 == 1111111) { alpha2 = alpha1; } 
    var dalpha = normalize(alpha1-alpha0);
    var ddalpha = normalize(alpha2-alpha_1);
    return { alpha_1: alpha_1, alpha0: alpha0, alpha1: alpha1, alpha2: alpha2, dalpha: dalpha, ddalpha: ddalpha, t_1: dir(alpha_1), t0: dir(alpha0), t1: dir(alpha1), t2: dir(alpha2) };
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
    var del = 10;
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
    var m1 = getSlopeFromFromTwoPoints(xyA1,xyA2);
    var m2 = getSlopeFromFromTwoPoints(xyB1,xyB2);
    ang.push(getAngleFromSlope(m1));
    ang.push(getAngleFromSlope(m2));
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
    if(dx == 0 && dy == 0) { m = 1111111; }
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
    var theta = 1111111;
    if(m != 1111111) {
	theta = (180/Math.PI)*Math.atan(m);
    }
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
    var lc = 0;
    var lq = 0;
    var ll = 0;
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
	    lc += L;
	    r0 = r3;
	}
	else if(item.type == "Q") {
	    var r1 = { x: item.x1, y: item.y1};
	    var r2 = { x: item.x, y: item.y};
	    var L1 =  getDistance(r0,r2);
	    var L2 =  getDistance(r0,r1)+getDistance(r1,r2);
	    var L = 2*L2/3 + L1/3;
	    len.push(L);
	    lq += L;
	    r0 = r2;
	}
	else if(item.type == "L") {
	    var r1 = {x: item.x, y: item.y };
	    var L = getDistance(r0,r1);
	    len.push(L);
	    ll += L;
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
    var fmt = 0;
    var mt = [];
    len.forEach( function(item, i) {
	fmt += item*K/L;
	mt.push(Math.round(fmt));
    });
    var m = [];
    var ml = 0;
    mt.forEach( function(item, i) {
	if(i == 0) {
	    m.push(mt[0]);
	    ml += mt[0];
	}
	else {
	    m.push(item-mt[i-1]);
	    ml += item-mt[i-1];
	}
    });
    //console.log(ml,m);
    //---create m = (len[i]/L)*K points uniformly along the sub-paths    
    var xy = [];
    //console.log("L:",L);
    var r0 = {x: 0, y: 0 };
    for(var k in pd) {
	var item = pd[k];
	if(item.type == "M") {
	    r0.x = item.x;
	    r0.y = item.y;
	}
	else if(item.type == "C") {
	    var r1 = { x: item.x1, y: item.y1};
	    var r2 = { x: item.x2, y: item.y2};
	    var r3 = { x: item.x, y: item.y};
	    //console.log("Cubicx:",i,r0,r1,r2,r3,m)
	    var ty = "C";
	    for(var i=0; i<m[k]; i++) {
		var t = i;
		if(m[k] > 1) { t = i/(m[k]-1); };
		var r = getPointInCubicBrezier(r0,r1,r2,r3,t);
		if(i == m-1) { ty = "C_"; }
		xy.push({x: r.x, y: r.y, type: ty});
	    }
	    r0 = r3;
	}
	else if(item.type == "Q") {
	    var r1 = { x: item.x1, y: item.y1};
	    var r2 = { x: item.x, y: item.y};
	    //console.log("Quadraticx:",i,r0,r1,r2,m)
	    var ty = "Q";
	    for(var i=0; i<m[k]; i++) {
		var t = i;
		if(m[k] > 1) { t = i/(m[k]-1); };
		var r = getPointInQuadraticBrezier(r0,r1,r2,t);
		if(i == m[k]-1) { ty = "Q_"; }
		xy.push({x: r.x, y: r.y, type: ty});
	    }
	    r0 = r2;
	}
 	else if(item.type == "L") {
	    var r1 = { x: item.x, y: item.y};
	    //console.log("Linearx:",i,r0,r1,m)
	    var ty = "L";
	    for(var i=0; i<m[k]; i++) {
		var t = i;
		if(m[k] > 1) { t = i/(m[k]-1); };
		var r = getPointInLine(r0,r1,t);
		if(i == m[k]-1) { ty = "L_"; }
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
    if(xy.length != M && xy.length != M*N) {
	console.log("Len:",xy.length);
    }
    var ln = { lc: lc, lq: lq, ll: ll};
    return {xy: xy, len: L, xm: xm, ym: ym, ln: ln};
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
    
