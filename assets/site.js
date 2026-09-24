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
    var hs=$("#heroDoor"); var st0=hs.querySelector("[data-static]"); if(st0)st0.remove(); var cycle=["tuscan","gothic","deco","modern","flush"], hi=0, himgs=[];
    cycle.forEach(function(st,i){var s=Object.assign({},DEF,{style:st, finish:["black","patina","bronze","pewter","black"][i]});
      var im=document.createElement("img"); im.src=img(keyOf(s)); im.alt=nameOf(s)+" iron entry door, "+specOf(s);
      im.dataset.k=keyOf(s); if(i===0)im.className="on"; hs.appendChild(im); himgs.push({im:im,s:s})});
    function heroCap(){var s=himgs[hi].s; $("#heroCapName").textContent=nameOf(s)+", "+specOf(s); $("#heroCapCode").textContent=codeOf(s);
      $("#heroBuild").href="build.html?d="+keyOf(s)}
    heroCap();
    if(!RM)setInterval(function(){if(document.hidden)return;himgs[hi].im.classList.remove("on");hi=(hi+1)%himgs.length;himgs[hi].im.classList.add("on");heroCap()},3400);
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
