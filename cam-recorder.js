class CamRecorder {
  constructor(id) {
    this.recordButton = document.querySelector("svg#record");
    this.rotateButton = document.querySelector("svg#rotate");
    this.flashButton = document.querySelector("svg#flash");
    this.downloadButton = document.querySelector("button#download");
    this.gumVideo = document.querySelector("video#gum");
    this.footer = document.querySelector("p#footer > span")
    this.capabilities = document.querySelector("p#capabilities > code")
    this.counter = document.querySelector("div#counter > b")
    this.faceCam = true;
    this.torch = false;
    this.srcTimer = 6; // time in seconds
    this.timer = 6; // time in seconds
    // this.timer = 5.1; // time in seconds
    // this.timer = 5300; // time in miliseconds
    // this.timer = 5000; // time in miliseconds
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
      this.timer = this.srcTimer
      this.countDown()
    })
  }
  
  countDown() {
    if(this.timer) {
      this.renderCountDown();
      this.timer -= 1
      // this.timer -= 1000
      setTimeout(() => { this.countDown() }, 1000);
      // this.setTimer(this.countDown)
    }  else {
      this.recordVideo();
    }

    // if (!this.timer) return this.recordVideo();

    // setTimeout(() => {
    //   console.log('caiu no setTimeout, diminuir 1s');
    //   this.renderCountDown();
    //   this.timer -= 1000;
    // }, this.timer);
  }
  
  renderCountDown() {
    console.log(`${this.timer - 1}...`);
    // if(this.timer > 0){
    //   document.getElementById("counter").style.display = "block";
    //   this.counter.innerHTML = `${this.timer}`;
    // } else {
    //   document.getElementById("counter").style.display = "none";
    // }
    if(this.timer <= 1) return document.getElementById("counter").style.display = "none";

    document.getElementById("counter").style.display = "block";
    document.getElementById("start").style.display = "block";
    document.getElementById("actions").style.display = "none";
    this.counter.innerHTML = `${this.timer - 1}`;
  }
  
  async recordVideo() {
    // const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    // const options = { mimeType: 'video/webm;codecs=vp9' }; 
    // opus é codec de áudio, por isso removi, não precisamos definir, pode ser um ponto de quebra no iphone, tentar adicionar codec de algo que não estamos capturando
    // vou esperar a paola testar antes dessa alteração e depois subir isso pra testar com essa modificação
    try {
      // this.mediaRecorder = await new MediaRecorder(window.stream, options);
      this.playSound()
      console.log("Inicio da gravação");
      document.getElementById("recording").style.display = "block";
      // document.getElementById("start").style.display = "block";
      // document.getElementById("actions").style.display = "none";
      this.mediaRecorder = await new MediaRecorder(this.stream);
      
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
    document.getElementById("start").style.display = "none";
    document.getElementById("end").style.display = "block";
    document.getElementById("recording").style.display = "none";
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
    window.alert('lanterna: ' + capabilities.torch)
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
    this.capabilities.innerHTML = `userAgentData.mobile: ${JSON.stringify(window.navigator.userAgentData.mobile)} |||||| this.isMobile: ${this.isMobile} |||||| userAgent: ${window.navigator.userAgent} |||||  Capabilities: ${JSON.stringify(capabilities)}`
  }

  async handleSuccess(stream) {
    // window.stream = stream;
    this.stream = stream;
    this.gumVideo.srcObject = stream;
  }
  
  playSound() {
    const audio = document.querySelector('audio')
    audio.play()
  }
  
  toggleEl(el) {
    el.classList.toggle('hidden')
  }

  async init() {
    // pegar tipo de device: mobile ou desktop
    const userAgent = window.navigator.userAgent;
    const userAgentData = window.navigator.userAgentData;
    if (userAgentData != undefined && userAgentData.mobile || userAgent.match(/Mobile/i)) {
      window.alert('é mobile');
      this.isMobile = true;
    }
    console.log('verificando userAgent: ', userAgent);
    console.log('verificando userAgentData: ', userAgentData);
    await this.showCamera();
    await this.changeCam();
    await this.initRecordListener()
    await this.initTorch();
    this.initDownloadListener()
    // document.getElementById("counter").style.display = "none";
    // document.getElementById("start").style.display = "none";
    // document.getElementById("end").style.display = "none";
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
