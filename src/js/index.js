(function(){
    'use-strict';
    
    let MusicPlayer = new Player('#player');
    let options = {
            waveform: {
                canvasWidth: window.innerWidth, 
                canvasHeight: 400,
                drawLines: 2000,
                drawPoints: 
                    [
                        {a:50, b:200, color:"rgba(255,0,0, .3)"},
                        {a:500, b:623, color:"rgba(0,255,0, .3)"},
                        {a:700, b:768, color:"rgba(0,0,255, .3)"}
                    ]
            }
    };

    MusicPlayer.start(options);
})()