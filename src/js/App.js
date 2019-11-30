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
                    window.requestAnimationFrame(window.App.draw);
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

            for (let i=0;i<=this.options.drawLines;i++) {
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
            this.playButton.innerHTML = "PLAY";
            this.playButton.addEventListener('click', ()=>{
                if(!this.playing){
                    this.audioContext.source = this.audioContext.createBufferSource();
                    this.audioContext.source.buffer = this.track;
                    this.audioContext.source.connect(this.audioContext.destination);
                    this.audioContext.source.start(0, this.prevPlayedTime);
                    this.startPlayTime = this.audioContext.currentTime;
                    this.playing = true;
                    this.playButton.innerHTML = "PAUSE";
                }
                else{
                    this.playing = false;
                    this.prevPlayedTime += this.audioContext.currentTime - this.startPlayTime;
                    this.audioContext.source.stop();
                    this.playButton.innerHTML = "PLAY";
                }
            });
            this.stopButton = document.createElement("BUTTON");
            this.stopButton.innerHTML = "STOP";
            this.stopButton.addEventListener('click', ()=>{
                    this.audioContext.source.stop();
                    this.playing = false;
                    this.prevPlayedTime = 0;
            });

            document.body.appendChild(this.playButton);
            document.body.appendChild(this.stopButton);
        },
        // Public Methods
        init(options) {
            console.log('Initializing App...');
            this.options = {...this.options, ...options};
            this._loadEvents();
            this._createCanvas(this.options.canvasWidth, this.options.canvasHeight);
            this._createControls();
        },
        drawArea(initTime, endTime){
            // TODO: Covert time to pixels (timeToPixelConverter())
            this.canvas.beginPath();
            this.canvas.rect(initTime, 0, (endTime - initTime), this.options.canvasHeight);
            this.canvas.fillStyle = "rgba(255,0,0, .3)";
            this.canvas.fill();
        },
        drawLine(currentTime){
            this.canvas.beginPath();
            this.canvas.moveTo(currentTime, 0);
            this.canvas.lineTo(currentTime, this.options.canvasHeight);
            this.canvas.strokeStyle = "yellow";
            this.canvas.stroke();
        },
        draw(){
            window.App.canvas.clearRect(0, 0, window.App.options.canvasWidth, window.App.options.canvasHeight);
            window.App._displayTrack();
            window.App.drawArea(150, 170);
            if(window.App.playing){
                window.App.playTime = window.App.prevPlayedTime + window.App.audioContext.currentTime - window.App.startPlayTime;
                window.App.drawLine(parseInt(window.App.playTime * window.App.options.canvasWidth / window.App.track.duration));
            }
            else{
                window.App.drawLine(parseInt(window.App.prevPlayedTime * window.App.options.canvasWidth / window.App.track.duration));
            }
            window.requestAnimationFrame(window.App.draw);
        },

    }
    window.App = App || {};

    let options = {
        canvasWidth: window.innerWidth, 
        canvasHeight: 300
    };
    
    /**
     * App initialization
     */
    App.init(options);
    
})();
