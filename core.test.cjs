const {test}=require('node:test'), a=require('node:assert/strict');
const {Flight, ROUTE}=require('./flight.js');
test('lane switches only after launch and visual lane eases',()=>{
  let g=new Flight; a.equal(g.shift(),false); g.start(); a.equal(g.shift(),true); a.equal(g.lane,1); g.step(.06); assert(g.visual>0&&g.visual<1);
}); function assert(x){a.ok(x)}
test('holding starting lane strikes three times and loses',()=>{
  let g=new Flight; g.start(); for(let i=0;i<6000;i++)g.step(1/120); a.equal(g.state,'lost');a.equal(g.shields,0);g.start();a.equal(g.shields,3);a.equal(g.t,0);
});
test('avoiding all gates wins and preserves hull',()=>{
  let g=new Flight;g.start(); for(let i=0;i<9000&&g.state==='live';i++){
  let wave=ROUTE[g.cursor];if(wave&&wave[0]-g.t<.55&&wave[1]===g.lane)g.shift();g.step(1/120);
  }a.equal(g.state,'won');a.equal(g.shields,3);a.equal(g.dodged,ROUTE.length);
});
test('pausing freezes time and resume resumes',()=>{
  let g=new Flight;g.start();g.step(.1);a.equal(g.pause(),true);let t=g.t;g.step(.08);a.equal(g.t,t);a.equal(g.shift(),false);g.pause();g.step(.08);assert(g.t>t);
});
