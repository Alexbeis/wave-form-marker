class Canvas {
    constructor() {
        this.canvasEl = document.createElement('canvas');
        this.canvasContext = this.canvasEl.getContext('2d');
    }

    getCanvasContext() {
        return this.canvasContext;
    }

    getCanvasElement() {
        return this.canvasEl;
    }

    render(w, h) {
        this.canvasEl.className = "canvasPlayer";
        this.canvasEl.width = w;
        this.canvasEl.height = h;
         

        return this.canvasEl;
    }
}