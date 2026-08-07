var archiveSketch = function(p){
  const W=1080,H=660;
  const pins=[{x:220,y:160},{x:520,y:135},{x:800,y:190},{x:300,y:445},{x:685,y:450}];

  p.setup=function(){
    let c=p.createCanvas(W,H);
    c.parent("archive-canvas");
    p.noLoop();
  };

  p.draw=function(){
    p.background(36,26,19);
    wood();
    frame();
    map(520,305);
    photo(95,105,250,175);
    letter(650,85,300,205);
    ticket(130,390,305,112);
    diary(565,395,305,150);
    timeline();
    jasmine(900,455,52);
    threads();
    pinheads();
    labels();
  };

  function wood(){
    for(let y=0;y<H;y+=9){
      p.stroke(80,55,35,72);
      p.line(0,y+p.random(-2,2),W,y+p.random(-2,2));
    }
    for(let i=0;i<900;i++){
      p.noStroke();
      p.fill(140,96,52,p.random(6,22));
      p.circle(p.random(W),p.random(H),p.random(1,4));
    }
  }

  function frame(){
    p.noFill();
    p.stroke(166,124,58);
    p.strokeWeight(2);
    p.rect(48,52,984,548);
    p.stroke(239,226,197,80);
    p.rect(68,72,944,508);
  }

  function map(cx,cy){
    p.push();
    p.translate(cx,cy);
    p.noStroke();
    p.fill(239,226,197,75);
    p.rect(-140,-165,280,330,4);
    p.fill(66,95,82,220);
    p.beginShape();
    p.vertex(-30,-130);
    p.bezierVertex(35,-138,52,-86,25,-45);
    p.bezierVertex(70,-18,60,30,30,60);
    p.bezierVertex(50,110,22,148,-10,132);
    p.bezierVertex(-43,92,-28,58,-62,28);
    p.bezierVertex(-25,-8,-75,-55,-35,-88);
    p.endShape(p.CLOSE);
    p.fill(151,105,91);
    p.circle(-3,-8,10);
    p.fill(47,54,50);
    p.textSize(13);
    p.text("Bangkok",12,-4);
    p.text("THAILAND MEMORY MAP",-105,-138);
    p.pop();
  }

  function photo(x,y,w,h){
    p.push();
    p.translate(x,y);
    p.noStroke();
    p.fill(243,240,232);
    p.rect(0,0,w,h,4);
    p.fill(50,70,58);
    p.rect(18,18,w-36,h-36);
    p.fill(215,170,88,100);
    p.rect(145,30,62,82);
    p.fill(28,24,20);
    p.circle(86,82,44);
    p.rect(60,108,52,50,18);
    p.circle(150,105,30);
    p.rect(134,122,34,36,10);
    p.fill(47,54,50);
    p.textSize(13);
    p.text("FAMILY PHOTO",16,h+24);
    p.pop();
  }

  function letter(x,y,w,h){
    p.push();
    p.translate(x,y);
    p.rotate(-0.035);
    p.noStroke();
    p.fill(0,0,0,45);
    p.rect(8,10,w,h,4);
    p.fill(243,240,232);
    p.rect(0,0,w,h,4);
    p.stroke(58,42,35,120);
    p.noFill();
    p.rect(16,16,w-32,h-32);
    p.noStroke();
    p.fill(47,54,50);
    p.textSize(15);
    p.text("LETTER TO GRANDMA",28,42);
    let lines=["Dear Grandma,","I still remember","the afternoon sunlight","through your window.","I remember jasmine","beside the old house."];
    p.textSize(13);
    for(let i=0;i<lines.length;i++) p.text(lines[i],28,76+i*20);
    p.fill(151,105,91);
    p.rect(w-72,30,46,56);
    p.fill(243,240,232);
    p.rect(w-65,37,32,42);
    p.fill(151,105,91);
    p.textSize(9);
    p.text("TH",w-56,63);
    p.pop();
  }

  function ticket(x,y,w,h){
    p.push();
    p.translate(x,y);
    p.rotate(0.025);
    p.noStroke();
    p.fill(215,193,155);
    p.rect(0,0,w,h,5);
    p.fill(47,54,50);
    p.textSize(15);
    p.text("OLD TRAIN TICKET",20,34);
    p.textSize(12);
    p.text("Bangkok Station",20,62);
    p.text("Platform 03",20,83);
    p.text("1986 - Family Visit",170,83);
    p.stroke(90,60,35,120);
    for(let i=0;i<7;i++) p.line(142+i*10,18,142+i*10,92);
    p.pop();
  }

  function diary(x,y,w,h){
    p.push();
    p.translate(x,y);
    p.rotate(-0.025);
    p.noStroke();
    p.fill(243,240,232);
    p.rect(0,0,w,h,4);
    p.fill(47,54,50);
    p.textSize(15);
    p.text("DIARY FRAGMENT",20,36);
    p.textSize(13);
    p.text("She never said goodbye directly.",20,68);
    p.text("She only packed fruit, water,",20,92);
    p.text("and folded the letter twice.",20,116);
    p.noFill();
    p.stroke(151,105,91);
    p.circle(w-48,50,40);
    p.pop();
  }

  function timeline(){
    let x=110,y=555,years=["1986","1998","2012","2024"];
    p.stroke(239,226,197,130);
    p.strokeWeight(1.5);
    p.line(x,y,965,y);
    for(let i=0;i<years.length;i++){
      let px=x+i*285;
      p.noStroke();
      p.fill(151,105,91);
      p.circle(px,y,10);
      p.fill(243,240,232);
      p.textSize(13);
      p.text(years[i],px-16,y+28);
    }
  }

  function jasmine(cx,cy,s){
    for(let i=0;i<6;i++){
      let a=p.TWO_PI/6*i;
      p.noStroke();
      p.fill(245,235,210);
      p.ellipse(cx+p.cos(a)*s*.35,cy+p.sin(a)*s*.35,s*.55,s*.28);
    }
    p.fill(129,147,137);
    p.circle(cx,cy,s*.22);
  }

  function threads(){
    p.noFill();
    p.stroke(151,105,91);
    p.strokeWeight(2);
    p.beginShape();
    p.vertex(pins[0].x,pins[0].y);
    p.bezierVertex(350,105,430,190,pins[1].x,pins[1].y);
    p.bezierVertex(645,100,720,140,pins[2].x,pins[2].y);
    p.endShape();
    p.beginShape();
    p.vertex(pins[0].x,pins[0].y);
    p.bezierVertex(190,280,255,380,pins[3].x,pins[3].y);
    p.bezierVertex(450,500,575,465,pins[4].x,pins[4].y);
    p.endShape();
    p.line(pins[1].x,pins[1].y,pins[4].x,pins[4].y);
  }

  function pinheads(){
    for(let i=0;i<pins.length;i++){
      p.noStroke();
      p.fill(151,105,91);
      p.circle(pins[i].x,pins[i].y,12);
      p.fill(255,220);
      p.circle(pins[i].x-2,pins[i].y-2,3);
    }
  }

  function labels(){
    p.noStroke();
    p.fill(243,240,232);
    p.textSize(15);
    p.text("2D CANVAS 01 / STATIC MEMORY ARCHIVE",58,40);
    p.rect(820,32,170,34);
    p.fill(47,54,50);
    p.textSize(12);
    p.text("ARCHIVE ID: GM-2024",835,54);
  }
};

new p5(archiveSketch,"archive-canvas");
