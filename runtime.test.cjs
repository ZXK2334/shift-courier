const test=require('node:test'),assert=require('node:assert/strict'),{readFileSync}=require('node:fs'),vm=require('node:vm');
function page(){
 const handlers={}, attrs={}, frames=[], nodes={}; let calls=0;
 const grad={addColorStop(){}};
 const ctx=new Proxy({createLinearGradient:()=>grad, createRadialGradient:()=>grad},{get(t,k){return k in t?t[k]:(...a)=>{assert(a.every(x=>typeof x!=='number'||Number.isFinite(x)),String(k));calls++}}});
 function node(id){return nodes[id]??= {listen:{},textContent:'',innerHTML:'',hidden:false,clientWidth:1280, clientHeight:720,firstElementChild:{style:{}},style:{},setAttribute(k,v){attrs[id+k]=v},addEventListener(k,v){this.listen[k]=v},click(){this.listen.click?.()},focus(){},getContext(){return ctx}};}
 const document={hidden:false,getElementById:node,querySelector:node,addEventListener(k,v){handlers[k]=v}};
 const sandbox={document,devicePixelRatio:1,addEventListener(){},requestAnimationFrame(f){frames.push(f)},setTimeout(){}};
 sandbox.window=sandbox;
 vm.createContext(sandbox);
 for(const file of ['flight.js','game.js'])vm.runInContext(readFileSync(file,'utf8'),sandbox,{filename:file});
 let t=0;
 return {node,keyboard(code,repeat=false){handlers.keydown({code,repeat,preventDefault(){}})},tick(ms=16.67){t+=ms;frames.shift()(t)},attrs,get calls(){return calls},visibility(hidden){document.hidden=hidden;handlers.visibilitychange()}};
}
test('production scripts cover start, keyboard/touch action, repeated key suppression, pause/resume, and drawing',()=>{
 const p=page();p.tick();assert.ok(p.calls>100);
 assert.equal(p.node('overlay').hidden,false);p.node('launch').click();assert.equal(p.node('overlay').hidden,true);
 p.keyboard('ShiftLeft');assert.match(p.node('lane-label').textContent,/02/);
 p.keyboard('ShiftLeft',true);assert.match(p.node('lane-label').textContent,/02/);
 p.node('swap').click();assert.match(p.node('lane-label').textContent,/01/);
 p.keyboard('KeyP');assert.match(p.node('title').innerHTML,/Paused/);p.node('launch').click();
 assert.equal(p.node('overlay').hidden,true);
 p.visibility(true);assert.match(p.node('title').innerHTML,/Paused/);p.visibility(false);
});
test('production scripts reach crash and retry screens with correct hull',()=>{
 const p=page();p.tick();p.node('launch').click();for(let i=0;i<165;i++)p.tick(100);
 assert.match(p.node('title').innerHTML,/Lost/);
 assert.equal(p.attrs['hullaria-label'],'0 hull remaining');
 p.node('launch').click();assert.equal(p.attrs['hullaria-label'],'3 hull remaining');assert.equal(p.node('overlay').hidden,true);
});
test('one complete winning run through production UI with all barriers dodged',()=>{
 const {ROUTE}=require('./flight.js'),p=page();p.tick();p.node('launch').click();let target=0,lane=0;
 for(let i=0;i<=525;i++){
   if(ROUTE[target]&&i*.1>=ROUTE[target][0]-.6){if(ROUTE[target][1]===lane){p.keyboard('ShiftRight');lane=1-lane;}target++}
   p.tick(100)
 }assert.match(p.node('title').innerHTML,/Complete/);assert.match(p.node('brief').textContent,/28 of 28/);
 assert.equal(p.attrs['progressaria-valuenow'],100);
});
