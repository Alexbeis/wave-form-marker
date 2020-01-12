class Controls {
    constructor() {
        this.playButton = null;
        this.stopButton = null;
        this.loopButton = null;
        this.analyserButton = null;

        this._createPlayControl();
        this._createStopControl();
        this._createLoopControl();
        this._createAnalyserControl();
    }
    _createPlayControl() {
        this.playButton = document.createElement("BUTTON");
        this.playButton.className = "btn-lg btn-success";
        this.playButton.innerHTML = `<span><i class="fa fa-play"></i></span>`;
    }
    _createStopControl() {
        this.stopButton = document.createElement("BUTTON");
        this.stopButton.className = 'btn-lg btn-danger';
        this.stopButton.innerHTML = `<span><i class="fa fa-stop"></i></span>`;
    }
    _createLoopControl() {
       this.loopButton = document.createElement("BUTTON");
       this.loopButton.className = 'btn-lg btn-default';
       this.loopButton.dataset.looping = 'false';
       this.loopButton.innerHTML = `<span><i class="fa fa-recycle"></i></span>`;
    }

    _createAnalyserControl() {
        /**
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#myModal">
            Open modal
        </button>
         */
        this.analyserButton = document.createElement("BUTTON");
        this.analyserButton.className = 'btn-lg btn-default';
        this.analyserButton.dataset.toggle = 'modal';
        this.analyserButton.dataset.target = '#myModal';
        this.analyserButton.innerHTML = `<span><i class="fa fa-chart-bar"></i>Analyser</span>`;
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
        container.appendChild(this.analyserButton);

        document.body.appendChild(container);
     }



}