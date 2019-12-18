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