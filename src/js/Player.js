class Player {
    constructor(selector) {
        console.log('Instatiating Player...');
        
        this.options = null;
        this.mainEl = document.querySelector(selector);
        this.tooltipElement= document.getElementById('tooltip-span');
        this.audioContext = null;
        this.track = new Track();
        this.controls = new Controls();
        this.playTime= 0;
        this.prevPlayedTime=0;
        this.startPlayTime=0;
        this.playing= false;       
    }
    
    start(options) {
        console.log('Starting Player...');
        this.options = {...this.options, ...options};
        this.controls.render();
        this.waveformMarker = new WaveformMarker(this.mainEl, this.options.waveform);
        this.loadEvents();
    }

    loadEvents() {

        /**
         * Audio Context creation Event.
         */
        document.addEventListener('click', this.createAudioContext.bind(this));
        
        /**
         * Control Events
         */
        this.controls.getPlayElement().addEventListener('click', ()=>{
            if (!this.playing){
                this._playTrack();
            } else{
               this._pauseTrack();
            }
        });

        this.controls.getStopElement().addEventListener('click', ()=>{
            this._stopTrack();
        });

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
            if (this.audioContext){
                this.prevPlayedTime = evt.clientX * this.track.buffer.duration / this.options.waveform.canvasWidth;
                if(this.playing){
                    this._stopTrack();
                    this.prevPlayedTime = evt.clientX * this.track.buffer.duration  / this.options.waveform.canvasWidth;
                    this._playTrack();
                }
            }
        });
    }
    _playTrack(){
        console.log('playing track...');
        if (this.playing) return;

        this.audioContext.source = this.audioContext.createBufferSource();
        this.audioContext.source.buffer = this.track.buffer;
        this.audioContext.source.connect(this.audioContext.destination);
        this.audioContext.source.start(0, parseFloat(this.prevPlayedTime));
        this.audioContext.source.addEventListener('ended', () => {
            console.log('Audio ended...');
            console.log(this.track.buffer.duration);
            console.log(this.audioContext.currentTime);
            //TODO: How to detect when the audio finished by its own..
        });
        this.startPlayTime = this.audioContext.currentTime;
        this.playing = true;


        this.controls.getPlayElement().classList.remove('btn-success');
        this.controls.getPlayElement().classList.add('btn-warning');
        this.controls.getPlayElement().innerHTML = "PAUSE";
    }
    _pauseTrack(){
        console.log('Pausing track');
        
        this.playing = false;
        this.prevPlayedTime += this.audioContext.currentTime - this.startPlayTime;
        this.controls.getPlayElement().classList.remove('btn-warning');
        this.controls.getPlayElement().classList.add('btn-success');
        this.audioContext.source.stop();
        this.playButton.innerHTML = "PLAY";
    }
    _stopTrack(){
        console.log('Stopping track');
        this.audioContext.source.stop();
        this.playing = false;
        this.prevPlayedTime = 0;
        this.controls.getPlayElement().classList.remove('btn-warning');
        this.controls.getPlayElement().classList.add('btn-success');
        this.controls.getPlayElement().innerHTML = "PLAY";
    }
    createAudioContext() { 
        //this.waveformMarker.start(this.options.waveform); 
           
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
            
        } else {
            alert('Your browser does not support web audio api');
        }
    }

    loadAudioTrack() {
        return this.track.load(this.audioContext, this.waveformMarker, this); 
    }

    drawArea(initTime, endTime, color){
                
        // TODO: Covert time to pixels (timeToPixelConverter())
        let canvasContext = this.waveformMarker.getCanvas().getCanvasContext(); 
        canvasContext.beginPath();
        canvasContext.rect(initTime, 0, (endTime - initTime), this.options.waveform.canvasHeight);
        canvasContext.fillStyle = color;
        canvasContext.fill();
    }
    drawLine(currentTime, color){
        let canvasContext = this.waveformMarker.getCanvas().getCanvasContext()
        canvasContext.beginPath();
        canvasContext.moveTo(currentTime, 0);
        canvasContext.lineTo(currentTime, this.options.waveform.canvasHeight);
        canvasContext.strokeStyle = color;
        canvasContext.stroke();
    }
    draw(){
        let canvasContext = this.waveformMarker.getCanvas().getCanvasContext()
        canvasContext.clearRect(0, 0, this.options.waveform.canvasWidth, this.options.waveform.canvasHeight);
        this.waveformMarker.render(this.track.buffer);

        // Paint Areas
        for (let drawpoints of this.options.waveform.drawPoints) {
            this.drawArea(drawpoints.a, drawpoints.b, drawpoints.color);
        }

        if (this.playing){
            this.playTime = this.prevPlayedTime + this.audioContext.currentTime - this.startPlayTime;
            this.drawLine(parseInt(this.playTime * this.options.waveform.canvasWidth / this.track.buffer.duration), "yellow");
        } else{
            this.drawLine(parseInt(this.prevPlayedTime * this.options.waveform.canvasWidth / this.track.buffer.duration), "yellow");
        }
        if (this.mousemove){
            this.drawLine(parseInt(this.mouseX), "orange");
        }
        requestAnimationFrame(this.draw.bind(this));
    }
    
}