(function camRecorder(options = {}) {
	const startButton = document.querySelector("svg#start");
	const camRotateButton = document.querySelector("svg.rotate");
	let faceCam = true;
  
	startButton.addEventListener("click", async () => {
	  // const hasEchoCancellation = document.querySelector('#echoCancellation').checked;
	  const constraints = {
		audio: {
		  echoCancellation: { exact: true },
		},
		video: {
		  /* height: 1920, width: 1080, frameRate: 60, */
		  // height: 1080, width: 1920, frameRate: 60,
		  facingMode: faceCam ? "user" : "environment"
		  // facingMode: { exact: "user" },
		  // facingMode: 'facemode',
		},
	  };
	  /* console.log('Using media constraints:', constraints) */ 
	  await init(constraints);
  
	  // createOverlay()
	});
	
	camRotateButton.addEventListener("click", async () => {
		faceCam = !faceCam
		restartCamera()
	});
  
	function handleSuccess(stream) {
	  /* console.log('getUserMedia() got stream:', stream) */ window.stream =
		stream;
  
	  const gumVideo = document.querySelector("video#gum");
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
	
	function restartCamera() {
		document.querySelector("video#gum").srcObject.getTracks().forEach(function (track) {
			track.stop();
		})
		switchCameraBtn()
		await init(constraints)
	}
  })();
  