// ----=  HANDS  =----

// Hat image
let marioHat = null;
let showHat = true;
let hatX = 0;
let hatY = 0;
let hatScale = 1;
let hatAngle = 0;
const hatLerp = 0.25;

// Flower decoration state
let flowerPulse = 0;
let flowerPulseSpeed = 0.05;
let flowerColors = ['#FF6B6B', '#FFD166', '#6EE7B7', '#8AB4FF'];

// Bear decoration state
let bearX = 0;
let bearY = 0;
let bearScale = 1;
const bearLerp = 0.18;

// Mushroom state
let mushX = 60;
let mushY = 60;
let mushScale = 1;
let mushLerp = 0.18;

// cake pulse (for small candle flicker)
let cakePulse = 0;
let cakePulseSpeed = 0.06;

// --- BLUSH FILTER STATE ---
let blushAmount = 0;        // current rendered blush intensity (0..1)
let blushTarget = 0;        // target intensity set by gestures
const blushLerp = 0.12;     // smoothing for blush transitions
let blushImg = null;        // optional image for blush

let isMouthOpen = false;

function prepareInteraction() {
  // load images from images/ folder
  marioHat = loadImage('mariohat.png');
  blushImg = loadImage('blush.png');

  if (typeof document !== 'undefined') {
    let bgText = document.getElementById('bgText');
    if (!bgText) {
      bgText = document.createElement('div');
      bgText.id = 'bgText';
      Object.assign(bgText.style, {
        position: 'fixed',
        inset: '0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: '-1',                 // change if you need it above canvas
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        fontSize: '30vw',
        color: 'rgba(0,0,0,0.06)',
        textTransform: 'lowercase',
        letterSpacing: '0.02em',
        transition: 'opacity 200ms ease',
        opacity: '0',
        mixBlendMode: 'normal'
      });
      bgText.innerText = 'ahhhh';
      document.body.appendChild(bgText);
    }
  }
}

console.log("Faces detected:", typeof faces !== 'undefined' ? faces.length : 0);

