class CamRecorder {
  constructor(id) {
    this.recordButton = document.querySelector("svg#record");
    this.rotateButton = document.querySelector("svg#rotate");
    this.flashButton = document.querySelector("svg#flash");
    this.downloadButton = document.querySelector("button#download");
    this.gumVideo = document.querySelector("video#gum");
    this.footer = document.querySelector("p#footer > span")
    this.capabilities = document.querySelector("p#capabilities > code")
    this.counter = document.querySelector("p#counter > b")
    this.faceCam = true;
    this.torch = false;
    this.timer = 2; // time in seconds
    this.videoTime = 3; // time in seconds
    this.mediaRecorder = null;
    this.recordedBlobs = [];
    this.isMobile = false;
    this.stream = null;
    // this.aspectRatio = 0.5625 // 9:16
    // this.aspectRatio = 1.7777777778 // 16:9
    
    this.aspectRatio = {
      mobile: 1.45,
      desktop: 0.689655
    }

    this.init();
  }

  async showCamera() {
    const constraints = {
      audio: false,
      video: {
        facingMode: this.faceCam ? "user" : "environment",
        advanced: [{ torch: this.torch }],
        aspectRatio: this.isMobile ? this.aspectRatio.mobile : this.aspectRatio.desktop
      },
    };

    await this.initCamera(constraints);
  }
  
  async getVideoTrack() {
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
  
  initRecordListener() {
    this.recordButton.addEventListener('click', () => {
      this.countDown()
    })
  }
  
  countDown() {
    if(this.timer) {
      this.timer -= 1
      this.renderCountDown()
      setTimeout(() => { this.countDown() }, 1000)
      // this.setTimer(this.countDown)
    }  else {
      this.recordVideo()
    }   
  }
  
  renderCountDown() {
    console.log(this.timer + '...');
    this.counter.innerHTML = `${this.timer}...`
  }
  
  async recordVideo() {
    // const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    try {
      // this.mediaRecorder = await new MediaRecorder(window.stream, options);
      this.mediaRecorder = await new MediaRecorder(this.stream, options);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedBlobs.push(event.data);
          this.playRecordedVideo();
        }
      }
      // this.mediaRecorder.ondataavailable = this.handleDataAvailable;
      this.mediaRecorder.start();
      setTimeout(() => { this.stopRecording() }, this.videoTime * 1000)
      // this.setTimer(this.stopRecording, this.videoTime)
    } catch (e) {
      console.error('Exception while creating MediaRecorder:', e);
      return;
    }
  }
  
  stopRecording() {
    console.log('Fim da gravação!')
    this.mediaRecorder.stop();
    console.log('this.mediaRecorder')
    console.log(this.mediaRecorder)
  }
  
  handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      this.recordedBlobs.push(event.data);
      this.playRecordedVideo();
    }
  }
  
  // async playRecordedVideo() {
  playRecordedVideo() {
    // const superBuffer = new Blob(this.recordedBlobs, {type: 'video/webm'});
    const superBuffer = new Blob(this.recordedBlobs, { type: 'video/mp4' });
    // await this.stopCamera();
    this.stopCamera();
    this.gumVideo.src = null;
    this.gumVideo.srcObject = null;
    this.gumVideo.src = window.URL.createObjectURL(superBuffer);
    this.gumVideo.controls = true;
    this.gumVideo.play();
    this.downloadButton.classList.toggle('hidden');
  }
  
  initDownloadListener() {
    this.downloadButton.addEventListener('click', () => {
      this.downloadVideo()
    })
  }
  
  downloadVideo() {
    const blob = new Blob(this.recordedBlobs, { type: 'video/mp4' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test.mp4';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
  
  setTimer(action = () => {}, timer = 1) {
    setTimeout(() => { action() }, timer * 1000)
  }
  
  async initTorch() {
    this.footer.innerHTML = '';
    
    let track = await this.getVideoTrack();
    let capabilities = await track.getCapabilities();
    
    // window.alert(`Flash disponível pelo aparelho: ${capabilities.torch? 'Sim' : 'Não'}`);
    
    if(capabilities.torch) {
      this.torch = !this.torch;
      this.flashButton.addEventListener("click", () => {
        track.applyConstraints({
          advanced: [{ torch: this.torch }]
        });
      });
    }
    else this.flashButton.classList.toggle('hidden');
    
    this.footer.innerHTML = capabilities.torch ? 'Ligado' : 'Desligado';
    this.capabilities.innerHTML = `Flash disponível pelo aparelho: ${capabilities.torch ? 'Sim' : 'Não'}`
  }

  async handleSuccess(stream) {
    // window.stream = stream;
    this.stream = stream;
    this.gumVideo.srcObject = stream;
    await this.initRecordListener()
    await this.initTorch();
  }

  async init() {
    // pegar tipo de device: mobile ou desktop
    if (navigator.userAgentData != undefined && navigator.userAgentData.mobile) {
      window.alert('é mobile pohaaaaa carai');
      this.isMobile = true;
    }
    console.log('verificando userAgent: ', navigator.userAgent);
    console.log('verificando userAgentData: ', navigator.userAgentData);
    await this.showCamera();
    await this.changeCam();
    this.initDownloadListener()
  }
  
  async restartCamera() {
    let track = await this.getVideoTrack();
    await track.stop();
    this.torch = false
    await this.showCamera();
  }
  
  async stopCamera() {
    let track = await this.getVideoTrack();
    await track.stop();
  }
}

new CamRecorder("cam-recorder");
