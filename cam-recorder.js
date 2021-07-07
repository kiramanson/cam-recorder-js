class CamRecorder {
  constructor(id) {
    console.log("iniciou");
    console.log(id);
    this.startButton = document.querySelector("svg#start");
    this.rotateButton = document.querySelector("svg#rotate");
    this.camRotateButton = document.querySelector("svg.rotate");
    this.gumVideo = document.querySelector("video#gum");
    this.faceCam = true;

    this.init();
  }

  async showCamera() {
    const constraints = {
      audio: {
        echoCancellation: { exact: true },
      },
      video: {
        facingMode: this.faceCam ? "user" : "environment",
      },
    };

    await this.record(constraints);
  }

  async record(constraints) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.handleSuccess(stream);
    } catch (e) {
      console.error("navigator.getUserMedia error:", e);
      // errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
    }
  }

  changeCam() {
    this.camRotateButton.addEventListener("click", () => {
      console.log("clicou");
      this.faceCam = !this.faceCam;
      this.showCamera();
    });
  }

  showFlash() {
    this.gumVideo.srcObject.getTracks().forEach((track) =>
      track.applyConstraints({
        advanced: [{ torch: true }],
      })
    );
  }

  handleSuccess(stream) {
    window.stream = stream;

    this.gumVideo.srcObject = stream;
  }

  async init() {
    await this.showCamera();
    await this.changeCam();
    await this.showFlash();
  }
}

new CamRecorder("cam-recorder");
