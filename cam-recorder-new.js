const startButton = document.querySelector("svg#start");
const rotateButton = document.querySelector("svg#rotate");
const flashButton = document.querySelector("svg#flash");
const gumVideo = document.querySelector("video#gum");
const footer = document.querySelector("p#footer > span");
const capabilities = document.querySelector("p#capabilities > code");
let faceCam = true;
let torch = false;

document.addEventListener("DOMContentLoaded", function (event) {
  console.log("DOM completamente carregado e analisado");
  showCamera();
});

async function showCamera() {
  const constraints = {
    audio: {
      echoCancellation: { exact: true },
    },
    video: {
      facingMode: faceCam ? "user" : "environment",
      advanced: [{ torch }],
    },
  };

  await record(constraints);
}

async function record(constraints) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    log(stream)
    handleSuccess(stream);
  } catch (e) {
    console.error("navigator.getUserMedia error:", e);
  }
}

function handleSuccess(stream) {
  window.stream = stream;

  gumVideo.srcObject = stream;
}

function getVideoTrack() {
  let trackReturn;
  gumVideo.srcObject.getTracks().forEach(function (track) {
    if (track.kind === "video") trackReturn = track;
  });

  let capabilities = trackReturn.getCapabilities();
  let capabilitiesString = JSON.stringify(capabilities);
  capabilities.innerHTML = capabilitiesString;
  console.log("capabilities: ", capabilities);

  return trackReturn;
}

function restartCamera() {
  let track = this.getVideoTrack();
  track.stop();
  this.showCamera();
}

flashButton.addEventListener("click", () => {
  console.log("clicou no flash");
  let track = getVideoTrack();
  console.log("track", track);
  torch = !torch;
  
  track.applyConstraints({
    advanced: [{ torch: torch }],
  });
  console.log("track", track);

  let constraints = track.getConstraints();
  console.log("constraints", constraints);
  footer.innerHTML = constraints.advanced[0].torch ? "Ligado" : "Desligado";
  // footer.innerHTML = constraints.advanced.torch ? "Ligado" : "Desligado";
});

rotateButton.addEventListener("click", () => {
  console.log("clicou no rotate");
  faceCam = !faceCam;
  restartCamera();
});
