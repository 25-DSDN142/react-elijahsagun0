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

function prepareInteraction() {
  marioHat = loadImage('mariohat.png');
}
console.log("Faces detected:", faces.length);
function drawInteraction(faces, hands) {

  // --- set page background color driven by detected face expression ---
  // (changes the website background, not the camera canvas)
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
  // USING THE GESTURE DETECTORS (check their values in the debug menu)
  // detectHandGesture(hand) returns "Pinch", "Peace", "Thumbs Up", "Pointing", "Open Palm", or "Fist"

  // for loop to capture if there is more than one hand on the screen. This applies the same process to all hands.
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    if (showKeypoints) {
      drawPoints(hand)
      drawConnections(hand)
    }
    // console.log(hand);
    /*
    Start drawing on the hands here
    */

    // let whatGesture = detectHandGesture(hand)
    // if (whatGesture == "Thumbs Up") {
    //   angel = true;
    // }
    // if (whatGesture == "Open Palm") {
    //   angel = false;
    // }

    /*
    Stop drawing on the hands here
    */
  }

  //------------------------------------------------------------
  //facePart
  // for loop to capture if there is more than one face on the screen. This applies the same process to all faces. 
  function draw() {
  image(marioHat, 100, 100, 200, 100);
}
  for (let i = 0; i < faces.length; i++) {
    let face = faces[i]; // face holds all the keypoints of the face
    if (showKeypoints) {
      drawPoints(face)
    }

    
    // console.log(face);
    /*
    Once this program has a face, it knows some things about it.
    This includes how to draw a box around the face, and an oval. 
    It also knows where the key points of the following parts are:
     face.leftEye
     face.leftEyebrow
     face.lips
     face.rightEye
     face.rightEyebrow
    */
    /*
    Start drawing on the face here
    */

    let faceWidth = face.faceOval.width;
    let faceheight = face.faceOval.height;
    let faceCenterX = face.faceOval.centerX;
    let faceCenterY = face.faceOval.centerY;

    

    // expressions changes colour background

        // --- MARIO HAT FILTER ---
    if (showHat && marioHat && marioHat.width > 0) {
      // Tilt-aware hat positioning using face landmarks
      // Prefer using provided leftEye/rightEye; fall back to common keypoint indices
      let leftEye = (face.leftEye && face.leftEye.centerX) ? face.leftEye : (face.keypoints[33] ? { centerX: face.keypoints[33].x, centerY: face.keypoints[33].y } : null);
      let rightEye = (face.rightEye && face.rightEye.centerX) ? face.rightEye : (face.keypoints[263] ? { centerX: face.keypoints[263].x, centerY: face.keypoints[263].y } : null);
      let nose = (face.nose && face.nose.x) ? face.nose : (face.keypoints[1] ? { x: face.keypoints[1].x, y: face.keypoints[1].y } : { x: face.faceOval.centerX, y: face.faceOval.centerY });

      // Compute tilt (roll) from eye line
      let tiltAngle = 0;
      if (leftEye && rightEye) {
        tiltAngle = atan2(rightEye.centerY - leftEye.centerY, rightEye.centerX - leftEye.centerX);
      }

      // Yaw offset: nose x relative to face center
      let faceCenterX = face.faceOval.centerX;
      let yawOffsetPx = (nose.x - faceCenterX) || 0;

      // Scale based on face width/height
      let targetHatWidth = face.faceOval.width * 1.6; // tune multiplier for your hat graphic

      // Position target: above forehead (use faceOval top)
      let faceTopY = face.faceOval.centerY - (face.faceOval.height / 2);
      let targetX = face.faceOval.centerX + yawOffsetPx * 0.10; // small lateral shift for yaw
      let targetY = faceTopY - (targetHatWidth * (marioHat.height / marioHat.width)) * 0.12; // slightly above forehead

      // Smooth transitions
      hatX = lerp(hatX, targetX, hatLerp);
      hatY = lerp(hatY, targetY, hatLerp);
      hatScale = lerp(hatScale, targetHatWidth / marioHat.width, hatLerp);
      hatAngle = lerp(hatAngle || 0, tiltAngle, hatLerp);

  // Draw rotated/scaled hat (flipped vertically to correct orientation)
  push();
  translate(hatX, hatY);
  rotate(hatAngle);
  // Flip vertically: scale Y by -1
  scale(1, -1);
  imageMode(CENTER);
  image(marioHat, 0, 0, marioHat.width * hatScale, marioHat.height * hatScale);
  pop();
    } else {
      // Hat not ready or disabled; silently continue
    }
  }
  // If smiling, draw corner flowers
  if (typeof currentFaceExpression !== 'undefined' && currentFaceExpression === 'Smiling') {
    // update pulse
    flowerPulse += flowerPulseSpeed;
    drawCornerFlowers(width - 100, 80, 3, flowerPulse);
  }
}
//     /*
//     Stop drawing on the face here
//     */

//   }
//   //------------------------------------------------------
//   // You can make addtional elements here, but keep the face drawing inside the for loop. 
// }


function drawConnections(hand) {
  // Draw the skeletal connections
  push()
  for (let j = 0; j < connections.length; j++) {
    let pointAIndex = connections[j][0];
    let pointBIndex = connections[j][1];
    let pointA = hand.keypoints[pointAIndex];
    let pointB = hand.keypoints[pointBIndex];
    stroke(255, 0, 0);
    strokeWeight(2);
    line(pointA.x, pointA.y, pointB.x, pointB.y);
  }
  pop()
}

// This function draw's a dot on all the keypoints. It can be passed a whole face, or part of one. 
function drawPoints(feature) {

  push()
  for (let i = 0; i < feature.keypoints.length; i++) {
    let element = feature.keypoints[i];
    noStroke();
    fill(0, 255, 0);
    circle(element.x, element.y, 5);
  }
  pop()

}