class CamRecorder {
  constructor(id) {
    this.recordButton = document.querySelector("svg#record");
    this.rotateButton = document.querySelector("svg#rotate");
    this.flashButton = document.querySelector("svg#flash");
    this.downloadButton = document.querySelector("button#download");
    this.gumVideo = document.querySelector("video#gum");
    this.footer = document.querySelector("p#footer > span");
    this.capabilities = document.querySelector("p#capabilities > code");
    this.counter = document.querySelector("section#counter > b");
    this.safeZone = document.querySelector("div#safe-zone");
    this.containerProgressBar = document.querySelector('.container-progress-bar');
    this.progressBar = document.querySelector('.progress-bar');
    // this.videoTimeDisplay = document.querySelector('span#video-time-display');
    this.videoCurrentTimeDisplay = document.querySelector('span#video-current-time-display');
    this.frameSteps = document.querySelector('p#frame-steps');
    this.timers = [...document.querySelectorAll("footer .timers button")];
    this.faceCam = true;
    this.torch = false;
    this.srcTimer = 5; // time in seconds
    this.timer = 6; // time in seconds
    this.videoTime = 16; // time in seconds
    this.mediaRecorder = null;
    this.recordedBlobs = [];
    this.isMobile = false;
    this.stream = null;
    this.frameStepsIndex = 0;
    this.frameStepsTimes = [0, 5];
    this.frameStepPhrases = [
      'Mostre a placa agora!',
      'Dê uma volta agora!'
    ]
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
        aspectRatio: this.isMobile ? this.aspectRatio.mobile : this.aspectRatio.desktop,
        width: { min: 640, ideal: 1920, max: 1920 },
        height: { min: 400, ideal: 1080 },
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
      // console.log((await navigator.mediaDevices.enumerateDevices()).filter(item => item.kind === 'videoinput'))
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
    if (this.timer) {
      this.showCountDown();
      setTimeout(() => { this.countDown() }, 1000);
    } else {
      this.hideCountDown();
      this.recordVideo();
    }
    this.timer--;
  }

  showCountDown() {
    document.getElementById("counter").style.display = "block";
    document.getElementById("start").style.display = "block";
    document.getElementById("actions").style.display = "none";
    this.counter.innerHTML = `${this.timer}`;
  }

  hideCountDown() {
    document.getElementById("counter").style.display = "none";
    document.getElementById("start").style.display = "none";
  }

  async recordVideo() {
    try {
      this.playSound()
      this.mediaRecorder = await new MediaRecorder(this.stream);
      document.getElementById("recording").style.display = "block";
      this.initProgressBar();
      console.log("Inicio da gravação");
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedBlobs.push(event.data);
          this.playRecordedVideo();
        }
      }
      this.mediaRecorder.start();
      setTimeout(() => { this.stopRecording() }, this.videoTime * 1000)
    } catch (e) {
      console.error('Exception while creating MediaRecorder:', e);
      return;
    }
  }

  initProgressBar() {
    this.containerProgressBar.style.visibility = 'visible';
    this.videoCurrentTimeDisplay.style.visibility = 'visible';
    this.progressBar.style.animation = `load ${this.videoTime}s linear`;
    this.startTimer();
  }

  startTimer() {
    // this.videoTimeDisplay.textContent = `00:${this.videoTime}`
    let timer = 0, seconds;
    setInterval(() => {
      this.verifySteps(timer);
      seconds = parseInt(timer % 60, 10);
      seconds = seconds < 10 ? "0" + seconds : seconds;
      this.videoCurrentTimeDisplay.textContent = "00:" + seconds;
      if (++timer >= this.videoTime) timer = this.videoTime;
    }, 1000);
  };

  verifySteps(timer) {
    if (this.frameStepsTimes.includes(timer)) {
      console.log(this.frameStepPhrases[this.frameStepsIndex]);
      this.frameSteps.style.display = "block";
      this.frameSteps.textContent = this.frameStepPhrases[this.frameStepsIndex];
      this.frameStepsIndex++
    }
  }

  stopRecording() {
    console.log('Fim da gravação!')
    document.getElementById("start").style.display = "none";
    document.getElementById("end").style.display = "block";
    document.getElementById("recording").style.display = "none";
    document.getElementById("frame-steps").style.display = "none";
    this.mediaRecorder.stop();
    console.log('this.mediaRecorder');
    console.log(this.mediaRecorder);
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
      this.downloadVideo();
    })
  }

  initSetTimerListener() {
    this.timers.forEach(item => {
      item.addEventListener('click', () => {
        let timer = parseInt(item.innerText.replace('s', ''));
        this.srcTimer = timer;
        this.timers.forEach(subItem => {
          subItem.classList.remove('active');
        })
        item.classList.add('active');
      })
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

  setTimer(timer) {
    this.srcTimer = timer;
  }

  async initTorch() {
    this.printCapabilities()
    let hasTorch = await this.verifyTorch();
    this.footer.innerHTML = 'Desligado';
    if (hasTorch) {
      this.flashButton.addEventListener("click", async () => {
        this.footer.innerHTML = 'Desligado';
        let track = await this.getVideoTrack();
        let hasTorchYet = await this.verifyTorch();
        if (hasTorchYet) {
          this.torch = !this.torch;
          track.applyConstraints({
            advanced: [{ torch: this.torch }],
          });
        }
        this.printCapabilities()
        this.footer.innerHTML = this.torch ? 'Ligado' : 'Desligado';
      });
    }
  }

  async printCapabilities() { // remover depois 
    const track = await this.getVideoTrack();
    const capabilities = await track.getCapabilities();
    console.log(capabilities)
    this.capabilities.innerHTML = `Lanterna disponível pelo aparelho: ${capabilities.torch ? "Sim" : "Não"} |||| userAgentData.mobile: ${JSON.stringify(window.navigator.userAgentData.mobile)} |||||| this.isMobile: ${this.isMobile} |||||| userAgent: ${window.navigator.userAgent} |||||  Capabilities: ${JSON.stringify(capabilities)}`;
  }

  async verifyTorch() {
    const track = await this.getVideoTrack();
    const capabilities = await track.getCapabilities();
    // window.alert('Lanterna disponível pelo aparelho: ' + capabilities.torch);
    if (capabilities.torch) {
      this.flashButton.classList.remove('hidden');
      return true;
    }
    this.flashButton.classList.add('hidden');
    return false;
  }

  async handleSuccess(stream) {
    // window.stream = stream;
    this.stream = stream;
    this.gumVideo.srcObject = stream;
  }

  playSound() {
    const audio = document.querySelector('audio');
    audio.play();
  }

  toggleEl(el) {
    el.classList.toggle('hidden');
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
    this.initDownloadListener();
    this.initSetTimerListener();
    // document.getElementById("counter").style.display = "none";
    // document.getElementById("start").style.display = "none";
    // document.getElementById("end").style.display = "none";
  }

  async restartCamera() {
    this.torch = false;
    await this.stopCamera();
    await this.showCamera();
    await this.verifyTorch();
  }

  async stopCamera() {
    let track = await this.getVideoTrack();
    await track.stop();
  }
}

new CamRecorder("cam-recorder");
