/* RE Ironwork, shared behaviour. The job ticket (your current door) lives in the URL when you
   move between pages and in sessionStorage for this visit only. Nothing here is sent anywhere. */
(function(){
  "use strict";
  var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PAGE=document.body.dataset.page;

  /* ---------- catalogue ---------- */
  var AX=["config","style","finish","glass"];
  var NAMES={
    config:{double:"Double",single:"Single"},
    style:{tuscan:"Tuscan",modern:"Modern",gothic:"Gothic",deco:"Art Deco",flush:"Flush"},
    finish:{black:"Forged black",bronze:"Oil-rubbed bronze",patina:"Aged patina",pewter:"Antique pewter"},
    glass:{clear:"Clear glass",frosted:"Frosted glass",reeded:"Reeded glass"}
  };
  var CODE={config:{double:"D",single:"S"},style:{tuscan:"TUS",modern:"MOD",gothic:"GOT",deco:"DEC",flush:"FLU"},
            finish:{black:"BLK",bronze:"BRZ",patina:"PAT",pewter:"PEW"},glass:{clear:"CLR",frosted:"FRO",reeded:"RED"}};
  var OPEN={double:"72 x 96 in",single:"42 x 96 in"};
  var LEAD={tuscan:"14-16 weeks",modern:"12-14 weeks",gothic:"14-16 weeks",deco:"13-15 weeks",flush:"12 weeks"};
  var PRICE={single:{tuscan:14800,modern:9800,gothic:15200,deco:13600,flush:10400},
             double:{tuscan:26500,modern:16000,gothic:27800,deco:24200,flush:17500}};
  var ADD={finish:{black:0,bronze:900,patina:1400,pewter:1200},glass:{clear:0,frosted:350,reeded:600}};
  var DEF={config:"double",style:"tuscan",finish:"black",glass:"clear"};
  var AVAILABLE=window.__DOORS||null;

  function keyOf(s){return s.config+"-"+s.style+"-"+s.finish+"-"+s.glass}
  function parse(k){var p=String(k||"").split("-");if(p.length!==4)return null;var s={};
    for(var i=0;i<4;i++){if(!NAMES[AX[i]][p[i]])return null;s[AX[i]]=p[i]}return s}
  function codeOf(s){return "RE-"+CODE.config[s.config]+"-"+CODE.style[s.style]+"-"+CODE.finish[s.finish]+"-"+CODE.glass[s.glass]}
  function nameOf(s){return NAMES.config[s.config]+" "+NAMES.style[s.style]}
  function specOf(s){return NAMES.finish[s.finish].toLowerCase()+", "+NAMES.glass[s.glass].toLowerCase()}
  function priceOf(s){return PRICE[s.config][s.style]+ADD.finish[s.finish]+ADD.glass[s.glass]}
  function money(n){return "$"+n.toLocaleString("en-US")}
  function img(k,thumb){return "img/doors/"+k+(thumb?".thumb":"")+".webp"}
  function has(k){return !AVAILABLE||AVAILABLE.indexOf(k)>=0}

  /* ---------- the ticket ---------- */
  function store(k,v){try{v==null?sessionStorage.removeItem(k):sessionStorage.setItem(k,v)}catch(e){}}
  function load(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
  var fromUrl=parse(new URLSearchParams(location.search).get("d"));
  var state=fromUrl||parse(load("re-door"))||Object.assign({},DEF);
  var chosen=!!(fromUrl||load("re-door"));
  var tno=load("re-ticket");
  if(!tno){var d=new Date(),a="ABCDEFGHJKMNPQRSTUVWXYZ23456789",r="";for(var i=0;i<3;i++)r+=a[Math.floor(Math.random()*a.length)];
    tno="RE-"+String(d.getMonth()+1).padStart(2,"0")+String(d.getDate()).padStart(2,"0")+"-"+r;store("re-ticket",tno)}
  function commit(s){state=Object.assign({},s);chosen=true;store("re-door",keyOf(state));
    try{history.replaceState(null,"",location.pathname+"?d="+keyOf(state)+location.hash)}catch(e){}paintChip()}
  function withDoor(href){return href.split("?")[0]+"?d="+keyOf(state)}

  /* nav chip + any link that should carry the ticket */
  function paintChip(){
    $$("[data-ticket-chip]").forEach(function(a){
      a.href=withDoor("quote.html");
      var im=a.querySelector("img"); if(im){im.src=img(keyOf(state),true);im.alt=""}
      var t=a.querySelector(".t2"); if(t)t.textContent=chosen?codeOf(state):"Start one";
    });
    $$("[data-carry]").forEach(function(a){a.href=withDoor(a.getAttribute("data-carry"))});
    $$("[data-ticket-thumb]").forEach(function(im){im.src=img(keyOf(state),true);im.alt=nameOf(state)+" door"});
    $$("[data-ticket-code]").forEach(function(el){el.textContent=codeOf(state)});
    $$("[data-ticket-name]").forEach(function(el){el.textContent=nameOf(state)});
    $$("[data-ticket-spec]").forEach(function(el){el.textContent=specOf(state)});
    $$("[data-ticket-no]").forEach(function(el){el.textContent=tno});
  }

  /* mobile menu */
  var mb=$(".menu-btn"), nl=$(".nav-links");
  if(mb&&nl)mb.addEventListener("click",function(){var o=nl.classList.toggle("open");mb.setAttribute("aria-expanded",String(o))});

  /* reveal */
  var rv=$$("[data-rv]");
  if(!("IntersectionObserver" in window)||RM){rv.forEach(function(e){e.classList.add("in")})}
  else{var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{rootMargin:"0px 0px -6% 0px"});rv.forEach(function(e){io.observe(e)})}

  /* ================= HOME ================= */
  if(PAGE==="home"){
    /* ---------- hero carousel (port of 21st.dev Hero Carousel) ---------- */
    var hc=$("#hc");
    if(hc){
      var HC_KEYS=["double-gothic-patina-clear","single-deco-bronze-clear","double-modern-pewter-clear","double-tuscan-black-clear",
        "single-tuscan-bronze-reeded","double-flush-black-clear","double-deco-patina-frosted","single-gothic-black-clear",
        "double-tuscan-pewter-clear","single-modern-bronze-reeded","double-gothic-bronze-frosted","single-flush-pewter-clear",
        "double-deco-black-reeded","single-tuscan-patina-clear","double-modern-black-frosted"];
      var ACCENT={black:"#2e3845",bronze:"#8a4d1a",patina:"#2d5c4b",pewter:"#5b6977"};
      var items=HC_KEYS.map(parse).filter(Boolean), idx=3, last=items.length-1;
      var track=$("#hcTrack"), strip=$("#hcStrip"), head=$("#hcHead"), bg=$("#hcBg");
      var geo={w:0,h:0,full:0,half:0,cw:0,gap:0,step:0}, cards=[];
      var dragging=false,moved=false,sx=0,bx=0,lx=0,lt=0,vx=0,paused=false,curX=0;
      items.forEach(function(s,i){
        var b=document.createElement("button");b.type="button";b.className="hc-card";
        var im=document.createElement("img");im.src=img(keyOf(s));im.alt="";im.draggable=false;if(i>7)im.loading="lazy";
        b.appendChild(im);track.appendChild(b);cards.push(b);
        b.addEventListener("click",function(e){if(moved){e.preventDefault();return}
          if(i===idx){location.href="build.html?d="+keyOf(s)}else go(i)});
      });
      function measure(){
        geo.w=hc.clientWidth;geo.h=hc.clientHeight;
        var ft=hc.querySelector(".hc-foot"),room=ft.offsetTop-Math.round(geo.h*0.5)-18;
        geo.full=Math.max(150,Math.min(460,geo.h*0.37,room));geo.small=Math.round(geo.full*0.62);
        geo.cw=geo.full*0.75;geo.sw=geo.small*0.75;
        geo.gap=Math.max(8,Math.round(geo.cw*0.06));geo.step=geo.sw+geo.gap;
        var top=Math.round(geo.h*0.5);
        strip.style.top=top+"px";strip.style.height=geo.full+"px";
        head.style.bottom=(geo.h-top+Math.round(geo.h*0.028))+"px";
        track.style.gap=geo.gap+"px";
        $("#hcTitle").style.fontSize=Math.max(34,Math.round(geo.h*0.078))+"px";
        place(false);
      }
      function xFor(i){return geo.w/2-(i*geo.step+geo.cw/2)}
      function nearest(x){return Math.round((geo.w/2-x-geo.cw/2)/geo.step)}
      function setX(x,anim){curX=x;track.classList.toggle("drag",!anim);track.style.transform="translate3d("+x+"px,0,0)"}
      function place(anim){setX(xFor(idx),anim!==false);
        cards.forEach(function(c,i){var s=items[i];var on=i===idx;c.style.height=(on?geo.full:geo.small)+"px";c.style.width=(on?geo.cw:geo.sw)+"px";c.setAttribute("aria-current",String(i===idx));
          c.setAttribute("aria-label",(i===idx?"Open ":"Show ")+nameOf(s)+", "+specOf(s)+(i===idx?" in the configurator":""))})}
      function paintBg(){
        var s=items[idx],L=document.createElement("div");L.className="hc-layer";
        L.innerHTML='<img alt="" src="'+img(keyOf(s))+'"><div class="tint" style="background:'+ACCENT[s.finish]+'"></div><div class="shade" style="background:'+ACCENT[s.finish]+'"></div>';
        bg.appendChild(L);setTimeout(function(){L.classList.add("on")},30);
        var old=$$(".hc-layer",bg).slice(0,-1);setTimeout(function(){old.forEach(function(o){o.remove()})},RM?40:900);
      }
      function paintText(){
        var s=items[idx];
        $("#hcTitle").innerHTML='<span class="ln"><span>'+NAMES.config[s.config]+'</span></span><span class="ln"><span style="animation-delay:.07s">'+NAMES.style[s.style]+'</span></span>';
        var cr=$("#hcCredit");cr.textContent=specOf(s);cr.style.animation="none";void cr.offsetWidth;cr.style.animation="";
        $("#hcMeta").innerHTML='<span class="data">'+codeOf(s)+'</span><span class="data" style="animation-delay:.06s">From '+money(priceOf(s))+'</span><span class="data" style="animation-delay:.12s">'+LEAD[s.style]+'</span>';
        $("#hcNow").textContent=String(idx+1).padStart(2,"0");
        $("#hcBar").style.left=(idx/items.length*100)+"%";
        $("#hcBuild").href="build.html?d="+keyOf(s);
      }
      function go(n){n=Math.max(0,Math.min(last,n));if(n===idx){place();return}idx=n;place();paintBg();paintText()}
      $("#hcTotal").textContent=String(items.length).padStart(2,"0");$("#hcBar").style.width=(100/items.length)+"%";

      /* drag and swipe */
      track.addEventListener("pointerdown",function(e){if(e.button!==0)return;dragging=true;moved=false;sx=lx=e.clientX;lt=e.timeStamp;bx=curX;vx=0;paused=true});
      addEventListener("pointermove",function(e){if(!dragging)return;var dx=e.clientX-sx;
        if(Math.abs(dx)>5&&!moved){moved=true}
        if(!moved)return;var x=bx+dx,lo=xFor(last),hi=xFor(0);if(x>hi)x=hi+(x-hi)*.08;if(x<lo)x=lo+(x-lo)*.08;setX(x,false);
        var dt=Math.max(1,e.timeStamp-lt);vx=(e.clientX-lx)/dt;lx=e.clientX;lt=e.timeStamp});
      addEventListener("pointerup",function(){if(!dragging)return;dragging=false;paused=false;
        if(moved){var thrown=curX+vx*120;go(nearest(thrown));setTimeout(function(){moved=false},0)}});
      /* horizontal trackpad swipes step the strip; vertical scrolling always belongs to the page */
      var acc=0,until=0;
      hc.addEventListener("wheel",function(e){if(Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;
        if((e.deltaX>0&&idx===last)||(e.deltaX<0&&idx===0)){acc=0;return}
        e.preventDefault();if(e.timeStamp<until)return;acc+=e.deltaX;if(Math.abs(acc)<60)return;go(idx+(acc>0?1:-1));acc=0;until=e.timeStamp+420},{passive:false});
      hc.addEventListener("keydown",function(e){var m={ArrowLeft:idx-1,ArrowRight:idx+1,Home:0,End:last};if(!(e.key in m))return;
        e.preventDefault();go(m[e.key])});
      /* autoplay, paused while the pointer or focus is inside */
      hc.addEventListener("pointerenter",function(){paused=true});hc.addEventListener("pointerleave",function(){if(!dragging)paused=false});
      hc.addEventListener("focusin",function(){paused=true});hc.addEventListener("focusout",function(){paused=false});
      if(!RM)setInterval(function(){if(paused||document.hidden)return;go(idx===last?0:idx+1)},4800);
      if("ResizeObserver" in window)new ResizeObserver(measure).observe(hc);else addEventListener("resize",measure);
      measure();paintBg();paintText();
    }

    /* ---------- scroll gallery (port of 21st.dev Scroll Gallery) ---------- */
    var sg=$("#sg");
    if(sg){
      var SL=[
        {t:"Measure",w:"Week 1",h:"process.html#measure",i:"img/site/measure.webp",n:"We template your opening ourselves. Plumb, square and header height decide more of the design than taste."},
        {t:"Draw",w:"Weeks 2-3",h:"process.html#draw",i:"img/site/drawing.webp",n:"Your ticket becomes a full-size drawing. Nothing is cut until you sign it."},
        {t:"Forge",w:"Weeks 4-12",h:"process.html#forge",i:"img/forge.webp",n:"Six to ten weeks at the anvil, with photographs at the frame, the ornament and the glazing."},
        {t:"Finish",w:"Weeks 12-14",h:"process.html#finish",i:"img/site/finish.webp",n:"Applied by hand and approved on an offcut from your own door."},
        {t:"Hang",w:"Weeks 14-16",h:"process.html#install",i:"img/site/install.webp",n:"The crew that built it hangs it, then comes back at ninety days."}];
      var STRIPS=20, PER=90, INIT=35, FIN=35, SF=RM?1:1.25, ST=1, SSTEP=(SF-ST)/2, SPEED=2, TH=.3;
      var total=INIT+(SL.length-1)*PER+FIN;
      var HIDE="linear-gradient(to bottom,transparent 0%,transparent 100%)", SHOW="linear-gradient(to bottom,black 0%,black 100%)";
      sg.style.height="calc("+total+"vh + 100svh - 64px)";
      var images=$("#sgImages"), first=images.querySelector("img"), titleEl=$("#sgTitle"), link=$("#sgLink"), note=$("#sgNote"), dots=$$("#sgSteps i");
      function setMask(el,v){el.style.maskImage=v;el.style.webkitMaskImage=v}
      var layers=[];
      for(var q=1;q<SL.length;q++){var box=document.createElement("div");box.className="sg-layer";var im2=document.createElement("img");
        im2.src=SL[q].i;im2.alt=SL[q].t;im2.decoding="async";setMask(im2,HIDE);
        box.appendChild(im2);images.appendChild(box);layers.push({img:im2,ti:q-1,state:"hidden"})}
      var bounds=[];for(var j=0;j<STRIPS;j++){var fromBottom=STRIPS-j-1,stp=100/STRIPS;bounds.push({lower:(fromBottom+1)*stp,upper:fromBottom*stp-.1,delay:j/STRIPS*.5})}
      function stripMask(p){var iv=[];bounds.forEach(function(b){var a=Math.max(0,Math.min(1,(p-b.delay)*SPEED));if(a<=0)return;iv.push({top:b.lower-a*(b.lower-b.upper),bottom:b.lower})});
        if(!iv.length)return HIDE;
        iv.sort(function(a,b){return a.top-b.top});var m=[Object.assign({},iv[0])];
        for(var k=1;k<iv.length;k++){var l=m[m.length-1];if(iv[k].top<=l.bottom)l.bottom=Math.max(l.bottom,iv[k].bottom);else m.push(Object.assign({},iv[k]))}
        var st=[],c=0;m.forEach(function(r){if(r.top>c)st.push("transparent "+c+"%","transparent "+r.top+"%");st.push("black "+r.top+"%","black "+r.bottom+"%");c=r.bottom});
        if(c<100)st.push("transparent "+c+"%","transparent 100%");return "linear-gradient(to bottom,"+st.join(",")+")"}
      var ranges=[],pos=INIT;for(var r=0;r<SL.length-1;r++){ranges.push([pos/total,(pos+PER)/total]);pos+=PER}
      function imgProgress(p){if(p<ranges[0][0])return 0;if(p>ranges[ranges.length-1][1])return ranges.length;
        for(var i=0;i<ranges.length;i++){if(p>=ranges[i][0]&&p<=ranges[i][1])return i+(p-ranges[i][0])/(ranges[i][1]-ranges[i][0])}return ranges.length}
      function scaleFor(ii,cur,pr){var d=cur+pr-ii;if(d<=0)return SF;if(d>=2)return ST;return SF-SSTEP*d}
      function setScale(el,v){el.style.transform="translate3d(0,0,0) scale("+v+")"}
      var curTitle=0,queued=null,busy=false,lastP=0;
      function showTitle(n,dir){if(n===curTitle)return;if(busy){queued=n;return}busy=true;
        var out=dir==="down"?"-120%":"120%",inn=dir==="down"?"120%":"-120%";
        link.href=SL[n].h;link.textContent=SL[n].w;note.style.opacity=0;
        dots.forEach(function(d,k){d.classList.toggle("on",k===n)});
        titleEl.style.transition="";titleEl.style.transform="translateY("+out+")";
        setTimeout(function(){titleEl.textContent=SL[n].t;note.textContent=SL[n].n;note.style.opacity=1;
          titleEl.style.transition="none";titleEl.style.transform="translateY("+inn+")";void titleEl.offsetWidth;
          titleEl.style.transition="";titleEl.style.transform="translateY(0)";
          setTimeout(function(){curTitle=n;busy=false;if(queued!==null&&queued!==curTitle){var nx=queued;queued=null;showTitle(nx,dir)}},RM?0:300)},RM?0:300)}
      function update(p){var ip=imgProgress(p),dir=ip>lastP?"down":"up",ci=Math.floor(ip),sp=ip-ci;
        var want=sp>=TH?Math.min(ci+1,SL.length-1):ci;if(want!==curTitle){queued=want;if(!busy)showTitle(want,dir)}
        setScale(first,scaleFor(0,ci,sp));
        layers.forEach(function(L){setScale(L.img,scaleFor(L.ti,ci,sp));
          if(L.ti<ci){if(L.state!=="shown"){setMask(L.img,SHOW);L.state="shown"}}
          else if(L.ti===ci){L.state="anim";setMask(L.img,RM?(sp>=TH?SHOW:HIDE):stripMask(sp))}
          else if(L.state!=="hidden"){setMask(L.img,HIDE);L.state="hidden"}});
        lastP=ip}
      var target=0,cur=0,running=false,pinEl=sg.querySelector(".sg-pin");
      function readTarget(){var rc=sg.getBoundingClientRect(),dist=rc.height-pinEl.offsetHeight;
        target=dist>0?Math.max(0,Math.min(1,(64-rc.top)/dist)):0}
      function loop(){var d=target-cur;cur=(RM||Math.abs(d)<.0004)?target:cur+d*.14;update(cur);if(cur!==target)requestAnimationFrame(loop);else running=false}
      function kick(){readTarget();if(!running){running=true;requestAnimationFrame(loop)}}
      addEventListener("scroll",kick,{passive:true});addEventListener("resize",kick);
      readTarget();cur=target;update(cur);
    }
  }

  /* ================= BUILD ================= */
  if(PAGE==="build"){
    var imgs=[$("#imgA"),$("#imgB")], cur=0, pend=$("#pend");
    function resolve(){var k=keyOf(state);if(has(k))return{k:k,exact:true};
      var t=[Object.assign({},state,{glass:"clear"}),Object.assign({},state,{finish:"black",glass:"clear"})];
      for(var i=0;i<t.length;i++){if(has(keyOf(t[i])))return{k:keyOf(t[i]),exact:false}}return{k:keyOf(DEF),exact:false}}
    function show(k,exact){var next=imgs[1-cur],src=img(k);
      pend.textContent=exact?"":"Not photographed yet. Showing the nearest door.";
      if(imgs[cur].getAttribute("src")===src)return;
      next.onload=function(){next.classList.add("on");imgs[cur].classList.remove("on");cur=1-cur;next.onload=null};
      next.alt=nameOf(state)+" iron entry door, "+specOf(state); next.src=src}
    function preload(){["finish","glass","style"].forEach(function(ax){Object.keys(NAMES[ax]).forEach(function(v){
      if(v===state[ax])return;var s=Object.assign({},state);s[ax]=v;if(has(keyOf(s))){var p=new Image();p.src=img(keyOf(s))}})})}
    function paint(){
      var r=resolve(); show(r.k,r.exact); preload();
      $$(".chips").forEach(function(g){var k=g.dataset.k;$$(".chip",g).forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.v===state[k]))})});
      $$(".thumb").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.v===state.style));
        var im=b.querySelector("img"),w=img(state.config+"-"+b.dataset.v+"-black-clear",true);if(im.getAttribute("src")!==w)im.src=w});
      AX.forEach(function(ax){var el=$("#cur-"+ax);if(el)el.textContent=NAMES[ax][state[ax]]});
      $("#specOpen").textContent=OPEN[state.config]; $("#specLead").textContent=LEAD[state.style];
      $("#specPrice").textContent=money(priceOf(state)); $("#stageCode").textContent=codeOf(state);
    }
    var strip=$("#strip");
    Object.keys(NAMES.style).forEach(function(v){
      var b=document.createElement("button");b.className="thumb";b.type="button";b.dataset.v=v;b.setAttribute("aria-label",NAMES.style[v]+" style");
      var im=document.createElement("img");im.alt="";im.src=img("double-"+v+"-black-clear",true);b.appendChild(im);strip.appendChild(b);
      b.addEventListener("click",function(){var s=Object.assign({},state,{style:v});commit(s);paint()})});
    $$(".chips").forEach(function(g){var k=g.dataset.k;$$(".chip",g).forEach(function(b){b.addEventListener("click",function(){
      if(state[k]===b.dataset.v)return;var s=Object.assign({},state);s[k]=b.dataset.v;commit(s);paint()})})});
    $("#resetBtn").addEventListener("click",function(){commit(DEF);paint()});
    commit(state); paint();

    /* finish and glass board */
    var BOARD=[["Forged black","finish","black","Mill scale left on, waxed. Darkest in the recesses."],
      ["Oil-rubbed bronze","finish","bronze","Warm brown, copper on the edges. Wears in, not off."],
      ["Aged patina","finish","patina","Verdigris in the low spots. Never the same twice."],
      ["Antique pewter","finish","pewter","Cool satin silver. Reads lighter from the street."],
      ["Clear","glass","clear","Low-iron, tempered. You see the hallway."],
      ["Frosted","glass","frosted","Acid-etched. Light comes through, the view does not."],
      ["Reeded","glass","reeded","Fluted verticals. Privacy without the fog."]];
    var bIm=$("#boardIm"),bList=$("#boardList"),bImgs=[];
    BOARD.forEach(function(m,i){
      var k=m[1]==="finish"?"double-tuscan-"+m[2]+"-clear":"double-tuscan-black-"+m[2];
      var im=document.createElement("img");im.src="img/doors/macro-"+k+".webp";im.alt=m[0]+", close up";im.loading="lazy";if(i===0)im.classList.add("on");bIm.appendChild(im);bImgs.push(im);
      var row=document.createElement("button");row.type="button";row.className="board-row"+(i===0?" on":"");
      row.innerHTML="<b>"+m[0]+"</b><span>"+m[3]+"</span>";
      function pick(){bImgs.forEach(function(x,j){x.classList.toggle("on",j===i)});$$(".board-row").forEach(function(x,j){x.classList.toggle("on",j===i)});
        $("#boardCap").textContent=m[0]+(m[1]==="finish"?" finish":" glass")+", cropped from the door photograph"}
      row.addEventListener("mouseenter",pick);row.addEventListener("focus",pick);
      row.addEventListener("click",function(){pick();var s=Object.assign({},state);s[m[1]]=m[2];commit(s);paint();
        window.scrollTo({top:0,behavior:RM?"auto":"smooth"})});
      bList.appendChild(row)});
  }

  /* ================= DOORS ================= */
  if(PAGE==="doors"){
    var grid=$("#grid"), filt={config:"all",style:"all",finish:"all",glass:"all"}, cards=[];
    AX.forEach(function(){});
    Object.keys(NAMES.config).forEach(function(c){Object.keys(NAMES.style).forEach(function(s){Object.keys(NAMES.finish).forEach(function(f){Object.keys(NAMES.glass).forEach(function(g){
      var st={config:c,style:s,finish:f,glass:g},k=keyOf(st);
      var a=document.createElement("a");a.className="door-card";a.href="build.html?d="+k;a.dataset.k=k;
      a.innerHTML='<div class="ph" style="aspect-ratio:3/4"><img'+(cards.length<12?'':' loading="lazy"')+' alt="" src="'+img(k,true)+'"></div>'+
        '<span class="n">'+nameOf(st)+'<br><span class="quiet" style="font-weight:400">'+specOf(st)+'</span></span><span class="data">'+codeOf(st)+'</span>';
      a.addEventListener("click",function(){store("re-door",k);var p=a.querySelector(".ph");p.style.viewTransitionName="door"});
      grid.appendChild(a);cards.push({el:a,s:st})})})})});
    function apply(){var n=0;cards.forEach(function(c){var ok=AX.every(function(ax){return filt[ax]==="all"||filt[ax]===c.s[ax]});c.el.hidden=!ok;if(ok)n++});
      $("#count").textContent=n===120?"All 120 doors":n+" of 120 doors"; $("#empty").hidden=n>0;
      $$(".fbtn").forEach(function(b){b.setAttribute("aria-pressed",String(filt[b.dataset.ax]===b.dataset.v))})}
    $$(".fbtn").forEach(function(b){b.addEventListener("click",function(){filt[b.dataset.ax]=b.dataset.v;apply()})});
    var q=new URLSearchParams(location.search).get("style"); if(q&&NAMES.style[q])filt.style=q;
    apply();
  }

  /* ================= PROCESS ================= */
  if(PAGE==="process"){
    var links=$$(".route-nav a"), sts=$$(".station"), tick=false;
    function mark(){tick=false;var mid=innerHeight*0.45,id=sts[0].id;
      sts.forEach(function(s){if(s.getBoundingClientRect().top<=mid)id=s.id});
      links.forEach(function(l){var on=l.getAttribute("href")==="#"+id;l.classList.toggle("on",on);if(on)l.setAttribute("aria-current","step");else l.removeAttribute("aria-current")})}
    addEventListener("scroll",function(){if(!tick){tick=true;requestAnimationFrame(mark)}},{passive:true});
    mark();
  }

  /* ================= QUOTE ================= */
  if(PAGE==="quote"){
    $("#tcImg").src=img(keyOf(state)); $("#tcImg").alt=nameOf(state)+" iron entry door, "+specOf(state);
    $("#tcOpen").textContent=OPEN[state.config]; $("#tcLead").textContent=LEAD[state.style]; $("#tcPrice").textContent=money(priceOf(state));
    $("#tcChange").href="build.html?d="+keyOf(state);
    if(!chosen)$("#tcNote").textContent="This is the starting door. Change it, or send it and tell us what you want instead.";
    var form=$("#quoteForm");
    var RULES={"f-name":function(v){return v.trim().length>=2?"":"Tell us what to call you."},
      "f-email":function(v){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())?"":"Enter an email we can reply to, like name@example.com."},
      "f-msg":function(v){return v.trim().length>=8?"":"Add a rough width and height for the opening."}};
    function check(id){var el=document.getElementById(id),m=RULES[id](el.value),f=el.closest(".field"),s=form.querySelector('[data-err="'+id+'"]');
      s.textContent=m;f.classList.toggle("bad",!!m);el.setAttribute("aria-invalid",m?"true":"false");return !m}
    Object.keys(RULES).forEach(function(id){var el=document.getElementById(id);el.addEventListener("blur",function(){if(el.value)check(id)});
      el.addEventListener("input",function(){if(el.closest(".field").classList.contains("bad"))check(id)})});
    form.addEventListener("submit",function(e){e.preventDefault();
      if(!Object.keys(RULES).map(check).every(Boolean)){var b=form.querySelector(".field.bad input,.field.bad textarea");if(b)b.focus();return}
      if(form.querySelector('[name="company"]').value)return;
      var btn=$("#submitBtn");btn.disabled=true;btn.textContent="Sending ticket";
      setTimeout(function(){form.hidden=true;var box=$("#sentBox");box.classList.add("on");
        $("#sentNote").textContent="Prototype: this form is not connected to a mailbox yet, so nothing was sent. Ticket "+tno+", "+codeOf(state)+".";
        box.focus()},600)});
  }

  paintChip();
})();
