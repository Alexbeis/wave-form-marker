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

        this.loadFile(player, 'track.wav').then((audioBuffer) => {
           this.addBuffer(audioBuffer);
           requestAnimationFrame(player.draw.bind(player));
        });
    }

    async getFile(player, filepath) {
        const response = await fetch(filepath);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await  player.audioContext.decodeAudioData(arrayBuffer);

        return audioBuffer;
      }
    
    async loadFile(player, filePath) {
        const track = await this.getFile(player, filePath);

        return track;
      }
    render() {

    }
    
}
