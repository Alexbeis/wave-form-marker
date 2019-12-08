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

    load(audioContext, waveformMarker, player) {
        if (this.buffer) {
            return;
        }
        let request = new XMLHttpRequest();
        request.open('GET', 'track.wav', true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
            audioContext.decodeAudioData(request.response, (decodedData) => {
                    this.addBuffer(decodedData);
                    // TODO: try to not pass waveformMarker object
                    //waveformMarker.render(this.buffer);
                    requestAnimationFrame(player.draw.bind(player));
                });
        }
        request.send();
    }
    render() {

    }
    
}
