(() => {
 'use strict';
 const $=id=>document.getElementById(id), canvas=$('scene'), ctx=canvas.getContext('2d',{alpha:false});
 const g=new Flight(), root=$('game');
 let w=1,h=1,horizon=.4, frame=0, last=0, previous='', muted=true, ac=null;
 const palettes=[
  ['#131d38','#cd7871','#101c32','#91e8df','#a14b72'],
  ['#101629','#676098','#131b37','#a7ffe0','#8d537d'],
  ['#15243a','#599877','#0b2933','#daffd4','#8f7250']
 ];
 const random=(()=>{let a=21891;return()=>{a=(Math.imul(a,1664525)+1013904223)>>>0;return a/4294967296}})();
 const stars=Array.from({length:220},()=>[random(),random(),random(),random()]);
 const silhouettes=Array.from({length:150},()=>[random(),random(),random()]);
 function resize(){w=root.clientWidth;h=root.clientHeight;let d=Math.min(2,devicePixelRatio||1);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);}
 addEventListener('resize',resize);resize();
 const ring=(x,y,r,stroke,a=1)=>{ctx.globalAlpha=a;ctx.strokeStyle=stroke;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1};
 function polygon(points,fill,stroke){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
 function line(x,y,xx,yy,col,lw=1){ctx.lineWidth=lw;ctx.strokeStyle=col;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.stroke();}
 function section(t){return t<13?0:t<26?1:2}
 function tone(freq,duration=.16,style='sine',volume=.075,delta=0){
   if(muted)return;
   try{ac ||= new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume().catch(()=>{});let now=ac.currentTime,osc=ac.createOscillator(),gain=ac.createGain();osc.type=style;osc.frequency.setValueAtTime(freq,now);osc.frequency.exponentialRampToValueAtTime(Math.max(20,freq+delta),now+duration);gain.gain.setValueAtTime(volume,now);gain.gain.exponentialRampToValueAtTime(.001,now+duration);osc.connect(gain);gain.connect(ac.destination);osc.start();osc.stop(now+duration);}catch{}
 }
 function endTones(win){if(win){[392,523,659].forEach((f,i)=>setTimeout(()=>tone(f,.4),i*100));}else tone(100,.48,'triangle',.12,-68);}
 function sky(p,time){
  const y=horizon*h;
  const fade=ctx.createLinearGradient(0,0,0,y*1.26);
  fade.addColorStop(0,p[0]);fade.addColorStop(.58,p[0]);fade.addColorStop(1,p[1]);
  ctx.fillStyle=fade;ctx.fillRect(0,0,w,y+30);
  let sunX=w*(w<600?.76:.71),r=Math.min(w,h)*.107,sunY=y-r*.85;
  let halo=ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,r*3.8);halo.addColorStop(0,'#ffda947a');halo.addColorStop(.35,'#ffbc7650');halo.addColorStop(1,'#ffbc7600');
  ctx.fillStyle=halo;ctx.fillRect(sunX-r*4,sunY-r*4,r*8,r*8);
  for(const [sx,sy,sr,phase] of stars){
    let a=.25+Math.sin(time*.6+phase*6)*.15;
    ctx.fillStyle='rgba(235,241,250,'+(a*(1-sy*.7))+')';ctx.fillRect(sx*w,sy*y,sr> .98?2:1,sr> .98?2:1);
  }
  ctx.save();ctx.beginPath();ctx.arc(sunX,sunY,r,0,Math.PI*2);ctx.clip();
  let sun=ctx.createLinearGradient(0,sunY-r,0,sunY+r);
  sun.addColorStop(0,'#ffe3b1');sun.addColorStop(1,'#f09669');
  ctx.fillStyle=sun;ctx.fillRect(sunX-r,sunY-r,r*2,r*2);
  for(let i=0;i<7;i++){ctx.fillStyle=p[1];ctx.fillRect(sunX-r,sunY+r*(.24+i*.125),r*2,1+i*.62)}
  ctx.restore();
  for(let j=0;j<3;j++){
    let pts=[[0,y+22]], count=32;
    for(let i=0;i<=count;i++){
      const [a,b]=silhouettes[i+j*36];let x=w*i/count,high=(j===2?14:36)*(a+.2)+b*b*(j===0?49:24);
      pts.push([x,y-(high*(.6+j*.09))+(j*13)]);
    }
    pts.push([w,y+22]);polygon(pts,['#48526b','#424059','#222e48'][j]);
  }
  const ground=ctx.createLinearGradient(0,y,0,h);ground.addColorStop(0,p[2]);ground.addColorStop(1,'#0b1422');
  ctx.fillStyle=ground;ctx.fillRect(0,y,w,h-y);line(0,y,w,y,'#dfba814d',1);
 }
 function view(z){
  const scale=1/(1+z*2.4), van=w*(g.state==='ready'&&w>650?.61:.5)+(0.5-g.visual)*w*.018;
  return [van,horizon*h+scale*(h*.47),scale];
 }
 function ground(p,time){
   const laneW=Math.min(w*.185,h*.26), focus=view(0)[0], base=view(0)[1], far=view(80);
   polygon([[far[0]-laneW*.05,far[1]],[far[0]+laneW*.05,far[1]],[focus+laneW*2.22,h],[focus-laneW*2.22,h]],'#182e416e');
   for(let k=-8;k<=8;k++){
     const off=laneW*k*.65;line(far[0]+off*far[2],far[1],focus+off*1.35,h,k===0?'#bdfbea50':'#5c778832');
   }
   for(let i=1;i<=24;i++){
    const z=(i+1-time*4%1)*.44,[x,y,s]=view(z);line(x-laneW*s*4,y,x+laneW*s*4,y,'rgba(126,175,184,'+(s*.44)+')');
   }
   for(let i=34;i>=0;i--){
    const j=(i+1-time*4%1)*.47,[x,y,s]=view(j),side=i%2===0?-1:1;
    if(i%3===0){const xx=x+side*(laneW*(3.25+silhouettes[i][0]*3.1))*s;
    const b=laneW*.58*s,r=(i%7+3)*b*.47;
    polygon([[xx-b*1.4,y],[xx-b*.87,y-r*.85],[xx+b*.25,y-r],[xx+b,y]],'#253743');
    polygon([[xx+b*.25,y-r],[xx+b*1.8,y-r*.77],[xx+b*2.4,y],[xx+b,y]],'#132536');
    line(xx-b*.87,y-r*.85,xx+b*.25,y-r,p[4]+'83',Math.max(.6,s*2));
    }
    for(const side of [-1,1]){const xx=x+laneW*1.62*s*side;ctx.fillStyle=p[3];ctx.globalAlpha=Math.min(1,s*1.65);ctx.fillRect(xx-1,y-1,Math.max(1,5*s),Math.max(1,3*s));ctx.globalAlpha=1;}
   }
 }
 function obstacle(when,lane,t,p){
  const remain=when-t;if(remain>4.8||remain<-.17)return;
  const z=Math.max(-.16,remain*1.65),[x,y,s]=view(z),lw=Math.min(w*.185,h*.26),cx=x+(lane===0?-1:1)*lw*.57*s,
  ww=lw*.52*s,hh=Math.min(.17*h,lw*.82)*s, yy=y-hh*.12, edge=Math.max(1,2.4*s);
  const alpha=Math.min(.98,(5.1-remain)*.58);
  ctx.globalAlpha=alpha;
  let glow=ctx.createRadialGradient(cx,yy,0,cx,yy,ww*2.6);glow.addColorStop(0,'#ff714f56');glow.addColorStop(1,'#ff714f00');
  ctx.fillStyle=glow;ctx.fillRect(cx-ww*3,yy-ww*3,ww*6,ww*6);
  ctx.lineWidth=edge;
  polygon([[cx-ww,yy],[cx-ww,yy-hh*.77],[cx-ww*.70,yy-hh],[cx+ww*.70,yy-hh],[cx+ww,yy-hh*.77],[cx+ww,yy]],'#8f374fbe','#ffab72');
  ctx.save();ctx.clip();for(let j=-2;j<6;j++){line(cx+ww*.35*j,yy,cx+ww*(.35*j+.85),yy-hh,'#f39e7e65',edge)}ctx.restore();
  ctx.lineWidth=edge;polygon([[cx,yy-hh*.84],[cx+ww*.30,yy-hh*.42],[cx,yy-hh*.18],[cx-ww*.30,yy-hh*.42]],'#4d2033','#ffd9a1');
  line(cx,yy-hh*.59,cx,yy-hh*.43,'#ffd9a1',edge);
  ctx.fillStyle='#ffd9a1';ctx.fillRect(cx-edge*.5,yy-hh*.36,edge,edge);
  ctx.globalAlpha=1;
 }
 function ship(p,time){
   const [center,y]=view(0),lw=Math.min(w*.185,h*.26),x=center+(g.visual*2-1)*lw*.57,base=y-h*.045;
   const size=Math.max(30,Math.min(w*.15,h*.155)), bx=(g.lane-g.visual)*.36;
   ctx.save();ctx.translate(x,base+Math.sin(time*3)*2);ctx.rotate(bx);
   const pts=arr=>arr.map(([x,y])=>[x*size,y*size]);
   for(let k=0;k<2;k++){
    let xx=(k?1:-1)*size*.2, yy=size*.27,f=1+Math.sin(time*34+k)*.24, grd=ctx.createLinearGradient(0,yy,0,yy+size*.92*f);
    grd.addColorStop(0,'#dffff5');grd.addColorStop(.28,p[3]+'ae');grd.addColorStop(1,p[3]+'00');
    polygon([[xx-size*.074,yy],[xx+size*.074,yy],[xx+size*.021,yy+size*.92*f],[xx-size*.03,yy+size*.78*f]],grd);
   }
   ctx.lineWidth=Math.max(1,size*.015);
   polygon(pts([[0,-.71],[-.23,-.30],[-.59,-.04],[-.67,.26],[-.31,.39],[.31,.39],[.67,.26],[.59,-.04],[.23,-.30]]),'#213d53','#cadade');
   polygon(pts([[0,-.71],[-.23,-.30],[-.59,-.04],[-.63,.13],[-.32,.12],[-.20,-.03]]),'#b1bdb8');
   polygon(pts([[0,-.71],[.23,-.30],[.59,-.04],[.63,.13],[.32,.12],[.20,-.03]]),'#7b9aa3');
   polygon(pts([[0,-.58],[.20,-.03],[.10,.28],[-.10,.28],[-.20,-.03]]),'#f4eedb');
   polygon(pts([[0,-.42],[.09,-.13],[.065,-.037],[-.065,-.037],[-.09,-.13]]),'#2d5572');
   polygon(pts([[-.55,.04],[-.43,.02],[-.33,.14],[-.62,.21]]),'#ef9e66');
   polygon(pts([[.55,.04],[.43,.02],[.33,.14],[.62,.21]]),'#ef9e66');
   polygon(pts([[-.29,.16],[-.08,.19],[-.10,.36],[-.34,.35]]),'#192d44');
   polygon(pts([[.29,.16],[.08,.19],[.10,.36],[.34,.35]]),'#192d44');
   for(const n of [-1,1]){line(n*size*.28,size*.29,n*size*.15,size*.3,p[3],Math.max(2,size*.04));}
   ctx.restore();
 }
 function render(now){
   const t=g.t,time=now/1000, p=palettes[section(t)]; horizon=w<600?.43:.43;
   sky(p,time);ground(p,g.state==='ready'?time*.21:t);
   for(let i=ROUTE.length-1;i>=0;i--)obstacle(...ROUTE[i],g.state==='ready'?2.1:t,p);
   if(t>48&&g.state!=='lost'){
    const [x,y,s]=view(Math.max(0,(LENGTH-t)*1.6)),rad=Math.min(w,h)*.27*s;ctx.lineWidth=2;
    ring(x,y-rad*.58,rad,p[3],.83);ring(x,y-rad*.58,rad*.91,p[3],.50);
   }
   ship(p,time);
   if(g.hit){ctx.fillStyle='rgba(235,79,77,'+(g.hit*.31)+')';ctx.fillRect(0,0,w,h);}
 }
 const overlay=$('overlay'), launch=$('launch'), title=$('title'), hud=document.querySelector('.hud'), swap=$('swap');
 const sectorNames=['01 / OUTER RELAY','02 / SHADOW FIELD','03 / INNER BELT','04 / FINAL APPROACH'];
 // Use real image frames on each action. A distinct request restarts the one-shot GIF.
 for(const glyph of ['launch','retry','shift']){
   if(typeof Image!=='function')break;
   const testIcon=new Image();
   testIcon.onload=()=>root.setAttribute('data-icon-'+glyph,'ready');
   testIcon.src='assets/'+glyph+'.png';
 }
 const fxSerial=new WeakMap();
 const reduceFX=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
 function playFX(holder,img,kind){
   if(reduceFX())return;
   const serial=(fxSerial.get(holder)||0)+1;
   fxSerial.set(holder,serial);
   holder.setAttribute('data-active',kind);
   holder.setAttribute('data-loaded','false');
   const finish=()=>{if(fxSerial.get(holder)===serial)holder.setAttribute('data-active','');};
   img.onload=()=>{if(fxSerial.get(holder)===serial)holder.setAttribute('data-loaded','true');};
   img.onerror=finish;
   img.src='assets/'+kind+'.gif?play='+serial;
   setTimeout(finish,470);
 }

 function updateUI(){
  overlay.hidden=g.state==='live';
  hud.hidden=g.state==='ready';
  swap.hidden=g.state!=='live';
  $('pause').disabled=!['live','paused'].includes(g.state);
  $('pause').textContent=g.state==='paused'?'▶':'Ⅱ';
  $('pause').setAttribute('aria-label',g.state==='paused'?'Resume':'Pause');
  const lane=g.lane+1;
  $('lane-label').textContent=g.state==='ready'?'LUMEN REACH / FLIGHT 01':('ACTIVE LANE / 0'+lane);
  const pct=Math.floor(100*g.t/LENGTH);
  $('distance').textContent=pct+'%';$('progress').setAttribute('aria-valuenow',pct);
  $('progress').firstElementChild.style.width=pct+'%';
  $('sector').textContent=sectorNames[g.t<13?0:g.t<26?1:g.t<39?2:3];
  $('hull').textContent=Array.from({length:3},(_,i)=>i<g.shields?'◆':'◇').join(' ');
  $('hull').setAttribute('aria-label',g.shields+' hull remaining');
  if(previous===g.state)return;
  previous=g.state;
  if(g.state==='ready'||g.state==='live')return;
  const win=g.state==='won',paused=g.state==='paused';
  const name=paused?['Flight','Paused']:win?['Delivery','Complete']:['Signal','Lost'];
  title.innerHTML=name[0]+'<br><em>'+name[1]+'</em>';
  $('eyebrow').textContent=paused?'// AUTOPILOT HOLD':win?'// RECEIPT CONFIRMED':'// CARGO LINK OFFLINE';
  $('brief').textContent=paused?'Route frozen. Resume when ready.':win?'Cargo received. You cleared '+g.dodged+' of '+ROUTE.length+' barriers with '+g.shields+' hull remaining.':'You cleared '+g.dodged+' barriers. Watch the orange gate ahead and shift into the open lane.';
  $('launch-label').textContent=paused?'Resume flight':'Fly again';
  launch.setAttribute('data-glyph',paused?'launch':'retry');
  launch.focus({preventScroll:true});
  if(!paused)endTones(win);
 }
 function begin(){
  if(g.state==='paused'){g.pause();tone(350);updateUI();return;}
  if(g.state==='live')return;
  const glyph=g.state==='ready'?'launch':'retry';
  g.start();tone(300,.28,'triangle',.08,260);updateUI();
  playFX($('takeoff-fx'),$('takeoff-gif'),glyph);
 }
 function shift(){if(g.shift()){tone(g.lane?545:430,.12,'triangle',.085,190);updateUI();playFX(swap,$('shift-gif'),'shift')}}
 function pause(){if(g.pause())updateUI()}
 launch.addEventListener('click',begin);swap.addEventListener('click',shift);
 $('pause').addEventListener('click',pause);
 $('sound').addEventListener('click',()=>{muted=!muted;$('sound').setAttribute('aria-pressed',String(!muted));tone(530,.19);});
 document.addEventListener('keydown',e=>{
  if(e.repeat||e.altKey||e.ctrlKey||e.metaKey)return;
  if(e.code==='ShiftLeft'||e.code==='ShiftRight'){if(g.state==='live'){e.preventDefault();shift()}}
  if(e.code==='KeyP'||e.code==='Escape'){if(['live','paused'].includes(g.state)){e.preventDefault();pause()}}
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&g.state==='live')pause()});
 function loop(now){
   frame=requestAnimationFrame(loop);
   const dt=Math.min((now-(last||now))/1000,.1);last=now;
   const v=g.shields;g.step(dt);if(g.shields<v && g.state==='live')tone(150,.25,'triangle',.12,-95);
   render(now);if(g.state==='live'||previous!==g.state)updateUI();
 }
 updateUI();frame=requestAnimationFrame(loop);
})();
