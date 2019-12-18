class Canvas {
    constructor() {
        this.canvasEl = document.createElement('canvas');
        this.canvasContext = this.canvasEl.getContext('2d');
    }

    getCanvasContext() {
        return this.canvasContext;
    }

    getCanvasElement() {
        return this.canvasEl;
    }

    render(w, h) {
        this.canvasEl.className = "canvasPlayer";
        this.canvasEl.width = w;
        this.canvasEl.height = h;
         

        return this.canvasEl;
    }
}
class Controls {
    constructor() {
        this.playButton = null;
        this.stopButton = null;
        this.loopButton = null;

        this._createPlayControl();
        this._createStopControl();
        this._createLoopControl();
    }
    _createPlayControl() {
        this.playButton = document.createElement("BUTTON");
        this.playButton.className = "btn btn-success";
        this.playButton.innerHTML = "PLAY";
    }
    _createStopControl() {
        this.stopButton = document.createElement("BUTTON");
        this.stopButton.className = 'btn btn-danger';
        this.stopButton.innerHTML = "STOP";
    }
    _createLoopControl() {
       this.loopButton = document.createElement("BUTTON");
       this.loopButton.className = 'btn btn-primary';
       this.loopButton.dataset.looping = 'false';
       this.loopButton.innerHTML = "LOOP ON";

    }

    getPlayElement() {
        return this.playButton;
    }

    getStopElement() {
        return this.stopButton;
    }

    getLoopElement() {
        return this.loopButton;
    }

    render() {
        let container = document.createElement('div');
        container.className = 'container text-center pt-4';

        container.appendChild(this.playButton);
        container.appendChild(this.stopButton);
        container.appendChild(this.loopButton);

        document.body.appendChild(container);
     }



}
class Marker {
    constructor() {
        this.Width = 12;
        this.Height = 20;
        this.XPos = 0;
        this.YPos = 0;
        this.time = null;
        this.text = null;
    }
}

class Tooltip {
    constructor() {
        this.tooltipElement = this._createTooltipElement();
    }
    _createTooltipElement() {
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip-time';
        tooltip.innerHTML = `<span id="tooltip-span"></span>`;

        return tooltip;
    }
    
    render() {
        document.body.appendChild(this.tooltipElement);
    }
}
class Track {
    constructor(){
       this.buffer = null; 
    }
    /**
     * 
     * @param {*} buffer 
     */
    addBuffer(buffer) {
        if (!this.buffer) {
            this.buffer = buffer;
        }   
    }

    load(player) {
        if (this.buffer) {
            return;
        }
        let request = new XMLHttpRequest();
        request.open('GET', 'track.wav', true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
            player.audioContext.decodeAudioData(request.response, (decodedData) => {
                    this.addBuffer(decodedData);
                    requestAnimationFrame(player.draw.bind(player));
                });
        }
        request.send();
    }
    render() {

    }
    
}

class WaveformMarker {
    constructor(element, options) {
        console.log('Hello from constructor', element);
        
        this.options = {
            canvasWidth: window.innerWidth, 
            canvasHeight: 300,
            drawLines: 300
        };

        this.wrapperElement = element;

        // Merge options
        this.options = {...this.options, ...options};     
        this.canvas = new Canvas();
        this.markers = [];  
        
    }

    getCanvas() {
        return this.canvas;
    }
    
    render (trackBuffer) {
        let canvasWidth = this.options.canvasWidth;
        let canvasHeight = this.options.canvasHeight;
        let drawLines = this.options.drawLines;
        let leftChannel = trackBuffer.getChannelData(0);  
        let canvasContext = this.canvas.getCanvasContext(); 

        this.wrapperElement
            .replaceWith(
                this.canvas.render(
                    canvasWidth, 
                    canvasHeight
                )
            );

        canvasContext.save();
        canvasContext.fillStyle = '#080808' ;
        canvasContext.fillRect(0, 0, canvasWidth, canvasHeight);
        canvasContext.strokeStyle = '#46a0ba';
        canvasContext.globalCompositeOperation = 'lighter';
        canvasContext.translate(0, canvasHeight / 2);
        canvasContext.globalAlpha = 0.9;
        canvasContext.lineWidth=1;
        let totallength = leftChannel.length;
        let eachBlock = Math.floor(totallength / drawLines);
        let lineGap = (canvasWidth / drawLines);

        canvasContext.beginPath();

        for (let i=0; i<=this.options.drawLines; i++) {
            let audioBuffKey = Math.floor(eachBlock * i);
            let x = i*lineGap;
            let y = leftChannel[audioBuffKey] * this.options.canvasHeight / 2;
            canvasContext.moveTo( x, y );
            canvasContext.lineTo( x, (y*-1) );
        }
        canvasContext.stroke();
        canvasContext.restore(); 
    }
    
}


class Player {
    constructor(selector) {
        console.log('Instatiating Player...');
        
        this.options = null;
        this.mainEl = document.querySelector(selector);
        this.tooltip= new Tooltip();
        this.audioContext = null;
        this.track = new Track();
        this.controls = new Controls();
        this.playTime= 0;
        this.prevPlayedTime=0;
        this.startPlayTime=0;
        this.playing= false;     
        this.looping = false;
    }
    
