// ----=  Faces  =----
/* load images here */
function prepareInteraction() {
  //bgImage = loadImage('/images/background.png');
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
        zIndex: '-1',                // sits behind canvas; change if not visible
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: '800',
        fontSize: '10vw',            // responsive size
        color: 'rgba(0,0,0,0.06)',   // subtle text; change as needed
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
let isMouthOpen = false;

function drawInteraction(faces, hands) {

   if (typeof document !== 'undefined') {
    let bgText = document.getElementById('bgText');
    if (bgText) {
      bgText.style.opacity = isMouthOpen ? '1' : '0';
    }
  }


  // for loop to capture if there is more than one face on the screen. This applies the same process to all faces. 
  for (let i = 0; i < faces.length; i++) {
    let face = faces[i]; // face holds all the keypoints of the face\
    //  console.log(face);
    if (showKeypoints) {
      drawPoints(face)
    }

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
    checkIfMouthOpen(face);
    if (isMouthOpen) {
      text("AHHHHHH", face.keypoints[287].x, face.keypoints[287].y)
    }

    /*
    Stop drawing on the face here
    */

  }
  //------------------------------------------------------
  // You can make addtional elements here, but keep the face drawing inside the for loop. 
}


function checkIfMouthOpen(face) {

  let upperLip = face.keypoints[13]
  let lowerLip = face.keypoints[14]
  // ellipse(lowerLip.x,lowerLip.y,20)
  // ellipse(upperLip.x,upperLip.y,20)

  let d = dist(upperLip.x, upperLip.y, lowerLip.x, lowerLip.y);
  //console.log(d)
  if (d < 10) {
    isMouthOpen = false;
  } else {
    isMouthOpen = true;
  }

}

function drawX(X, Y) {
  push()

  strokeWeight(15)
  line(X - 20, Y - 20, X + 20, Y + 20)
  line(X - 20, Y + 20, X + 20, Y - 20)

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