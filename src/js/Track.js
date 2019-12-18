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
