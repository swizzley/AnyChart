if(!_.pareto){_.pareto=1;(function($){var lO=function(a){$.Pp.call(this,a);this.D=[];this.g=[];this.zf=[];this.b=0},mO=function(a,b,c,d,e){$.iy.call(this,a,b,c,d,e)},oO=function(a,b,c){if($.n(c)&&-1<c){var d=null;a=a.data();$.n(a)&&(a=a.Zk(c),$.L(a,lO)||$.L(a,nO))&&(d={},d.cf=$.Pl(a.zB(c),2),d.rf=$.Pl(a.uF(c),2))}d&&(b.cf=d.cf,b.rf=d.rf)},nO=function(a){$.Pp.call(this,a)},pO=function(){$.Ey.call(this);this.Ma=$.lr();this.Ma.Jh(0).ti(100);this.Id="pareto"},qO=function(a){if($.n(a.g)){var b=a.g;$.Jp(b);b=b.b;var c=a.Vh(0),d;c?d=c.bb():
d=a.bb();d.Jh(0);b?d.ti(b):d.ti(1)}},Yea=function(a,b){return $.nn(a)?$.nn(b)?-1:1:$.nn(b)?-1:b-a},rO=function(a){var b=new pO;b.ja.defaultSeriesType="column";b.ia(!0,$.kl("pareto"));b.data(a);return b};$.I(lO,$.Pp);$.f=lO.prototype;$.f.ta=1;$.f.tj=function(a,b,c){a=lO.F.tj.call(this,a,b,c);"value"==c&&(a=$.Q(a),(0,window.isNaN)(a)||0>a)&&(a=0);return a};
$.f.ZD=function(){this.D=[];this.g=[];this.zf=[];this.b=0;this.N(1);for(var a=this.da(),b;a.advance();)b=a.get("value"),this.zf.push(b),this.b+=b;if(this.zf.length)if(0==this.b)for(a=0;a<this.zf.length;a++)this.D[a]=0,this.g[a]=0;else for(this.D[0]=this.g[0]=100*this.zf[0]/this.b,a=1;a<this.zf.length;a++)this.D[a]=100*this.zf[a]/this.b,this.g[a]=this.g[a-1]+100*this.zf[a]/this.b;return null};$.f.OG=function(a){this.us=null;$.W(a,16)&&this.B(1,16)};$.f.zB=function(a){return this.g[a]};$.f.uF=function(a){return this.D[a]};
$.f.ue=function(a){return this.zf[a]};$.I(mO,$.iy);$.f=mO.prototype;$.f.kD={"%BubbleSize":"size","%RangeStart":"low","%RangeEnd":"high","%XValue":"x","%CF":"cf","%RF":"rf"};$.f.mp=function(a,b){var c=mO.F.mp.call(this,a,b),d=this.data(),e;$.n(d)&&$.n(c.index)&&-1<(e=Number(c.index.value))&&(d=d.Zk(e),$.L(d,lO)||$.L(d,nO))&&(c.cf={value:$.Pl(d.zB(e),2),type:"number"},c.rf={value:$.Pl(d.uF(e),2),type:"number"});return c};$.f.gf=function(a,b){var c=mO.F.gf.call(this,a,b);oO(this,c,c.index);return c};
$.f.Sh=function(a){a=mO.F.Sh.call(this,a);oO(this,a,a.index);return a};$.f.Td=function(a){var b=mO.F.Td.call(this,a);oO(this,b,a);return b};$.I(nO,$.Pp);nO.prototype.tj=function(a,b,c){return"value"==c?this.Gd.zB(b):nO.F.tj.call(this,a,b,c)};nO.prototype.zB=function(a){return this.Gd.zB(a)};nO.prototype.uF=function(a){return this.Gd.uF(a)};$.I(pO,$.Ey);
pO.prototype.data=function(a,b){if($.n(a)){if(a){var c=a.title||a.caption;c&&this.title(c);a.rows&&(a=a.rows)}if(this.Gz!==a){this.Gz=a;$.M(this.jl);$.L(a,$.Ip)?this.Gd=this.jl=a.vm():$.L(a,$.Sp)?this.Gd=this.jl=a.Oe():this.Gd=(this.jl=new $.Sp($.C(a)||$.y(a)?a:null,b)).Oe();$.V(this);this.g&&$.Bp(this.g,this.ef,this);$.M(this.g);this.g=new lO(this.Gd.sort("value",Yea));$.U(this.g,this.ef,this);qO(this);c=this.Vh(0);var d=this.Vh(1);this.K&&$.M(this.K);this.K=this.g.vm();c||(c=this.column());c.data(this.K);
this.Fa&&$.M(this.Fa);this.Fa=new nO(this.g);d||(d=this.line().clip(!1).zb(!0).bb(this.Ma));d.data(this.Fa);this.ga(!0)}return this}return this.g};pO.prototype.ef=function(a){$.W(a,16)&&qO(this)};var sO={},tO=$.jy|7864320;sO.area={xb:1,Ab:1,Fb:[$.SC,$.TC,$.UC],Db:null,yb:null,wb:tO,ub:"value",tb:"zero"};sO.bar={xb:6,Ab:2,Fb:[$.gD,$.UC],Db:null,yb:null,wb:tO,ub:"value",tb:"zero"};sO.box={xb:3,Ab:2,Fb:[$.gD,$.UC,$.rJ,$.sJ,$.tJ],Db:null,yb:null,wb:tO,ub:"highest",tb:"lowest"};
sO.bubble={xb:4,Ab:2,Fb:[$.VC,$.WC,$.XC,$.YC],Db:null,yb:null,wb:tO,ub:"value",tb:"value"};sO.candlestick={xb:5,Ab:2,Fb:[$.ZC,$.aD,$.bD,$.dD],Db:null,yb:null,wb:tO,ub:"high",tb:"low"};sO.column={xb:6,Ab:2,Fb:[$.gD,$.UC],Db:null,yb:null,wb:tO,ub:"value",tb:"zero"};sO["jump-line"]={xb:19,Ab:2,Fb:[$.TC],Db:null,yb:null,wb:tO,ub:"value",tb:"value"};sO.stick={xb:20,Ab:2,Fb:[$.TC],Db:null,yb:null,wb:tO,ub:"value",tb:"zero"};sO.line={xb:8,Ab:1,Fb:[$.TC],Db:null,yb:null,wb:tO,ub:"value",tb:"value"};
sO.marker={xb:9,Ab:2,Fb:[$.gD,$.UC],Db:null,yb:null,wb:$.jy|3670016,ub:"value",tb:"value"};sO.ohlc={xb:10,Ab:2,Fb:[$.$C,$.cD],Db:null,yb:null,wb:tO,ub:"high",tb:"low"};sO["range-area"]={xb:11,Ab:1,Fb:[$.SC,$.fD,$.eD,$.UC],Db:null,yb:null,wb:tO,ub:"high",tb:"low"};sO["range-bar"]={xb:12,Ab:2,Fb:[$.gD,$.UC],Db:null,yb:null,wb:tO,ub:"high",tb:"low"};sO["range-column"]={xb:12,Ab:2,Fb:[$.gD,$.UC],Db:null,yb:null,wb:tO,ub:"high",tb:"low"};
sO["range-spline-area"]={xb:13,Ab:1,Fb:[$.SC,$.eD,$.fD,$.UC],Db:null,yb:null,wb:tO,ub:"high",tb:"low"};sO["range-step-area"]={xb:14,Ab:1,Fb:[$.SC,$.eD,$.fD,$.UC],Db:null,yb:null,wb:tO,ub:"high",tb:"low"};sO.spline={xb:15,Ab:1,Fb:[$.TC],Db:null,yb:null,wb:tO,ub:"value",tb:"value"};sO["spline-area"]={xb:16,Ab:1,Fb:[$.SC,$.TC,$.UC],Db:null,yb:null,wb:tO,ub:"value",tb:"zero"};sO["step-area"]={xb:17,Ab:1,Fb:[$.SC,$.TC,$.UC],Db:null,yb:null,wb:tO,ub:"value",tb:"zero"};
sO["step-line"]={xb:18,Ab:1,Fb:[$.TC],Db:null,yb:null,wb:tO,ub:"value",tb:"value"};pO.prototype.Mi=sO;$.Hw(pO,pO.prototype.Mi);$.f=pO.prototype;$.f.du=function(a,b){return new mO(this,this,a,b,!0)};$.f.Sy=function(){return $.hr};$.f.HB=function(){return["Pareto chart xScale","ordinal"]};$.f.zF=function(){return 3};$.f.zK=function(){return["Pareto chart yScale","scatter","linear, log"]};$.f.AB=function(){return[this]};$.f.MQ=function(){return["value","CF","RF"]};
$.f.h0=function(a,b,c){b=c.na();c=this.g.Zk(b);a[1]=c.ue(b);a[2]=c.zB(b);a[3]=c.uF(b)};$.f.qk=function(a){this.O(131072)&&qO(this);return pO.F.qk.call(this,a)};$.f.PY=function(){return this.Wa()};$.f.W=function(){$.rd(this.g,this.Gd,this.jl,this.K,this.Fa);this.Fa=this.K=this.jl=this.Gd=this.g=null;$.M(this.Ma);this.Ma=null;pO.F.W.call(this)};$.f.J=function(){var a=pO.F.J.call(this);$.n(this.data())&&(a.chart.data=this.data().J());return a};
$.f.$=function(a,b){pO.F.$.call(this,a,b);b&&this.Gj(1).scale(this.Ma);"data"in a&&this.data(a.data)};var uO=pO.prototype;uO.data=uO.data;uO.xScale=uO.Wa;uO.yScale=uO.bb;uO.crosshair=uO.dg;uO.maxBubbleSize=uO.fC;uO.minBubbleSize=uO.iC;uO.xGrid=uO.Oo;uO.yGrid=uO.Qo;uO.xMinorGrid=uO.eq;uO.yMinorGrid=uO.gq;uO.xAxis=uO.gi;uO.getXAxesCount=uO.GB;uO.yAxis=uO.Gj;uO.getYAxesCount=uO.IB;uO.getSeries=uO.We;uO.lineMarker=uO.vo;uO.rangeMarker=uO.Fo;uO.textMarker=uO.No;uO.palette=uO.ec;uO.markerPalette=uO.kf;
uO.hatchFillPalette=uO.Ud;uO.getType=uO.Sa;uO.addSeries=uO.Kk;uO.getSeriesAt=uO.Vh;uO.getSeriesCount=uO.bm;uO.removeSeries=uO.Go;uO.removeSeriesAt=uO.An;uO.removeAllSeries=uO.Np;uO.getPlotBounds=uO.Pf;uO.xZoom=uO.ql;uO.xScroller=uO.Po;uO.getStat=uO.mg;uO.annotations=uO.Jj;uO.getXScales=uO.Ow;uO.getYScales=uO.Pw;$.qo.pareto=rO;$.H("anychart.pareto",rO);}).call(this,$)}
