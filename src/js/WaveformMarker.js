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
        
    }

    getCanvas() {
        return this.canvas;
    }
    
    render(trackBuffer) {
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

