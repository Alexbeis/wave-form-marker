class Tooltip {
    constructor() {
        this.tooltipElement = this._createTooltipElement();
    }
    _createTooltipElement() {
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip-time';
        tooltip.innerHTML = `<span id="tooltip-span"></span>`;

        return tooltip;
    }
    
    render() {
        document.body.appendChild(this.tooltipElement);
    }
}