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
      audio: false,
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
  
  async toggleTorch() {
    let track = await this.getVideoTrack();
    window.alert(`track`, track);
    this.torch = !this.torch;
    window.alert(`torch`, torch);
    track.applyConstraints({
      advanced: [{ torch: this.torch }]
    });
    this.footer.innerHTML = capabilities.torch ? 'Ligado' : 'Desligado';
  }
  
  async initTorch() {
    this.flashButton.removeEventListener("click", this.toggleTorch);
    this.footer.innerHTML = '';
    
    let track = await this.getVideoTrack();
    const capabilities = await track.getCapabilities();
    
    window.alert(`Flash disponível pelo aparelho: ${capabilities.torch? 'Sim' : 'Não'}`);
    
    if(capabilities.torch) this.flashButton.addEventListener("click", this.toggleTorch);
    else this.flashButton.classList.toggle('hidden');
    
    this.capabilities.innerHTML = `Flash disponível pelo aparelho: ${capabilities.torch? 'Sim' : 'Não'}`
    console.log('capabilities: ', capabilities);
  }

  async handleSuccess(stream) {
    window.stream = stream;
    this.gumVideo.srcObject = stream;
    await this.initTorch();
  }

  async init() {
    await this.showCamera();
    await this.changeCam();
  }
  
  async restartCamera() {
    let track = await this.getVideoTrack();
    await track.stop();
    this.torch = false
    await this.showCamera();
  }
}

new CamRecorder("cam-recorder");