function drawInteraction(faces, hands) {

  // --- set page background color driven by detected face expression ---
  let expr = (typeof currentFaceExpression !== 'undefined') ? currentFaceExpression : 'None';
  try {
    let bg = '#ffffff';
    if (expr === 'Surprised') {
      bg = '#ff6e6eff'; // light red
    } else if (expr === 'Smiling') {
      bg = '#FFD27A'; // warm orange
    } else {
      bg = '#ffffff';
    }
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.transition = 'background-color 300ms ease';
      document.body.style.backgroundColor = bg;
    }
  } catch (e) {
    // ignore if not in browser
  }

  // hands part
  // detectHandGesture(hand) returns "Pinch", "Peace", "Thumbs Up", "Pointing", "Open Palm", or "Fist"
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    if (showKeypoints) {
      drawPoints(hand);
      drawConnections(hand);
    }

    // Use gestures to control blushTarget instead of 'angel'
    let whatGesture = detectHandGesture(hand);
    if (whatGesture === "Thumbs Up") {
      blushTarget = 1; // enable blush
    } else if (whatGesture === "Open Palm") {
      blushTarget = 0; // disable blush
    }
  }

  //------------------------------------------------------------
  // facePart
  // for loop to capture if there is more than one face on the screen.
  function draw() {
    // stray helper left intentionally (kept from original)
    image(marioHat, 100, 100, 200, 100);
  }

  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];
    if (showKeypoints) {
      drawPoints(face);
    }

    // face geometry
    let faceWidth = face.faceOval.width;
    let faceheight = face.faceOval.height;
    let faceCenterX = face.faceOval.centerX;
    let faceCenterY = face.faceOval.centerY;

    // --- BLUSH: update and draw blush on cheeks ---
    blushAmount = lerp(blushAmount, blushTarget, blushLerp);

    if (blushAmount > 0.01) {
      let alpha = 180 * blushAmount;

      // compute eye fallbacks
      let leftEye = (face.leftEye && face.leftEye.centerX) ? face.leftEye : (face.keypoints && face.keypoints[33] ? { centerX: face.keypoints[33].x, centerY: face.keypoints[33].y } : null);
      let rightEye = (face.rightEye && face.rightEye.centerX) ? face.rightEye : (face.keypoints && face.keypoints[263] ? { centerX: face.keypoints[263].x, centerY: face.keypoints[263].y } : null);

      const singleBlushOffsetX = -0.1; // positive moves blush to the right, negative to the left (fraction of face width)
      const singleBlushOffsetY = 0.12; // vertical offset down from eye (fraction of face height)
      const singleBlushScale = 4.0;    // 1.0 = default size, >1 larger, <1 smaller

      // base cheek sizes relative to face (scaled by singleBlushScale)
      let cheekW = face.faceOval.width * 0.26 * (0.8 + 0.4 * blushAmount) * singleBlushScale;
      let cheekH = face.faceOval.height * 0.12 * (0.8 + 0.4 * blushAmount) * singleBlushScale;

      // compute base position (use left eye if available)
      let baseLeftCheekX = leftEye ? leftEye.centerX - face.faceOval.width * 0.08 : faceCenterX - face.faceOval.width * 0.22;
      // apply horizontal offset in pixels (fraction * face width)
      let leftCheekX = baseLeftCheekX + singleBlushOffsetX * face.faceOval.width;
      // compute Y from eye/center plus offset
      let cheekY = (leftEye ? leftEye.centerY : faceCenterY - face.faceOval.height * 0.08) + face.faceOval.height * singleBlushOffsetY;

      // draw single blush (image or ellipse)
      if (blushImg && blushImg.width > 0) {
        push();
        imageMode(CENTER);
        tint(255, 180 * blushAmount);
        image(blushImg, leftCheekX, cheekY, cheekW, cheekH);
        noTint();
        pop();
      } else {
        push();
        noStroke();
        fill(255, 120, 130, 180 * blushAmount);
        translate(leftCheekX, cheekY);
        ellipse(0, 0, cheekW, cheekH);
        pop();
      }
    }

    // --- MARIO HAT FILTER ---
    if (showHat && marioHat && marioHat.width > 0) {
      // tilt-aware hat positioning
      let leftEye = (face.leftEye && face.leftEye.centerX) ? face.leftEye : (face.keypoints && face.keypoints[33] ? { centerX: face.keypoints[33].x, centerY: face.keypoints[33].y } : null);
      let rightEye = (face.rightEye && face.rightEye.centerX) ? face.rightEye : (face.keypoints && face.keypoints[263] ? { centerX: face.keypoints[263].x, centerY: face.keypoints[263].y } : null);
      let nose = (face.nose && face.nose.x) ? face.nose : (face.keypoints && face.keypoints[1] ? { x: face.keypoints[1].x, y: face.keypoints[1].y } : { x: face.faceOval.centerX, y: face.faceOval.centerY });

      let tiltAngle = 0;
      if (leftEye && rightEye) {
        tiltAngle = atan2(rightEye.centerY - leftEye.centerY, rightEye.centerX - leftEye.centerX);
      }

      // use existing faceCenterX
      let yawOffsetPx = (nose.x - faceCenterX) || 0;

      let targetHatWidth = face.faceOval.width * 1.6;
      let faceTopY = face.faceOval.centerY - (face.faceOval.height / 2);
      let targetX = faceCenterX + yawOffsetPx * 0.10;
      let targetY = faceTopY - (targetHatWidth * (marioHat.height / marioHat.width)) * 0.12;

      hatX = lerp(hatX, targetX, hatLerp);
      hatY = lerp(hatY, targetY, hatLerp);
      hatScale = lerp(hatScale, targetHatWidth / marioHat.width, hatLerp);
      hatAngle = lerp(hatAngle || 0, tiltAngle, hatLerp);

      push();
      translate(hatX, hatY);
      rotate(hatAngle);
      scale(1, -1); // flip vertically so hat is upright
      imageMode(CENTER);
      image(marioHat, 0, 0, marioHat.width * hatScale, marioHat.height * hatScale);
      pop();
    }

    checkIfMouthOpen(face);
    if (isMouthOpen) {
      push();
      textAlign(CENTER, CENTER);
      textSize(max(60, face.faceOval.width * 0.4)); // responsive size
      fill(255, 255, 255, 200); // change color/alpha as desired
      stroke(0, 80);
      strokeWeight(2);
      text('AHHHHH', face.faceOval.centerX, face.faceOval.centerY - face.faceOval.height * -1.0);
      pop();
    }

  } // end faces loop

  // If smiling, draw corner flowers and bear
  if (typeof currentFaceExpression !== 'undefined' && currentFaceExpression === 'Smiling') {
    flowerPulse += flowerPulseSpeed;
    drawCornerFlowers(width - 100, 80, 2, flowerPulse);

    let targetBearX = 80; // bottom-left padding
    let targetBearY = height - 80;
    let targetBearScale = 8.0;
    bearX = lerp(bearX, targetBearX, bearLerp);
    bearY = lerp(bearY, targetBearY, bearLerp);
    bearScale = lerp(bearScale, targetBearScale, bearLerp);
    drawBear(bearX, bearY, 40 * bearScale);
  }

  // If surprised, draw mushroom and cake
  if (typeof currentFaceExpression !== 'undefined' && currentFaceExpression === 'Surprised') {
    mushX = lerp(mushX, 60, mushLerp);
    mushY = lerp(mushY, 60, mushLerp);
    mushScale = lerp(mushScale, 8.0, mushLerp);
    drawMushroom(mushX, mushY + 60, 48 * mushScale);

    cakePulse += cakePulseSpeed;
    drawCake(width - 80, height - 100, 360, cakePulse);
  }

  if (typeof document !== 'undefined') {
    let bgText = document.getElementById('bgText');
    if (bgText) bgText.style.opacity = isMouthOpen ? '1' : '0';
  }
}
// end drawInteraction