    start(options) {
        console.log('Starting Player...');
        this.options = {...this.options, ...options};
        this.controls.render();
        this.tooltip.render();
        this.tooltipElement = document.getElementById('tooltip-span');
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

        this.controls.getLoopElement().addEventListener('click', () => {
            this._handleLoop();
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
        document.addEventListener('dblclick', (evt) => {
            console.log('Double click detected!'); 
            let rect = this.waveformMarker.getCanvas().getCanvasElement().getBoundingClientRect();            
            let mouseXPos = (evt.x - rect.left);
            let mouseYPos = (evt.y - rect.top);

            var marker = new Marker();
            marker.XPos = mouseXPos;
            marker.YPos = mouseYPos - marker.Height;
            marker.time = (evt.clientX * this.track.buffer.duration / this.options.waveform.canvasWidth);
            let time = (evt.clientX * this.track.buffer.duration / this.options.waveform.canvasWidth).toFixed(3) + ' s';
            let markerText = `${time}`;
            marker.text = markerText;
            if (this.waveformMarker.markers.length < 2) {
                this.waveformMarker.markers.push(marker);
            }

            // order Markers
            this.waveformMarker.markers.sort((a,b) => (a.XPos > b.XPos) ? 1 : ((b.XPos > a.XPos) ? -1 : 0)); 
            console.log(this.waveformMarker.markers);
            
        });
    }
    _handleLoop() {
        let element = this.controls.getLoopElement();
        let value = element.dataset.looping;
        
        if (!this.audioContext.source && this.waveformMarker.markers.length != 2) {
            console.log('missing init and end markers');

            return;    
        }
        
        if (value == 'true') {
            this.audioContext.source.loop = false;
            this.looping = false;
            this.waveformMarker.markers = [];
            element.dataset.looping = 'false';
            element.innerHTML = "LOOP ON";
        } else {
            this.audioContext.source.loop = true;
            this.looping = true;
            this.audioContext.source.loopStart = this.waveformMarker.markers[0].time;
            this.audioContext.source.loopEnd = this.waveformMarker.markers[1].time;    
            element.dataset.looping = "true";
            element.innerHTML = "LOOP OFF";
        }    
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
        this.controls.getPlayElement().innerHTML = "PLAY";
    }
    _stopTrack(){
        console.log('Stopping track');
        if (!this.audioContext) return;
        this.audioContext.source.stop();
        this.playing = false;
        this.prevPlayedTime = 0;
        this.controls.getPlayElement().classList.remove('btn-warning');
        this.controls.getPlayElement().classList.add('btn-success');
        this.controls.getPlayElement().innerHTML = "PLAY";
    }
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
            
        } else {
            alert('Your browser does not support web audio api');
        }
    }

    loadAudioTrack() {
        return this.track.load(this); 
    }

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

    drawArea(initTime, endTime, color){
                
        // TODO: Covert time to pixels (timeToPixelConverter())
        let canvasContext = this.waveformMarker.getCanvas().getCanvasContext(); 
        canvasContext.beginPath();
        canvasContext.rect(initTime, 0, (endTime - initTime), this.options.waveform.canvasHeight);
        canvasContext.fillStyle = color;
        canvasContext.fill();
    }
    drawLine(currentTime, color){
        let canvasContext = this.waveformMarker.getCanvas().getCanvasContext();
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

        // Draw marker
        for (let i = 0; i < this.waveformMarker.markers.length; i++) {
            let tempMarker = this.waveformMarker.markers[i];

            this.drawLine(parseInt(tempMarker.XPos), "red");
            this.printMarker(tempMarker);
        }

        if (this.playing){
            this.playTime = this.prevPlayedTime + this.audioContext.currentTime - this.startPlayTime;
            console.log('playtime: '+ this.playTime);
            
            if (this.looping && this.playTime > (this.waveformMarker.markers[1].time)) {
                console.log('Looping!');
                console.log('playtime: '+ this.playTime);
                console.log(this.playTime > (this.waveformMarker.markers[1].time));
                
                console.log('vuelvo');
                //this.startPlayTime = this.audioContext.currentTime - this.waveformMarker.markers[0].time;
                this.prevPlayedTime += this.audioContext.currentTime - (this.waveformMarker.markers[1].time-this.waveformMarker.markers[0].time);
                console.log('prevPlayed: '+ this.prevPlayedTime);
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
        requestAnimationFrame(this.draw.bind(this));
    }
    
}
(function(){
    'use-strict';
    
    let MusicPlayer = new Player('#player');
    let options = {
            waveform: {
                canvasWidth: window.innerWidth, 
                canvasHeight: 400,
                drawLines: 2000,
                drawPoints: 
                    [
                        {a:50, b:200, color:"rgba(255,0,0, .3)"},
                        {a:500, b:623, color:"rgba(0,255,0, .3)"},
                        {a:700, b:768, color:"rgba(0,0,255, .3)"}
                    ]
            }
    };

    MusicPlayer.start(options);
})()