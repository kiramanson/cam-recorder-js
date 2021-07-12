class CamRecorder {
  constructor(id) {
    this.startButton = document.querySelector("svg#start");
    this.rotateButton = document.querySelector("svg#rotate");
    this.flashButton = document.querySelector("svg#flash");
    this.gumVideo = document.querySelector("video#gum");
    this.footer = document.querySelector("p#footer > span")
    this.capabilities = document.querySelector("p#capabilities > code")
    this.faceCam = true;
    this.torch = false

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

    await this.initCamera(constraints);
    
  }
  
  getVideoTrack() {
    let trackReturn;
    this.gumVideo.srcObject.getTracks().forEach(function (track) {
      if (track.kind === "video") trackReturn = track;
    });
    
    return trackReturn;
  }

  async initCamera(constraints) {
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
    const track = await this.getVideoTrack();
    const capabilities = track.getCapabilities()
    
    if(capabilities.torch) {
      this.flashButton.addEventListener("click", async () => {
        this.torch = !this.torch;
        
        track.applyConstraints({
          advanced: [{ torch: this.torch }]
        })
        
        this.footer.innerHTML = capabilities.torch ? 'Ligado' : 'Desligado'
      });
    } else {
      // let capabilitiesString = JSON.stringify(capabilities)
      this.capabilities.innerHTML = `Flash disponível pelo aparelho: ${capabilities.torch? 'Sim' : 'Não'}`
      console.log('capabilities: ', capabilities)
    }
  }

  async handleSuccess(stream) {
    window.stream = stream;

    this.gumVideo.srcObject = stream;
    
    await this.showFlash();
  }

  async init() {
    await this.showCamera();
    await this.changeCam();
  }
  
  async restartCamera() {
    let track = await this.getVideoTrack();
    track.stop();
    await this.showCamera();
  }
}

new CamRecorder("cam-recorder");