function drawConnections(hand) {
  push();
  for (let j = 0; j < connections.length; j++) {
    let pointAIndex = connections[j][0];
    let pointBIndex = connections[j][1];
    let pointA = hand.keypoints[pointAIndex];
    let pointB = hand.keypoints[pointBIndex];
    stroke(255, 0, 0);
    strokeWeight(2);
    line(pointA.x, pointA.y, pointB.x, pointB.y);
  }
  pop();
}

// This function draws a dot on all the keypoints. It can be passed a whole face, or part of one. 
function drawPoints(feature) {
  push();
  for (let i = 0; i < feature.keypoints.length; i++) {
    let element = feature.keypoints[i];
    noStroke();
    fill(0, 255, 0);
    circle(element.x, element.y, 5);
  }
  pop();
}

// Draw multiple flowers in a cluster (x,y is cluster center)
function drawCornerFlowers(x, y, count, t) {
  push();
  translate(x, y);
  for (let i = 0; i < count; i++) {
    let angle = i * TWO_PI / count + t * 0.3;
    let rx = cos(angle) * (20 + i * 18);
    let ry = sin(angle) * (8 + i * 10);
    let scale = 0.8 + 0.15 * sin(t + i);
    drawFlower(rx, ry, 300 * scale, flowerColors[i % flowerColors.length]);
  }
  drawFlower(0, 0, 100 + 4 * sin(t), '#FFFFFF');
  pop();
}

// Draw a simple stylized flower at (x,y) with radius r and color
function drawFlower(x, y, r, col) {
  push();
  translate(x, y);
  noStroke();
  fill(col);
  for (let p = 0; p < 6; p++) {
    let a = p * TWO_PI / 6;
    let px = cos(a) * r * 0.6;
    let py = sin(a) * r * 0.6;
    ellipse(px, py, r * 0.9, r * 0.55);
  }
  fill('#FFDD66');
  circle(0, 0, r * 0.8);
  pop();
}

