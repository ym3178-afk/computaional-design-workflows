
// Cotton Flower Canvas — Final Rebuilt Version
// A p5.js dynamic canvas inspired by red cotton flower, hanging letters, wind, and family memory.
// Interaction:
// - Flower opens from closed bud to full bloom
// - Threads grow downward
// - Letters appear one by one
// - Mouse controls wind direction
// - Click near flower to reset and replay animation

var redFlowerSketch = function(p) {
  const W = 1080;
  const H = 660;

  let petals = [];
  let letters = [];
  let backgroundChars = "愿风入你梦思念漂洋过海阿嬷家书纸侨批牵挂归途南洋花开时我仍记得";
  let startFrame = 0;
  let wind = 0;
  let targetWind = 0;

  p.setup = function() {
    let canvas = p.createCanvas(W, H);
    canvas.parent("flower-canvas");
    resetScene();
  };

  p.draw = function() {
    let frame = p.frameCount - startFrame;
    let bloomT = easeInOutCubic(p.constrain(p.map(frame, 30, 210, 0, 1), 0, 1));
    let threadT = easeInOutCubic(p.constrain(p.map(frame, 180, 350, 0, 1), 0, 1));
    let letterT = p.constrain(p.map(frame, 300, 560, 0, 1), 0, 1);

    targetWind = p.map(p.mouseX, 0, W, -1.15, 1.15);
    wind = p.lerp(wind, targetWind, 0.045);

    drawBluePaperBackground();
    drawFaintChineseWriting();
    drawFilmGrain();
    drawShadowUnderFlower(bloomT);

    p.push();
    p.translate(W / 2, 18);
    drawCottonFlower(bloomT, frame);
    p.pop();

    for (let i = 0; i < letters.length; i++) {
      let reveal = p.constrain(p.map(letterT, i / letters.length, (i + 4) / letters.length, 0, 1), 0, 1);
      letters[i].update(wind, frame, threadT, reveal);
      letters[i].display(threadT, reveal);
    }

    drawWindRibbons(frame);
    drawLabel(frame);
  };

  p.mousePressed = function() {
    // click upper flower area to reset/replay
    if (p.mouseY < 260) {
      resetScene();
    }
  };

  function resetScene() {
    startFrame = p.frameCount;
    petals = [];
    letters = [];
    wind = 0;
    targetWind = 0;

    // Five cotton petals: one center, two side, two dark lower petals.
    petals.push(new Petal(0, 92, 120, 250, 0, -0.02, 0.98, 0));
    petals.push(new Petal(-98, 98, 150, 86, -0.65, -0.08, 0.95, 1));
    petals.push(new Petal(98, 98, 150, 86, 0.65, 0.08, 0.95, 1));
    petals.push(new Petal(-54, 160, 88, 205, -0.32, -0.16, 0.88, 2));
    petals.push(new Petal(54, 160, 88, 205, 0.32, 0.16, 0.88, 2));

    // Hanging letters cluster under flower.
    for (let i = 0; i < 36; i++) {
      let ax = W / 2 + p.random(-165, 165);
      let ay = 178 + p.random(-12, 52);
      let len = p.random(170, 420);
      let cluster = p.random();
      let endShift = cluster < 0.55 ? p.random(-90, 90) : p.random(-230, 230);
      letters.push(new HangingLetter(ax, ay, len, endShift, i));
    }
  }

  function drawBluePaperBackground() {
    // muted handmade blue paper
    p.background(180, 190, 184);

    // vertical paper fiber
    p.stroke(230, 238, 226, 26);
    p.strokeWeight(1);
    for (let x = 0; x < W; x += 16) {
      p.line(x + p.noise(x * 0.03) * 4, 0, x + p.noise(x * 0.03 + 99) * 4, H);
    }

    // soft stains
    p.noStroke();
    for (let i = 0; i < 35; i++) {
      let x = p.noise(i * 12.1, p.frameCount * 0.001) * W;
      let y = p.noise(i * 7.7 + 20, p.frameCount * 0.001) * H;
      p.fill(95, 125, 123, 12);
      p.circle(x, y, p.random(60, 170));
    }

    // light vignette
    for (let r = 0; r < 80; r++) {
      p.noFill();
      p.stroke(30, 50, 48, 1.2);
      p.rect(r, r, W - r * 2, H - r * 2);
    }
  }

  function drawFaintChineseWriting() {
    p.noStroke();
    p.textSize(18);
    p.textAlign(p.CENTER, p.CENTER);

    for (let col = 22; col < W; col += 84) {
      for (let row = 24; row < H; row += 32) {
        let idx = p.floor((col * 0.13 + row * 0.31 + p.frameCount * 0.015) % backgroundChars.length);
        let alpha = 22 + p.sin(row * 0.02 + p.frameCount * 0.01) * 8;
        p.fill(45, 73, 72, alpha);
        p.text(backgroundChars.charAt(idx), col, row);
      }
    }

    p.textAlign(p.LEFT, p.BASELINE);
  }

  function drawFilmGrain() {
    p.noStroke();
    for (let i = 0; i < 220; i++) {
      p.fill(240, 230, 205, p.random(4, 14));
      p.circle(p.random(W), p.random(H), p.random(1, 2.4));
    }
  }

  function drawShadowUnderFlower(bloomT) {
    p.noStroke();
    p.fill(30, 28, 24, 30 + bloomT * 26);
    p.ellipse(W / 2, 245, 310 + bloomT * 160, 80 + bloomT * 25);
  }

  function drawCottonFlower(bloomT, frame) {
    let breathe = 1 + p.sin(frame * 0.025) * 0.018 * bloomT;
    p.scale(breathe);

    // central hanging dark threads from flower body
    p.stroke(35, 40, 38, 80 * bloomT);
    p.strokeWeight(1.4);
    for (let i = -9; i <= 9; i++) {
      let x = i * 9;
      p.line(x, 165, x + p.sin(frame * 0.01 + i) * 18, 330);
    }

    for (let i = petals.length - 1; i >= 0; i--) {
      petals[i].display(bloomT, frame);
    }

    // central dark crease lines
    p.stroke(82, 20, 22, 65 * bloomT);
    p.strokeWeight(1.2);
    for (let i = -4; i <= 4; i++) {
      p.line(i * 8, 8, i * 5, 200);
    }

    // flower core lower point
    p.noStroke();
    p.fill(90, 20, 22, 70 * bloomT);
    p.ellipse(0, 212, 60, 34);
  }

  function drawWindRibbons(frame) {
    p.noFill();
    p.stroke(239, 226, 197, 22);
    p.strokeWeight(1);

    for (let i = 0; i < 15; i++) {
      let y = 120 + i * 30;
      p.beginShape();
      for (let x = -40; x < W + 40; x += 28) {
        let yy = y + p.sin(x * 0.015 + frame * 0.02 + i) * (6 + Math.abs(wind) * 7);
        p.curveVertex(x, yy);
      }
      p.endShape();
    }
  }

  function drawLabel(frame) {
    p.noStroke();
    p.fill(39, 32, 26, 210);
    p.textSize(14);
    p.text("2D CANVAS 03 / COTTON FLOWER BLOOM / CLICK FLOWER TO REPLAY / MOVE MOUSE AS WIND", 34, H - 28);

    p.fill(39, 32, 26, 120);
    p.textSize(12);
    p.text("closed flower → bloom → threads extend → letters descend", 34, H - 50);
  }

  function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  class Petal {
    constructor(openX, openY, w, h, openRot, closedRot, scale, colorType) {
      this.openX = openX;
      this.openY = openY;
      this.w = w;
      this.h = h;
      this.openRot = openRot;
      this.closedRot = closedRot;
      this.scale = scale;
      this.colorType = colorType;
      this.seed = p.random(1000);
    }

    display(t, frame) {
      let closedX = this.openX * 0.18;
      let closedY = this.openY * 0.55;
      let x = p.lerp(closedX, this.openX, t);
      let y = p.lerp(closedY, this.openY, t);
      let rot = p.lerp(this.closedRot, this.openRot, t);
      let sx = p.lerp(0.42, this.scale, t);
      let sy = p.lerp(0.70, this.scale, t);

      let flutter = p.sin(frame * 0.018 + this.seed) * 0.025 * t;

      p.push();
      p.translate(x, y);
      p.rotate(rot + flutter);
      p.scale(sx, sy);

      if (this.colorType === 0) {
        p.fill(160, 111, 96);
      } else if (this.colorType === 1) {
        p.fill(149, 104, 91);
      } else {
        p.fill(92, 75, 69);
      }

      p.noStroke();

      // layered organic petal shape
      p.beginShape();
      p.vertex(0, -this.h * 0.50);
      p.bezierVertex(this.w * 0.48, -this.h * 0.38, this.w * 0.48, this.h * 0.22, 0, this.h * 0.50);
      p.bezierVertex(-this.w * 0.48, this.h * 0.22, -this.w * 0.48, -this.h * 0.38, 0, -this.h * 0.50);
      p.endShape(p.CLOSE);

      // highlight
      p.fill(205, 73, 60, 52);
      p.beginShape();
      p.vertex(-this.w * 0.08, -this.h * 0.43);
      p.bezierVertex(this.w * 0.18, -this.h * 0.25, this.w * 0.16, this.h * 0.22, -this.w * 0.03, this.h * 0.42);
      p.bezierVertex(-this.w * 0.12, this.h * 0.18, -this.w * 0.14, -this.h * 0.18, -this.w * 0.08, -this.h * 0.43);
      p.endShape(p.CLOSE);

      // fiber lines
      p.stroke(70, 18, 20, 34);
      p.strokeWeight(1);
      for (let i = -4; i <= 4; i++) {
        p.line(i * this.w * 0.055, -this.h * 0.38, i * this.w * 0.025, this.h * 0.38);
      }

      p.pop();
    }
  }

  class HangingLetter {
    constructor(anchorX, anchorY, len, endShift, index) {
      this.anchorX = anchorX;
      this.anchorY = anchorY;
      this.len = len;
      this.endShift = endShift;
      this.index = index;
      this.w = p.random(42, 68);
      this.h = p.random(56, 86);
      this.phase = p.random(p.TWO_PI);
      this.swing = 0;
      this.inkRows = p.floor(p.random(5, 9));
      this.hasStamp = p.random() > 0.55;
      this.baseRot = p.random(-0.18, 0.18);
    }

    update(wind, frame, threadT, reveal) {
      let delay = this.index * 0.035;
      let localReveal = p.constrain(p.map(reveal, 0, 1, 0 - delay, 1 - delay), 0, 1);
      this.localReveal = easeInOutCubic(localReveal);

      let inertia = 0.32 + (this.index % 7) * 0.035;
      this.swing = p.sin(frame * (0.018 + inertia * 0.006) + this.phase) * 0.22 + wind * (0.22 + inertia * 0.12);
    }

    display(threadT, reveal) {
      let grow = easeInOutCubic(threadT);
      let appear = this.localReveal || 0;

      let currentLen = this.len * grow;
      let endX = this.anchorX + p.sin(this.swing) * currentLen + this.endShift * appear;
      let endY = this.anchorY + p.cos(this.swing) * currentLen;

      // thread appears before letter
      p.stroke(35, 40, 38, 145 * grow);
      p.strokeWeight(1.05);
      p.line(this.anchorX, this.anchorY, endX, endY);

      if (appear <= 0.01) return;

      p.push();
      p.translate(endX, endY);
      p.rotate(this.baseRot + this.swing * 0.38);
      p.scale(appear);

      // shadow
      p.noStroke();
      p.fill(0, 0, 0, 35);
      p.rect(-this.w / 2 + 5, -this.h / 2 + 7, this.w, this.h, 2);

      // paper body
      p.fill(232, 217, 181, 238);
      p.rect(-this.w / 2, -this.h / 2, this.w, this.h, 2);

      // rough edge illusion
      p.fill(239, 226, 197, 150);
      p.triangle(-this.w / 2, -this.h / 2, -this.w / 2 + 10, -this.h / 2, -this.w / 2, -this.h / 2 + 10);

      // handwritten rows
      p.stroke(75, 62, 48, 120);
      p.strokeWeight(0.8);
      for (let i = 0; i < this.inkRows; i++) {
        let y = -this.h / 2 + 10 + i * 8;
        let margin = 6 + (i % 3) * 2;
        p.line(-this.w / 2 + margin, y, this.w / 2 - 7 - (i % 2) * 8, y);
      }

      // small vertical Chinese hints
      p.noStroke();
      p.fill(60, 48, 38, 130);
      p.textSize(6);
      p.text("願", -this.w / 2 + 8, -this.h / 2 + 20);
      p.text("家", -this.w / 2 + 8, -this.h / 2 + 34);

      if (this.hasStamp) {
        p.fill(143, 45, 45, 180);
        p.circle(this.w / 2 - 10, -this.h / 2 + 12, 8);
      }

      p.pop();
    }
  }
};

var redFlowerP5 = new p5(redFlowerSketch, "flower-canvas");
