class Player {
    constructor(selector) {
        console.log('Instatiating Player...');
        
        this.options = null;
        this.mainEl = document.querySelector(selector);
        this.tooltip= new Tooltip();
        this.audioContext = null;
        this.track = new Track();
        this.controls = new Controls();
        this.playTime = 0;
        this.prevPlayedTime =  0;
        this.startPlayTime = 0;
        this.playing= false;     
        this.looping = false;
        this.bars = null;
    }
    /**
     * Entry point to start everything.
     * @param {*} options 
     */
    start(options) {
        console.log('Starting Player...');
        this.options = {...this.options, ...options};
        this.controls.render();
        this.tooltip.render();
        this.tooltipElement = document.getElementById('tooltip-span');
        this.waveformMarker = new WaveformMarker(this.mainEl, this.options.waveform);
        this.loadEvents();
    }

    /**
     * Load events for all interactions
     */
    loadEvents() {

        /**
         * Audio Context creation Event.
         */
        document.addEventListener('click', this.createAudioContext.bind(this));

        /**
         * Enable space bar click as play/pause
         */
        document.body.onkeyup = (e) => {
            if(e.keyCode == 32){
               this._handlePlay();
            }
        }
        
        /**
         * Control Events
         */
        this.controls.getPlayElement().addEventListener('click', this._handlePlay.bind(this));
        this.controls.getStopElement().addEventListener('click', this._stopTrack.bind(this));
        this.controls.getLoopElement().addEventListener('click', this._handleLoop.bind(this));

        /**
         * Waveform Events
         */
        this.waveformMarker.getCanvas().getCanvasElement().addEventListener('mousemove', (evt)=> {
            this.mousemove = true;
            this.mouseX = evt.clientX;

            let x = evt.clientX,
                y = evt.clientY;

            this.tooltipElement.style.display = 'block';
            this.tooltipElement.innerHTML = (evt.clientX * this.track.buffer.duration / this.options.waveform.canvasWidth).toFixed(3) + ' s';
            this.tooltipElement.style.top = (y + 10) + 'px';
            this.tooltipElement.style.left = (x + 10) + 'px';
        });

        this.waveformMarker.getCanvas().getCanvasElement().addEventListener('mouseout', (evt)=> {
            this.mousemove = false;
            this.tooltipElement.style.display = 'none';
        });

        this.waveformMarker.getCanvas().getCanvasElement().addEventListener('mousedown', (evt)=> {
            if (!this.audioContext) return;
            this.prevPlayedTime = evt.clientX * this.track.buffer.duration / this.options.waveform.canvasWidth;
            if (!this.playing) return;

            this._stopTrack();
            this.prevPlayedTime = evt.clientX * this.track.buffer.duration  / this.options.waveform.canvasWidth;
            this._playTrack();
        });

        /**
         * Double click event to add markers
         */
        this.waveformMarker.getCanvas().getCanvasElement().addEventListener('dblclick', (evt) => {
            console.log('Double click detected!'); 
            let rect = this.waveformMarker.getCanvas().getCanvasElement().getBoundingClientRect();            
            let mouseXPos = (evt.x - rect.left);
            let mouseYPos = (evt.y - rect.top);

            let marker = new Marker();
            marker.XPos = mouseXPos;
            marker.YPos = mouseYPos - marker.Height;
            marker.time = (evt.clientX * this.track.buffer.duration / this.options.waveform.canvasWidth);
            let time = (evt.clientX * this.track.buffer.duration / this.options.waveform.canvasWidth).toFixed(3) + ' s';
            let markerText = `${time}`;
            marker.text = markerText;

            if (this.waveformMarker.markers.length < 2) {
                this.waveformMarker.markers.push(marker);
            }

            this.waveformMarker.markers.sort((a,b) => (a.XPos > b.XPos) ? 1 : ((b.XPos > a.XPos) ? -1 : 0)); 
        });
    }
    
