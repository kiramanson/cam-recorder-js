class CamRecorder {
  constructor(id) {
    console.log("iniciou");
    console.log(id);
    this.startButton = document.querySelector("svg#start");
    this.rotateButton = document.querySelector("svg#rotate");
    this.flashButton = document.querySelector("svg#flash");
    this.gumVideo = document.querySelector("video#gum");
    this.footer = document.querySelector("p#footer > span")
    this.faceCam = true;
    this.torch = true

    this.init();
  }

  async showCamera() {
    const constraints = {
      audio: {
        echoCancellation: { exact: true },
      },
      video: {
        facingMode: this.faceCam ? "user" : "environment",
        advanced: [{ torch: this.torch }],
      },
    };

    await this.record(constraints);
  }
  
  getVideoTrack() {
    let trackReturn;
    this.gumVideo.srcObject.getTracks().forEach(function (track) {
      if (track.kind === "video") trackReturn = track;
    });
    return trackReturn;
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
    this.rotateButton.addEventListener("click", () => {
      this.faceCam = !this.faceCam;
      this.restartCamera();
    });
  }

  async showFlash() {
    this.flashButton.addEventListener("click", async () => {
      
      
      let track = await this.getVideoTrack();
      this.torch = !this.torch;
      
      console.log(track.getConstraints())
      let constraints = track.getConstraints()
      
      this.footer.innerHTML = this.constraints.advanced[0].torch ? 'Ligado' : 'Desligado'
      
      
      this.restartCamera();
      return;
      
      track.applyConstraints({
        advanced: [{ torch: this.torch }],
      });
  });
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
  
  async restartCamera() {
    let track = await this.getVideoTrack();
    track.stop();
    await this.showCamera();
  }
}

new CamRecorder("cam-recorder");
