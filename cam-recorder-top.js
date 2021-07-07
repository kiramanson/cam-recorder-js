(function camRecorder(options = {}) {
  const startButton = document.querySelector("svg#start");
  const camRotateButton = document.querySelector("svg.rotate");
  const flashButton = document.querySelector("svg.flash");
  const gumVideo = document.querySelector("video#gum");
  let faceCam = true;

  function getConstraints() {
    return {
      audio: false,
      video: {
        /* height: 1920, width: 1080, frameRate: 60, */
        // height: 1080, width: 1920, frameRate: 60,
        facingMode: faceCam ? "user" : "environment",
        // facingMode: { exact: "user" },
        // facingMode: 'facemode',
      },
    };
  }
  function getVideoTrack() {
    let trackReturn;
    gumVideo.srcObject.getTracks().forEach(function (track) {
      if (track.kind === "video") trackReturn = track;
    });
    return trackReturn;
  }

  startButton.addEventListener("click", async () => {
    /* console.log('Using media constraints:', constraints) */
    let consT = await getConstraints();
    await init(consT);

    // createOverlay()
  });

  camRotateButton.addEventListener("click", async () => {
    // faceCam = !faceCam;
    // restartCamera();
    const track = getVideoTrack();

    let facingMode = track.getConstraints().facingMode;

    track.applyConstraints({
      facingMode: facingMode === "environment" ? "user" : "environment",
    });
  });

  flashButton.addEventListener("click", async () => {
    const track = await getVideoTrack();
    console.log(track);
    let consT = track.getConstraints();
    let torch = false;

    if (consT.advanced) torch = consT.advanced[0].torch;

    track.applyConstraints({
      advanced: [{ torch: !torch }],
    });
  });

  function handleSuccess(stream) {
    /* console.log('getUserMedia() got stream:', stream) */
    window.stream = stream;

    gumVideo.srcObject = stream;
  }

  async function init(constraints) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      handleSuccess(stream);
    } catch (e) {
      console.error("navigator.getUserMedia error:", e);
      // errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
    }
  }

  async function restartCamera() {
    gumVideo.srcObject.getTracks().forEach(function (track) {
      track.stop();
    });
    let consT = await getConstraints();
    await init(consT);
  }
})();
