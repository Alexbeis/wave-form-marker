class Controls {
    constructor() {
        this.playButton = null;
        this.stopButton = null;

        this._createPlayControl();
        this._createStopControl();
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

    getPlayElement() {
        return this.playButton;
    }

    getStopElement() {
        return this.stopButton;
    }

    render() {
        let container = document.createElement('div');
        container.className = 'container text-center pt-4';

        container.appendChild(this.playButton);
        container.appendChild(this.stopButton);

        document.body.appendChild(container);
     }



}