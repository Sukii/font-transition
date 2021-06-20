var MAX = 1000000;
var M = 500;
var mM = 100;
var N = 10;
var Xo = 0;
var Yo = 0;
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
    var r = getOrigin(chr);
    var X0 = r.x;
    var Y0 = r.y;    
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
	    xy2.push(rotateArray(pp.xy,X0,Y0));
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
    var X0 = Xo;
    var Y0 = Yo;
    return {x: X0, y: Y0};
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
function rotateArray(arr,X0,Y0) {
    var istart = getTopLeftIndex(arr,X0,Y0);
    var prevArray = arr.slice(0,istart);
    var nextArray = arr.slice(istart);
    return nextArray.concat(prevArray);
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
	    xy1 = resetOriginForXy1(xy1,xy2,chr);
	    var xy1x = getXy1x(xy1,xy2,ln1,ln2,len1,len2,chr,MF,K,DANG);
	    xy2.forEach(function(ktem, k) {
		var xytk = [];
		for(var it=0; it<11; it++) {
		    var xyti = [];
		    ktem.forEach(function(item, i) {
			var x1 = xy1x[k][i].x;
			var x2 = item.x;
			var y1 = xy1x[k][i].y;
			var y2 = item.y;
			var xt = it*x1/10 + (10-it)*x2/10;
			var yt = it*y1/10 + (10-it)*y2/10;
			var loc = {x: xt, y: yt, type: xy2[k][i].type};
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
function getXy1x(xy1,xy2,ln1,ln2,len1,len2,chr,MF,K,DANG) {
    xy1x = [];
    var m1 = getSlopeArray(xy1);
    var dm1 = getDiffSlopeArray(m1);
    var m2 = getSlopeArray(xy2);
    var dm2 = getDiffSlopeArray(m2);
    var minerr = 100;
    var minn = 0;
    var xy1xn = [];
    if(K[chr]) { DANG = [0]; }
    DANG.forEach(function(dang,n) {
	var xy1x = [];
	xy2.forEach(function(ktem, k) {
	    var Q = false;
	    if(dang < 1) { Q = true; }
	    if(k > 0) { Q = true; }
	    var N2 = Math.round(N/2);
	    var jmt = 0;
	    var jm = 0;
	    var xy1xk = [];
	    var L2 = ktem.length;
	    var L1 = xy1[k].length;
	    ktem.forEach(function(item, i) {
		var x = item.x;
		var y = item.y;
		var xy2type = item.type;
		var m2i = m2[k][i];
		var m2i1 = (i < L2-1) ? m2[k][i+1] : m2[k][0];
		var m2i2 = (i < L2-2) ? m2[k][i+2] : (i == L2-2) ? m2[k][0] : m2[k][1];
		var dm2iv = dm2[k][i];
		var dm2iv1 = (i < L2-1) ? dm2[k][i+1] : dm2[k][0];
		var min = 1000000;
		var jmax = i*N+dang*N;
		var mode = "none";
		if(!Q) {
		    for(var j=jmt; j<jmax && j<M*N-1; j++) {
			var xy1type = xy1[k][j].type;
			var d = getDistance(xy1[k][j],item);
			var ry = getDistanceY(xy1[k][j],item);
			var rx = getDistanceX(xy1[k][j],item);
			var m1j = m1[k][j];
			var m1j1 = (j < L1-1) ? m1[k][j+1] : m1[k][0];
			var dm1jv = dm1[k][j];
			var dm1jv1 = (j < L1-1) ? dm1[k][j+1] : dm1[k][0];
			if(dm2iv+dm2iv1 > 40 && dm2iv+dm2iv1 < 180) {
			    if(dm1jv+dm1jv1 > 40 && dm1jv+dm1jv1 < 180) {
				r = (rx+ry)/100;
				if(r < min) { mode = "R0"; }
			    }
			    else {
				r = rx + ry;
				if(r < min) { mode = "R1"; }
			    }
			}
			else if(Math.abs(m2i) > 55 || Math.abs(m2i1) > 55) {
			    r = ry;
			    if(r < min) { mode = "V"; }
			}
			else if(Math.abs(m2i) < 12 || Math.abs(Math.abs(m2i)-180) < 12) {
			    if(Math.abs(m1j) < 12 || Math.abs(Math.abs(m1j)-180) < 12) {
				r = rx;
				if(r < min) { mode = "H"; }
			    }
			}
			else {
			    r = rx+ry;
			    if(r < min) { mode = "x"; }
			}
			if(r < min) {
			    min = r;
			    jm = j;
			}
		    }
		    var ntype = "none";
		    if(mode == "R0" || mode == "R1") {
			ntype = "x";
		    }
		    jmt = jm + 1;
		}
		var loc = {x: xy1[k][jm].x, y: xy1[k][jm].y, type: ntype};
		if(Q) { jm += N; }
		xy1xk.push(loc);
	    });
	    xy1x.push(xy1xk);
	});
	xy1xn.push(xy1x);
	errn = getError(xy2,xy1x);
	if(errn < minerr) {
	    minerr = errn;
	    minn = n;
	}
    });
    console.log(chr,DANG[minn],minerr);
    return xy1xn[minn];
}
function getError(xy2,xy1x) {
    var err = 0;
    var NP = 0;
    xy2.forEach(function(ktem, k) {
	ktem.forEach(function(item, i) {
	    var x1 = xy1x[k][i].x;
	    var x2 = item.x;
	    var y1 = xy1x[k][i].y;
	    var y2 = item.y;
	    err += (x1-x2)**2+(y1-y2)**2;
	    NP++;
	});
    });
    var sigma = Math.sqrt(err/NP);
    return sigma;
}
function normalize(theta) {
    if(theta > 90) { theta = 180 - theta; }
    if(theta < -90) { theta = 180 + theta; }
    return theta;
}
function resetOriginForXy1(xy1,xy2,chr) {
    var r = getOrigin(chr);
    var X0 = r.x;
    var Y0 = r.y;
    var Q = false;
    if(chr.match(/^[cegosCOQ]$/)) {
	Q = true;
    }
    xy1.forEach(function(item, i) {
	var arr = xy1[i];
	if(Q) {
	    X0 = xy2[i][0].x;
	    Y0 = xy2[i][0].y;
	}
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
function getSlopeArray(xy) {
    function getSlope(xya,xyb) {
	var ang = 90;
	var dx = xyb.x-xya.x;
	var dy = xyb.y-xya.y;
	if(Math.abs(dx) == 0) {
	    ang = 90*Math.sign(dy);
	}
	else {
	    m = dy/dx;
	    ang = 180*Math.atan(Math.abs(m))/Math.PI;
	    if(dx > 0 && dy > 0) { ang = ang; }
	    else if(dx < 0 && dy >= 0) { ang = 180-ang; }
	    else if(dx < 0 && dy < 0) { ang = ang-180; }
	    else if(dx > 0 && dy <= 0) { ang = -ang; }
	}
	return ang;
    }
    var dxy = [];
    xy.forEach(function(ktem, k) {
	var M = ktem.length;
	var xyarr = [];
	ktem.forEach(function(item, i) {
	    var ktem_1 = (i == 0) ? ktem[M-1] : ktem[i-1];
	    xyarr.push(getSlope(ktem_1,item));
	});
	dxy.push(xyarr);
    });
    return dxy;
}

function getDiffSlopeArray(xy) {
    function normalizeAngle(ang) {
	if(ang > 180) { ang = ang-360; }
	if(ang < -180) { ang = ang+360; }
	return ang;
    }
    var dxy = [];
    xy.forEach(function(ktem, k) {
	var M = ktem.length;
	var xyarr = [];
	ktem.forEach(function(item, i) {
	    var ktem_1 = (i == 0) ? ktem[M-1] : ktem[i-1];
	    xyarr.push(normalizeAngle(item-ktem_1));
	});
	dxy.push(xyarr);
    });
    return dxy;
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
function getPathPoints(pd,NP) {
    var ds = 1/(NP-1);
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
	    //var L = 0;
	    //len.push(L);
	}
	else {
	    console.log("spline item type: " + item.type +  "; not yet handled!! error!!");
	    fail;
	}
    };
    var L = 0;
    len.forEach( function(item, i) {
	L += item;
    });
    var fc = 0;
    var mfc = [];
    var mf = [];
    len.forEach( function(item, i) {
	var f= item/L;
	fc += f;
	mf.push(f);
	mfc.push(fc);
    });
    mfc[mfc.length-1] = 1.0;
    var xy = [];
    var r0 = {x: 0, y: 0 };
    for(var i=0; i < NP;  i++) {
	var k = 0;
	var s = i*ds;
        mfc.forEach( function(item, j) {
	    if(j > 0 && s >= mfc[j-1] && (s < item || j == mfc.length-1)) {
		k = j;
	    }
	});	
	var item = pd[k];
	var t = (k == 0 || mf[k] == 0) ? 0 : (s - mfc[k-1])/mf[k];
	var dt = (mf[k] == 0) ? 0 : ds/mf[k];
	if(t+dt > 1.0) { t = 1.0; }
	if(k > 0) {
	    //--Here setting r0 initial condition from previous spline--//
	    var prevItem = pd[k-1];
	    if(prevItem.type.match(/^(M|C|Q|L)$/)) {
		r0 = { x: prevItem.x, y: prevItem.y};
	    }
	}
	//----Now procesing the node arrays----//
	if(item.type == "C") {
	    var r1 = {x: item.x1, y: item.y1};
	    var r2 = {x: item.x2, y: item.y2};
	    var r3 = {x: item.x, y: item.y};
	    var ty = (t == 1.0) ? "C_" : "C";
	    var r = getPointInCubicBrezier(r0,r1,r2,r3,t);
	    xy.push({x: r.x, y: r.y, type: ty});
	}
	else if(item.type == "Q") {
	    var r1 = { x: item.x1, y: item.y1};
	    var r2 = { x: item.x, y: item.y};
	    var ty = (t == 1.0) ? "Q_" : "Q";
	    var r = getPointInQuadraticBrezier(r0,r1,r2,t);
	    xy.push({x: r.x, y: r.y, type: ty});
	}
 	else if(item.type == "L") {
	    var r1 = { x: item.x, y: item.y};
	    var ty = (t == 1.0) ? "L_" : "L";
	    var r = getPointInLine(r0,r1,t);
	    xy.push({x: r.x, y: r.y, type: ty});
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
    
