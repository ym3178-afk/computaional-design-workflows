var wishingTreeSketch=function(p){
  const W=1080,H=660;
  let flowers=[],notes=[],wind=0;

  p.setup=function(){
    let c=p.createCanvas(W,H);
    c.parent("tree-canvas");
    for(let i=0;i<95;i++){
      let x=p.random(60,W-60),y=p.random(105,470);
      x=p.lerp(x,W/2+p.random(-330,330),p.map(y,105,470,.25,.55));
      flowers.push({x,y,s:p.random(18,36),phase:p.random(p.TWO_PI)});
      if(i%2===0) notes.push(new Note(x+p.random(-18,18),y+p.random(18,44),p.random(60,145)));
    }
  };

  p.draw=function(){
    wind=p.map(p.mouseX,0,p.width,-1.25,1.25);
    sky(); tree(); branches();
    for(let n of notes){n.move();n.display();}
    for(let f of flowers) flower(f);
    foreground(); label();
  };

  function sky(){
    for(let y=0;y<H;y++){
      let inter=p.map(y,0,H,0,1);
      p.stroke(p.lerp(130,165,inter),p.lerp(158,180,inter),p.lerp(164,168,inter));
      p.line(0,y,W,y);
    }
    for(let i=0;i<80;i++){
      p.noStroke(); p.fill(239,226,197,18);
      p.circle(p.random(W),p.random(H),p.random(1,3));
    }
  }

  function tree(){
    p.noStroke();
    p.fill(47,33,24);
    p.beginShape();
    p.vertex(470,H); p.vertex(515,390); p.vertex(490,240); p.vertex(535,240); p.vertex(560,390); p.vertex(615,H);
    p.endShape(p.CLOSE);
    branch(515,370,260,250,36);
    branch(528,345,145,180,28);
    branch(530,285,380,130,22);
    branch(540,285,760,120,24);
    branch(548,365,925,260,26);
    branch(525,245,520,75,17);
    branch(545,245,680,65,17);
  }

  function branch(x1,y1,x2,y2,w){
    p.stroke(47,33,24); p.strokeWeight(w); p.strokeCap(p.ROUND); p.line(x1,y1,x2,y2);
  }

  function branches(){
    p.stroke(40,29,23); p.strokeWeight(3);
    for(let i=0;i<flowers.length;i+=3){
      let f=flowers[i]; p.line(W/2,350,f.x,f.y);
    }
  }

  function flower(f){
    let pulse=p.sin(p.frameCount*.04+f.phase)*1.8;
    p.push(); p.translate(f.x+wind*2,f.y); p.rotate(p.sin(p.frameCount*.02+f.phase)*.08);
    for(let i=0;i<5;i++){
      let a=p.TWO_PI/5*i;
      p.noStroke(); p.fill(157,108,93);
      p.ellipse(p.cos(a)*f.s*.28,p.sin(a)*f.s*.28,f.s*.62+pulse,f.s*.34);
    }
    p.fill(129,147,137); p.circle(0,0,f.s*.38);
    p.fill(90,55,35); p.circle(0,0,f.s*.16);
    p.pop();
  }

  function foreground(){
    p.noStroke(); p.fill(239,226,197,14);
    for(let i=0;i<12;i++){
      p.circle(p.noise(i,p.frameCount*.004)*W,p.noise(i+50,p.frameCount*.004)*H,p.random(50,120));
    }
  }

  function label(){
    p.noStroke(); p.fill(239,226,197,225); p.textSize(14);
    p.text("2D CANVAS 02 / WISHING TREE / MOVE MOUSE TO CHANGE WIND",34,H-28);
  }

  class Note{
    constructor(ax,ay,len){this.ax=ax;this.ay=ay;this.len=len;this.w=p.random(30,46);this.h=p.random(46,68);this.phase=p.random(p.TWO_PI);}
    move(){this.swing=p.sin(p.frameCount*.035+this.phase)*.32+wind*.22;}
    display(){
      let ex=this.ax+p.sin(this.swing)*this.len,ey=this.ay+p.cos(this.swing)*this.len;
      p.stroke(239,226,197,165); p.strokeWeight(1.3); p.line(this.ax,this.ay,ex,ey);
      p.push(); p.translate(ex,ey); p.rotate(this.swing*.45);
      p.noStroke(); p.fill(239,226,197,235); p.rect(-this.w/2,0,this.w,this.h,2);
      p.stroke(70,55,45,125); p.strokeWeight(.8);
      for(let i=0;i<6;i++) p.line(-this.w/2+5,8+i*7,this.w/2-5,8+i*7);
      p.noStroke(); p.fill(143,45,45,180); p.circle(this.w/2-8,10,7);
      p.pop();
    }
  }
};
new p5(wishingTreeSketch,"tree-canvas");