    _handlePlay() {
        if (!this.playing){
            this._playTrack();
        } else{
           this._pauseTrack();
        }
    }
    _handleLoop() {
        let element = this.controls.getLoopElement();
        let value = element.dataset.looping;
        
        if (!this.audioContext.source || this.waveformMarker.markers.length != 2) {
            console.log('missing init and end markers');

            return;    
        }
        
        if (value == 'true') {
            this.audioContext.source.loop = false;
            this.looping = false;
            this.waveformMarker.markers = [];
            element.dataset.looping = 'false';
            element.innerHTML = `<span><i class="fa fa-recycle"></i></span>`;
        } else {
            this.audioContext.source.loop = true;
            this.looping = true;
            this.audioContext.source.loopStart = this.waveformMarker.markers[0].time;
            this.audioContext.source.loopEnd = this.waveformMarker.markers[1].time;
            element.dataset.looping = "true";
            element.innerHTML = `<span><i class="fa fa-recycle"></i>&nbsp;off</span>`;
        }    
    }
    _playTrack(){
        console.log('playing track...');
        if (this.playing) return;

        this.audioContext.source = this.audioContext.createBufferSource();
        this.audioContext.source.buffer = this.track.buffer;
 
        this.audioContext.source.connect(this.analyser_.get());
        this.analyser_.get().connect(this.audioContext.destination);
        this.canvas = this.analyser_.getCanvas();

        this.analyser_.start();
        this.audioContext.source.start(0, parseFloat(this.prevPlayedTime));
        this.audioContext.source.addEventListener('ended', () => {
            console.log('Audio ended...');
            console.log(this.track.buffer.duration);
            //TODO: How to detect when the audio finished by its own..
        });
        this.startPlayTime = this.audioContext.currentTime;
        this.playing = true;

        this.controls.getPlayElement().classList.remove('btn-success');
        this.controls.getPlayElement().classList.add('btn-warning');
        this.controls.getPlayElement().innerHTML = `<span><i class="fas fa-pause"></i></span>`;

        this.updateAnalyser();
    }

    /**
     * Show the Analyser spectrum for current track.
     */
    updateAnalyser() {
        requestAnimationFrame(this.updateAnalyser.bind(this));
        this.analyser_.draw();
    }

    /**
     * 
     */
    _pauseTrack(){
        console.log('Pausing track');
        this.playing = false;
        this.prevPlayedTime += this.audioContext.currentTime - this.startPlayTime;
        this.controls.getPlayElement().classList.remove('btn-warning');
        this.controls.getPlayElement().classList.add('btn-success');
        this.audioContext.source.stop();
        this.controls.getPlayElement().innerHTML = `<span><i class="fas fa-play"></i></span>`;
    }
    /**
     * 
     */
    _stopTrack(){
        console.log('Stopping track');
        if (!this.audioContext) return;
        this.audioContext.source.stop();
        this.playing = false;
        this.prevPlayedTime = 0;
        this.controls.getPlayElement().classList.remove('btn-warning');
        this.controls.getPlayElement().classList.add('btn-success');
        this.controls.getPlayElement().innerHTML = `<span><i class="fas fa-play"></i></span>`;
    }

