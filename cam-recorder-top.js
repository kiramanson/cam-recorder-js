(function camRecorder(options = {}) {
  const startButton = document.querySelector("svg#start");
  const camRotateButton = document.querySelector("svg.rotate");
  const flashButton = document.querySelector("svg.flash");
  const gumVideo = document.querySelector("video#gum");
  let faceCam = true;
  
  function getConstraints() {
    return {
      audio: {
        echoCancellation: { exact: true },
      },
      video: {
        /* height: 1920, width: 1080, frameRate: 60, */
        // height: 1080, width: 1920, frameRate: 60,
        facingMode: faceCam ? "user" : "environment",
        // facingMode: { exact: "user" },
        // facingMode: 'facemode',
      },
    };
  }

  startButton.addEventListener("click", async () => {
    // const hasEchoCancellation = document.querySelector('#echoCancellation').checked;
    /* console.log('Using media constraints:', constraints) */
	let consT = await getConstraints()
    await init(consT);

    // createOverlay()
  });

  camRotateButton.addEventListener("click", async () => {
    faceCam = !faceCam;
    restartCamera();
  });
  
  flashButton.addEventListener("click", async () => {
    gumVideo
      .srcObject.getTracks()
      .forEach(function (track) {
        track.applyConstraints({
			advanced: [{torch: true}]
		  });
      });
  });

  function handleSuccess(stream) {
    /* console.log('getUserMedia() got stream:', stream) */ window.stream =
      stream;

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
    gumVideo
      .srcObject.getTracks()
      .forEach(function (track) {
        track.stop();
      });
	let consT = await getConstraints()
    await init(consT);
  }
})();