// Draw a simple stylized bear face at (x,y) with size s (diameter)
function drawBear(x, y, s) {
  push();
  translate(x, y);
  noStroke();
  fill('#C68642');
  circle(0, 0, s);
  fill('#C68642');
  circle(-s * 0.35, -s * 0.45, s * 0.4);
  circle(s * 0.35, -s * 0.45, s * 0.4);
  fill('#8B5A2B');
  circle(-s * 0.35, -s * 0.45, s * 0.22);
  circle(s * 0.35, -s * 0.45, s * 0.22);
  fill('#F5D6B1');
  ellipse(0, s * 0.12, s * 0.6, s * 0.45);
  fill('#6B3E1B');
  circle(0, s * 0.12, s * 0.18);
  fill(20);
  circle(-s * 0.18, -s * 0.05, s * 0.12);
  circle(s * 0.18, -s * 0.05, s * 0.12);
  fill('rgba(255,120,120,0.25)');
  ellipse(-s * 0.34, 0, s * 0.25, s * 0.14);
  ellipse(s * 0.34, 0, s * 0.25, s * 0.14);
  pop();
}

// Draw a simple cartoon mushroom at (x,y) of size s
function drawMushroom(x, y, s) {
  push();
  translate(x, y);
  noStroke();
  fill('#FFF5E1');
  rectMode(CENTER);
  rect(0, s * 0.16, s * 0.28, s * 0.6, s * 0.08);
  fill('#8B0000');
  arc(0, 0, s * 1.2, s * 0.8, PI, TWO_PI);
  fill('#FF4B6E');
  arc(0, -s * 0.02, s * 1.2, s * 0.8, PI, TWO_PI);
  fill('#FFFFFF');
  circle(-s * 0.25, -s * 0.05, s * 0.14);
  circle(0, -s * 0.12, s * 0.12);
  circle(s * 0.22, -s * 0.02, s * 0.10);
  pop();
}

// Draw a simple cake with candles at (x,y). r controls overall size, t drives flicker
function drawCake(x, y, r, t) {
  push();
  translate(x, y);
  rectMode(CENTER);
  noStroke();
  let pulse = 1 + 0.08 * sin(t);
  let baseW = r * 1.6 * pulse;
  let baseH = r * 0.6 * pulse;
  fill('#F5C7A9');
  rect(0, 0, baseW, baseH, 8 * pulse);
  fill('#FF9FB1');
  rect(0, -baseH * 0.45, baseW * 0.9, baseH * 0.5, 6 * pulse);
  fill('#FFE9A8');
  rect(0, -baseH * 0.85, baseW * 0.6, baseH * 0.35, 6 * pulse);
  let candles = 3;
  let spacing = baseW / (candles + 1);
  for (let i = 0; i < candles; i++) {
    let cx = -baseW / 2 + spacing * (i + 1);
    let cy = -baseH * 1.05;
    fill('#FFF');
    rect(cx, cy, baseW * 0.06, baseH * 0.4, 3 * pulse);
    stroke(40);
    strokeWeight(max(1, 2 * pulse));
    line(cx, cy - baseH * 0.25, cx, cy - baseH * 0.35);
    noStroke();
    let flameH = baseH * 0.18 + sin(t + i) * (baseH * 0.04);
    fill('#FFD76B');
    ellipse(cx, cy - baseH * 0.36 - flameH * 0.25, baseW * 0.06, flameH);
    fill('#FF6B6B');
    ellipse(cx, cy - baseH * 0.36 - flameH * 0.45, baseW * 0.035, flameH * 0.6);
  }
  pop();
}

// Check if the mouth is open based on face keypoints
function checkIfMouthOpen(face) {
  let lowerLip = face.keypoints[14];
  let upperLip = face.keypoints[13];
  let d = dist(upperLip.x, upperLip.y, lowerLip.x, lowerLip.y);
  isMouthOpen = d >= 10; // tune threshold as needed
}