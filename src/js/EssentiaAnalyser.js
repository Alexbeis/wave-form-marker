class EssentiaAnalyser {
    constructor(essentia){
        this.essentia = essentia;
        this.track = null;
        this.playing = false;
        
        // prints version of the essentia wasm backend
	    console.log(this.essentia.version)
	    // prints all the available algorithms in essentia.js 
	    console.log(this.essentia.algorithmNames);

        // this.analyser.fftSize = 2048;
        // this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
        // this.analyser.getByteFrequencyData(this.freqData);
        // this.bins = this.analyser.frequencyBinCount;
    }

    init(track){
    	this.track = track;
    	this.setRMS();
    }

    computeEssentiaAlgos(){

    }

	start(){
		this.playing = true;
		while(this.playing){
			console.log(this.essRMS);
		}
	}

	stop(){
		this.playing = false;
	}

	setRMS(){
        this.essRMS = this.essentia.RMS(this.typedFloat32Array2Vec(this.track.buffer.getChannelData(0)));
	}


	// UTILS essentia
	// copy the contents of a float 32 js typed array into a std::vector<float> type. 
	typedFloat32Array2Vec(typedArray) {
		var vec = new Module.VectorFloat();
		for (var i=0; i<typedArray.length; i++) {
			if (typeof typedArray[i] === 'undefined') {
				vec.push_back(0);
			}
			else {
				vec.push_back(typedArray[i]);
			}
		}
		return vec;
	}

}
