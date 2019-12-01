(function(){
    'use-strict';
    
     const App = {

        options: {
            canvasWidth: window.innerWidth, 
            canvasHeight: 300,
            drawLines: 300
        },
         
        //DOM Elements
        audioElement: document.querySelector('audio'),
        // Properties
        canvas: null,
        audioContext: null,
        track:null,
        playTime: 0,
        prevPlayedTime:0,
        startPlayTime:0,
        playing: false,

        // Methods
        // Private
        _createCanvas(w, h) {
            console.log('Creating Canvas...');
            
            if (this.canvas) {
                return;
            }
            
            let newCanvas = document.createElement('canvas');
            newCanvas.width  = w;     
            newCanvas.height = h;
            document.body.appendChild(newCanvas);
                           
            newCanvas.addEventListener('mousemove', (evt)=> {
                this.mousemove = true;
                this.mouseX = evt.clientX;
                const tooltipSpan = document.getElementById('tooltip-span');

                let x = evt.clientX,
                    y = evt.clientY;

                tooltipSpan.style.display = 'block';
                tooltipSpan.innerHTML = (evt.clientX * this.track.duration / this.options.canvasWidth).toFixed(3);
                tooltipSpan.style.top = (y + 10) + 'px';
                tooltipSpan.style.left = (x + 10) + 'px';
                
            });

            newCanvas.addEventListener('mouseout', (evt)=> {
                this.mousemove = false;
            });

            newCanvas.addEventListener('mousedown', (evt)=> {
                if (this.audioContext){
                    this.prevPlayedTime = evt.clientX * this.track.duration / this.options.canvasWidth;
                    if(this.playing){
                        this._stopTrack();
                        this.prevPlayedTime = evt.clientX * this.track.duration / this.options.canvasWidth;
                        this._playTrack();
                    }
                }
            });

            this.canvas = newCanvas.getContext('2d');
        },
        _loadEvents() {
            document.addEventListener('click', this._createAudioContext.bind(this));
        },

        _createAudioContext() {
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
                this._createTrack();
            } else {
                alert('Your browser does not support web audio api');
            }
        },
        _createTrack() {
            if (this.track) {
                return;
            }
            let request = new XMLHttpRequest();
            request.open('GET', 'track.wav', true);
            request.responseType = 'arraybuffer';
            request.onload = () => {
                this.audioContext.decodeAudioData(request.response, (buffer) => {
                    this.track = buffer;
                    requestAnimationFrame(this.draw.bind(this));
                });
            }
            request.send();
        },
        _displayTrack() {
            let leftChannel = this.track.getChannelData(0);  
            //var lineOpacity = canvasWidth / leftChannel.length  ;      
            this.canvas.save();
            this.canvas.fillStyle = '#080808' ;
            this.canvas.fillRect(0,0,this.options.canvasWidth,this.options.canvasHeight );
            this.canvas.strokeStyle = '#46a0ba';
            this.canvas.globalCompositeOperation = 'lighter';
            this.canvas.translate(0,this.options.canvasHeight / 2);
            //context.globalAlpha = 0.6 ; // lineOpacity ;
            this.canvas.lineWidth=1;
            let totallength = leftChannel.length;
            let eachBlock = Math.floor(totallength / this.options.drawLines);
            let lineGap = (this.options.canvasWidth/this.options.drawLines);

            this.canvas.beginPath();

            for (let i=0; i<=this.options.drawLines; i++) {
                let audioBuffKey = Math.floor(eachBlock * i);
                let x = i*lineGap;
                let y = leftChannel[audioBuffKey] * this.options.canvasHeight / 2;
                this.canvas.moveTo( x, y );
                this.canvas.lineTo( x, (y*-1) );
            }
            this.canvas.stroke();
            this.canvas.restore();
        },
        _createControls(){
            this.playButton = document.createElement("BUTTON");
            this.playButton.className = "btn btn-success";
            this.playButton.innerHTML = "PLAY";
            this.playButton.addEventListener('click', ()=>{
                if (!this.playing){
                    this._playTrack();
                } else{
                   this._pauseTrack();
                }
            });

            this.stopButton = document.createElement("BUTTON");
            this.stopButton.className = 'btn btn-danger';
            this.stopButton.innerHTML = "STOP";
            this.stopButton.addEventListener('click', ()=>{
                this._stopTrack();
            });

            let container = document.createElement('div');
            container.className = 'container text-center pt-4';

            container.appendChild(this.playButton);
            container.appendChild(this.stopButton);

            document.body.appendChild(container);
        },
        _playTrack(){
            console.log('playing track...');
            if (this.playing) return;

            this.audioContext.source = this.audioContext.createBufferSource();
            this.audioContext.source.buffer = this.track;
            this.audioContext.source.connect(this.audioContext.destination);
            this.audioContext.source.start(0, this.prevPlayedTime);
            this.audioContext.source.addEventListener('ended', () => {
                console.log('Audio ended...');
                console.log(this.track.duration);
                console.log(this.audioContext.currentTime);
                //TODO: How to detect when the audio finished by its own..
            });
            this.startPlayTime = this.audioContext.currentTime;
            this.playing = true;


            this.playButton.classList.remove('btn-success');
            this.playButton.classList.add('btn-warning');
            this.playButton.innerHTML = "PAUSE";
        },
        _pauseTrack(){
            console.log('Pausing track');
            
            this.playing = false;
            this.prevPlayedTime += this.audioContext.currentTime - this.startPlayTime;
            this.playButton.classList.remove('btn-warning');
            this.playButton.classList.add('btn-success');
            this.audioContext.source.stop();
            this.playButton.innerHTML = "PLAY";
        },
        _stopTrack(){
            console.log('Stopping track');
            this.audioContext.source.stop();
            this.playing = false;
            this.prevPlayedTime = 0;
            this.playButton.classList.remove('btn-warning');
            this.playButton.classList.add('btn-success');
            this.playButton.innerHTML = "PLAY";
        },
        // Public Methods
        init(options) {
            console.log('Initializing App...');
            this.options = {...this.options, ...options};
            this._loadEvents();
            this._createCanvas(this.options.canvasWidth, this.options.canvasHeight);
            this._createControls();
        },
        drawArea(initTime, endTime, color){
            // TODO: Covert time to pixels (timeToPixelConverter())
            this.canvas.beginPath();
            this.canvas.rect(initTime, 0, (endTime - initTime), this.options.canvasHeight);
            this.canvas.fillStyle = color;
            this.canvas.fill();
        },
        drawLine(currentTime, color){
            this.canvas.beginPath();
            this.canvas.moveTo(currentTime, 0);
            this.canvas.lineTo(currentTime, this.options.canvasHeight);
            this.canvas.strokeStyle = color;
            this.canvas.stroke();
        },
        draw(){
            this.canvas.clearRect(0, 0, this.options.canvasWidth, this.options.canvasHeight);
            this._displayTrack();

            // Paint Areas
            for (let drawpoints of this.options.drawPoints) {
                this.drawArea(drawpoints.a, drawpoints.b, drawpoints.color);
            }

            if (this.playing){
                this.playTime = this.prevPlayedTime + this.audioContext.currentTime - this.startPlayTime;
                this.drawLine(parseInt(this.playTime * this.options.canvasWidth / this.track.duration), "yellow");
            } else{
                this.drawLine(parseInt(this.prevPlayedTime * this.options.canvasWidth / this.track.duration), "yellow");
            }
            if (this.mousemove){
                this.drawLine(parseInt(window.App.mouseX), "orange");
            }
            requestAnimationFrame(this.draw.bind(this));
        },

    }
    window.App = App || {};

    let options = {
        canvasWidth: window.innerWidth, 
        canvasHeight: 300,
        drawLines: 2000,
        drawPoints: [
            {a:150, b:300, color:"rgba(255,0,0, .3)"},
            {a:500, b:623, color:"rgba(0,255,0, .3)"},
            {a:700, b:768, color:"rgba(0,0,255, .3)"}
            ]
    };
    
    /**
     * App initialization
     */
    App.init(options);
    
})();
