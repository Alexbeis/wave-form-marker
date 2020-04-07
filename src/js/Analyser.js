class Analyser {
    constructor(analyser){
        this.analyser = analyser;
        this.analyser.fftSize = 2048;
        this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(this.freqData);
        this.bins = this.analyser.frequencyBinCount;
    }

    start() {
        let myCanvas = this.visualCanvas.getContext("2d");
        myCanvas.clearRect(0, 0, this.w, this.h);
    }

    getFreqData() {
        return this.freqData;
    }
    render(targetElement, w, h) {
        this.w = w;
        this.h = h;
        const visualCanvas = document.createElement('canvas');
        visualCanvas.className = 'visual-canvas';
        visualCanvas.style.width ='100%';
        visualCanvas.width = w;
        visualCanvas.height = h;
        this.visualCanvas = visualCanvas;

        targetElement.querySelector('.modal-body').appendChild(visualCanvas);

    }
    getCanvas() {
        return this.visualCanvas;
    }
    get() {
        return this.analyser;
    }
    draw() {
        let visualContext = this.visualCanvas.getContext("2d");
        this.analyser.getByteFrequencyData(this.freqData);

        // Fill black color canvas and size
        visualContext.fillStyle = 'rgb(0, 0, 0)';
        visualContext.fillRect(0, 0, this.w, this.h);

        //Set color line to paint spectrum and its color
        visualContext.lineWidth = 2;
        visualContext.strokeStyle = 'rgb(158, 245, 66)';

        //Start now
        visualContext.beginPath();
        
        /**
         * Set the width of each segment of the line drawn by dividing the canvas length by array length (Bins) 
         * Define x variable to set the position to move for drawing each segment of the line.
         */
        let sliceWidth = this.w * 1.0 / this.bins;
        let x = 0;
        
        // Looping the bins of frequencia data
        for(let i = 0; i < this.bins; i++) {
            // Get small segment of the waveform for each point of the freq.
            let v = this.freqData[i] / 128.0;
            let y = v * this.h/2;

            if(i === 0) {
                // Set initial point to (x,y)
                visualContext.moveTo(x, y);
            } else {
                // adds a new point and creates a line TO that point FROM the last specified point in the canvas (this method does not draw the line).
                visualContext.lineTo(x, y);
            }
            x += sliceWidth;
        };
        
        visualContext.lineTo(this.visualCanvas.width, this.visualCanvas.height/2);
        // Draw the lines
        visualContext.stroke();
    }
}