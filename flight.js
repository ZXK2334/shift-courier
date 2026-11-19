(function(root) {
  'use strict';
  const ROUTE = Object.freeze([
    [4.6,0],[7.0,1],[9.2,1],[11.4,0],
    [14.0,1],[15.8,0],[17.5,0],[19.1,1],[20.8,0],[22.5,1],[24.2,1],
    [27.2,0],[28.6,1],[30.0,0],[31.4,0],[32.8,1],[34.2,0],[35.6,1],[37.0,0],
    [40.0,1],[41.1,0],[42.2,1],[43.3,0],[44.4,1],[45.5,0],[46.6,0],[47.7,1],[48.8,0],
  ].map(o=>Object.freeze(o)));
  const LENGTH = 52;
  class Flight {
    constructor(){this.start();this.state='ready';}
    start(){Object.assign(this,{state:'live',t:0,lane:0,visual:0,shields:3,dodged:0,cursor:0,hit:0});}
    shift(){if(this.state!=='live')return false;this.lane=1-this.lane;return true;}
    pause(){if(this.state==='live'){this.state='paused';return true;}if(this.state==='paused'){this.state='live';return true;}return false;}
    step(dt){
      if(this.state!=='live')return;
      dt=Math.max(0,Math.min(.1,dt));
      this.t=Math.min(LENGTH,this.t+dt);
      this.visual+=(this.lane-this.visual)*(1-Math.exp(-dt*13));
      this.hit=Math.max(0,this.hit-dt);
      while(this.cursor<ROUTE.length && ROUTE[this.cursor][0]<=this.t){
        if(ROUTE[this.cursor][1]===this.lane){this.hit=.45;this.shields--;}else this.dodged++;
        this.cursor++;
        if(!this.shields){this.state='lost';return;}
      }
      if(this.t>=LENGTH)this.state='won';
    }
  }
  if(typeof module!=='undefined' && module.exports)module.exports={Flight,ROUTE,LENGTH};
  else Object.assign(root,{Flight,ROUTE,LENGTH});
})(globalThis);
