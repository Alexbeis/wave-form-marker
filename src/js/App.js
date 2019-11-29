(function(){
    'use-strict';
    
     const App = {
        //DOM Elements
        audioElement: document.querySelector('audio'),
        options: {
            canvasWidth: window.innerWidth, 
            canvasHeight: 300,
        },
        
        // Properties
        canvas: null,
        audioContext: null,
        track:null,

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
                this._displayTrack();
            });
            }
            request.send();
        },
        _displayTrack() {
            console.log(this.canvas);
            
            var drawLines = 300;
            var leftChannel = this.track.getChannelData(0); // Float32Array describing left channel     
            //var lineOpacity = canvasWidth / leftChannel.length  ;      
            this.canvas.save();
            this.canvas.fillStyle = '#080808' ;
            this.canvas.fillRect(0,0,this.options.canvasWidth,this.options.canvasHeight );
            this.canvas.strokeStyle = '#46a0ba';
            this.canvas.globalCompositeOperation = 'lighter';
            this.canvas.translate(0,this.canvasHeight / 2);
            //context.globalAlpha = 0.6 ; // lineOpacity ;
            this.canvas.lineWidth=1;
            let totallength = leftChannel.length;
            let eachBlock = Math.floor(totallength / drawLines);
            let lineGap = (this.canvasWidth/drawLines);

            this.canvas.beginPath();

            for (let i=0;i<=drawLines;i++) {
                let audioBuffKey = Math.floor(eachBlock * i);
                let x = i*lineGap;
                let y = leftChannel[audioBuffKey] * this.options.canvasHeight / 2;
                this.canvas.moveTo( x, y );
                this.canvas.lineTo( x, (y*-1) );
            }
            this.canvas.stroke();
            this.canvas.restore();
        },
        // Public Methods
        init(options) {
            console.log('Initializing App...');
        
            this._loadEvents();
            this._createCanvas(this.options.canvasWidth, this.options.canvasHeight);
            
        },
        drawArea(initTime, endTime){
            // TODO: Covert time to pixels (timeToPixelConverter())
            this.canvas.beginPath();
            this.canvas.rect(initTime, 0, (endTime - initTime), this.options.canvasHeight);
            this.canvas.fillStyle = "rgba(255,0,0, .3)";
            this.canvas.fill();
        }
    }
    window.App = App || {};
    App.init();
    
})();
