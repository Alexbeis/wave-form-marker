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

        this.wrapperElement
        .replaceWith(
            this.canvas.render(
                this.options.canvasWidth, 
                this.options.canvasHeight
            )
        );

        let leftChannel = trackBuffer.getChannelData(0);  
        //var lineOpacity = canvasWidth / leftChannel.length  ; 
        let canvasContext = this.canvas.getCanvasContext();     
        canvasContext.save();
        canvasContext.fillStyle = '#080808' ;
        canvasContext.fillRect(0,0,this.options.canvasWidth,this.options.canvasHeight );
        canvasContext.strokeStyle = '#46a0ba';
        canvasContext.globalCompositeOperation = 'lighter';
        canvasContext.translate(0,this.options.canvasHeight / 2);
        //context.globalAlpha = 0.6 ; // lineOpacity ;
        canvasContext.lineWidth=1;
        let totallength = leftChannel.length;
        let eachBlock = Math.floor(totallength / this.options.drawLines);
        let lineGap = (this.options.canvasWidth/this.options.drawLines);

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

