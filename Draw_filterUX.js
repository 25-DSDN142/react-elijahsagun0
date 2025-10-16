// ----=  HANDS  =----

// Hat image
let marioHat = null;
let showHat = true;
let hatX = 0;
let hatY = 0;
let hatScale = 1;
let hatAngle = 0;
const hatLerp = 0.25;

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
      console.log("🧢 Attempting to draw Mario hat...");

      // anchor above forehead
      let faceTopY = face.faceOval.centerY - (face.faceOval.height / 2);
      let hatWidth = face.faceOval.width * 1.8;
      let hatHeight = (marioHat.height / marioHat.width) * hatWidth;

      let targetX = face.faceOval.centerX;
      let targetY = faceTopY - hatHeight * 0.15; // adjust this if it's too high

      hatX = lerp(hatX, targetX, hatLerp);
      hatY = lerp(hatY, targetY, hatLerp);
      hatScale = lerp(hatScale, hatWidth / marioHat.width, hatLerp);

      push();
      imageMode(CENTER);
      translate(hatX, hatY);
      image(marioHat, 0, 0, marioHat.width * hatScale, marioHat.height * hatScale);
      pop();

      console.log("✅ Mario hat drawn at:", hatX.toFixed(1), hatY.toFixed(1), "scale:", hatScale.toFixed(2));
    } else {
      console.log("❌ Hat not drawn — showHat:", showHat, "marioHat:", marioHat, "width:", marioHat ? marioHat.width : "null");
    }
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