    /**
     * 
     */
    createAudioContext() {            
        //If it exists, do not create it
        if (this.audioContext !== null) {
            return;
        }
        let contextClass = (window.AudioContext ||
            window.webkitAudioContext ||
            window.mozAudioContext ||
            window.oAudioContext ||
            window.msAudioContext);
        if (contextClass) {
            this.audioContext = new contextClass();
            console.log(this.audioContext);
            this.loadAudioTrack();
            //this.createAnalyserElement();
            this.analyser_= new Analyser(this.audioContext.createAnalyser());
            this.analyser_.render(document.querySelector('.modal'), 470, 300);
            console.log(this.track.buffer);   
        } else {
            alert('Your browser does not support web audio api');
        }
    }
    /**
     * 
     */
    loadAudioTrack() {
        return this.track.load(this); 
    }
    /**
     * Print line marker given a Marker Object
     * @param {*} tempMarker 
     */
    printMarker(tempMarker) {
        let canvasContext = this.waveformMarker.getCanvas().getCanvasContext();
        let textMeasurements = canvasContext.measureText(tempMarker.text);
        canvasContext.fillStyle = "#666";
        canvasContext.globalAlpha = 0.7;
        canvasContext.fillRect(tempMarker.XPos - (textMeasurements.width / 2), tempMarker.YPos - 15, textMeasurements.width + 15, 20);
        canvasContext.globalAlpha = 1;

        // Draw position above
        canvasContext.fillStyle = "#000";
        canvasContext.fillText(tempMarker.text, tempMarker.XPos - 15, tempMarker.YPos);
    }
    /**
     * 
     */
    drawMarkers() {
        for (let i = 0; i < this.waveformMarker.markers.length; i++) {
            let tempMarker = this.waveformMarker.markers[i];
            this.drawLine(parseInt(tempMarker.XPos), "red");
            this.printMarker(tempMarker);
        }
    }

    /**
     * 
     */
    drawAreas() {
        for (let drawpoints of this.options.waveform.drawPoints) {
            this.drawArea(drawpoints.a, drawpoints.b, drawpoints.color);
        }
    }
    /**
     * 
     * @param {*} initTime 
     * @param {*} endTime 
     * @param {*} color 
     */
    drawArea(initTime, endTime, color){
                
        // TODO: Covert time to pixels (timeToPixelConverter())
        let canvasContext = this.waveformMarker.getCanvas().getCanvasContext(); 
        canvasContext.beginPath();
        canvasContext.rect(initTime, 0, (endTime - initTime), this.options.waveform.canvasHeight);
        canvasContext.fillStyle = color;
        canvasContext.fill();
    }
    /**
     * 
     * @param {*} currentTime 
     * @param {*} color 
     */
    drawLine(currentTime, color){
        let canvasContext = this.waveformMarker.getCanvas().getCanvasContext();
        canvasContext.beginPath();
        canvasContext.moveTo(currentTime, 0);
        canvasContext.lineTo(currentTime, this.options.waveform.canvasHeight);
        canvasContext.strokeStyle = color;
        canvasContext.stroke();
    }

    /**
     * 
     */
    handleDrawLine() {
        if (this.playing){
            this.playTime = this.prevPlayedTime + this.audioContext.currentTime - this.startPlayTime;
            if (this.looping && this.playTime >= (this.waveformMarker.markers[1].time)) {
                this.prevPlayedTime += -(this.waveformMarker.markers[1].time-this.waveformMarker.markers[0].time);
                this.drawLine(parseInt(this.waveformMarker.markers[0].time * this.options.waveform.canvasWidth / this.track.buffer.duration), "yellow");
            } else {
                this.drawLine(parseInt(this.playTime * this.options.waveform.canvasWidth / this.track.buffer.duration), "yellow");
            }
        } else {
            this.drawLine(parseInt(this.prevPlayedTime * this.options.waveform.canvasWidth / this.track.buffer.duration), "yellow");
        }
        if (this.mousemove){
            this.drawLine(parseInt(this.mouseX), "orange");
        }
    }

    /**
     * Print areas, markers if both exists and time cursor
     */
    draw(){
        let canvasContext = this.waveformMarker.getCanvas().getCanvasContext()
        canvasContext.clearRect(0, 0, this.options.waveform.canvasWidth, this.options.waveform.canvasHeight);
        this.waveformMarker.render(this.track.buffer);

        // Paint Areas
        this.drawAreas();

        // Draw marker
        this.drawMarkers();
        
        // Draw lines
        this.handleDrawLine();

        requestAnimationFrame(this.draw.bind(this));
    }
}