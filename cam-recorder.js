function camRecorder(options = {}) {

	/* globals MediaRecorder */

	let mediaRecorder;
	let recordedBlobs;

	const errorMsgElement = document.querySelector('span#errorMsg');
	const recordedVideo = document.querySelector('video#recorded');
	const mainVideo = document.querySelector('video#gum');
	const recordButton = document.querySelector('button#record');
	const playButton = document.querySelector('button#play');
	const downloadButton = document.querySelector('button#download');
	const startButton = document.querySelector('button#start');

	const defaultOptions = {
		constraints: { // stream constraints
			audio: {
				echoCancellation: {exact: true}
			},
			video: {
				/* height: 1920, width: 1080, frameRate: 60, */
				height: 1080, width: 1920, frameRate: 60,
				facingMode: ("facemode")
			}
		},
		recordStartTimer: 5, // time in seconds
		videoTime: 16000 // time in milliseconds
	}

	recordButton.addEventListener('click', () => {
	if (recordButton.textContent === 'Record') {
		renderTimer()
	} else {
		stopRecording();
	}
	});

	playButton.addEventListener('click', () => {
		stopCamera()
		const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
		mainVideo.src = null;
		mainVideo.srcObject = null;
		mainVideo.src = window.URL.createObjectURL(superBuffer);
		mainVideo.controls = true;
		mainVideo.play();
		
		let container = document.querySelector('div#recorded-container')
		});

		downloadButton.addEventListener('click', () => {
		const blob = new Blob(recordedBlobs, {type: 'video/mp4'});
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
	});

	function handleDataAvailable(event) {
		/* console.log('handleDataAvailable', event) */;
		if (event.data && event.data.size > 0) {
			recordedBlobs.push(event.data);
		}
	}

	function startRecording() {
		recordedBlobs = [];
		let options = {mimeType: 'video/webm;codecs=vp9,opus'};
		try {
			mediaRecorder = new MediaRecorder(window.stream, options);
			setTimeout(() => { stopRecording() }, 16000)
		} catch (e) {
			console.error('Exception while creating MediaRecorder:', e);
			errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
			return;
		}

		/* console.log('Created MediaRecorder', mediaRecorder, 'with options', options) */;
		recordButton.textContent = 'Stop Recording';
		playButton.disabled = true;
		downloadButton.disabled = true;
		mediaRecorder.onstop = (event) => {
			console.log('Recorder stopped: ', event);
			console.log('Recorded Blobs: ', recordedBlobs);
		};
		mediaRecorder.ondataavailable = handleDataAvailable;
		mediaRecorder.start();
		console.log('MediaRecorder started', mediaRecorder);
	
	}

	function stopRecording() {
		mediaRecorder.stop();
		recordButton.textContent = 'Record';
		playButton.disabled = false;
		downloadButton.disabled = false;
	}
	function handleSuccess(stream) {
		recordButton.disabled = false;
		switchCameraBtn()
		/* console.log('getUserMedia() got stream:', stream) */;
		window.stream = stream;

		const gumVideo = document.querySelector('video#gum');
		gumVideo.srcObject = stream;
	}

	async function init(constraints) {
		try {
			const stream = await navigator.mediaDevices.getUserMedia(constraints);
			handleSuccess(stream);
			
		} catch (e) {
			//console.error('navigator.getUserMedia error:', e);
			errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
		}
	}

	function stopCamera() {
	window.stream.getTracks().forEach(function (track) {
		track.stop();
	})
	switchCameraBtn()
	/* document.querySelector('div.overlay-container').remove() */
	document.querySelector('video#gum').srcObject = null
	}

	function switchCameraBtn() {
		if(startButton.textContent === 'Start camera') startButton.textContent = 'Stop camera';
	else startButton.textContent = 'Start camera'
	}

	document.querySelector('button#start').addEventListener('click', async () => {
		if(startButton.textContent === 'Start camera') {
		const hasEchoCancellation = document.querySelector('#echoCancellation').checked;
		const constraints = {
			audio: {
				echoCancellation: {exact: hasEchoCancellation}
			},
			video: {
				/* height: 1920, width: 1080, frameRate: 60, */
				// height: 1080, width: 1920, frameRate: 60,
				facingMode: ("facemode")
			}
		};
		/* console.log('Using media constraints:', constraints) */;
		await init(constraints);

		createOverlay()
	} else {
		stopCamera()
	}
	});

	function createOverlay() {
		let overlay = document.createElement('div')
		overlay.classList.add('overlay')
		
		let overlayContainer = document.createElement('div')
		overlayContainer.classList.add('overlay-container')
		overlayContainer.appendChild(overlay)

		let container = document.querySelector('div#video-container')
		/* container.appendChild(overlayContainer) */
		container.appendChild(overlayContainer)

		defineOverlaySize(overlay, overlayContainer)
		activateSlider(overlay, overlayContainer)
	}

	function defineOverlaySize(overlay, overlayContainer) {
		let videoTag = document.querySelector('video#gum')

		if(overlayContainer) {
		overlayContainer.style.height = `${videoTag.scrollHeight / 2}px`
		overlayContainer.style.width = `${videoTag.scrollWidth}px`
		}
	
		overlay.style.height = `${videoTag.scrollHeight / 4}px`
		overlay.style.width = `${videoTag.scrollWidth}px`
	
	}

	var mouseDown = false

	function activateSlider(overlay, overlayContainer) {
		overlayContainer.addEventListener('mousedown', e => {
			mouseDown = true
			resizeOverlay(overlay, overlayContainer)
			deactivateSlider(overlayContainer)
		})
	}
	function deactivateSlider(overlayContainer) {
		overlayContainer.addEventListener('mouseup', e => {
			mouseDown = false
		})
		overlayContainer.addEventListener('mouseleave', e => {
			mouseDown = false
		})
	}

	function resizeOverlay(overlay, overlayContainer) {
		overlayContainer.addEventListener('mousemove', e => {
			if(e.layerY > mainVideo.scrollHeight) {
				deactivateSlider()
			}
			else if(mouseDown) {
				overlay.style.height = `${e.layerY}px`
			}
		})
	}

	function countDown(action = () => {}, timer = 10, timerLabel = '') {
		if(timer < 0) {
			action()
			timerLabel.innerHTML = ''
			recordButton.disabled = false
			document.querySelector('p.timer-label').remove()
		} else {
			setTimeout(() => {
			console.log(timer)
			timerLabel.innerHTML = timer
				timer--
			countDown(action, timer, timerLabel)
			}, 1000)
		}
	} 

	function renderTimer() {
		playButton.disabled = true
		downloadButton.disabled = true
		recordButton.disabled = true
		recordButton.textContent = 'Stop Recording';
		let timerLabel = document.createElement('p')
		let overlayContainer = document.querySelector('div.overlay-container')
		overlayContainer.appendChild(timerLabel)
		timerLabel.classList.add('timer-label')
		let action = () => { startRecording() }
		let timer = 5
		countDown(action, timer, timerLabel)
	}
}
camRecorder()