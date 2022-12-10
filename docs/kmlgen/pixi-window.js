'use strict';

var PIXI_WINDOW = PIXI_WINDOW || {};

PIXI_WINDOW.animID = null;
PIXI_WINDOW.fps = 30;


PIXI_WINDOW.resizeTimer = false;
window.addEventListener('resize', function() {
    if (PIXI_WINDOW.resizeTimer) {
        clearTimeout(PIXI_WINDOW.resizeTimer);
    }
    PIXI_WINDOW.resizeTimer = setTimeout(function() {
        cancelAnimFrame(PIXI_WINDOW.animID);
        PIXI_WINDOW.createCanvas();
        PIXI_WINDOW.callbackInitCanvas();
    }, 200);
});


window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 200);
        };
})();


window.cancelAnimFrame = (function() {
    return window.cancelAnimationFrame ||
        window.cancelRequestAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        window.msCancelAnimationFrame ||
        window.msCancelRequestAnimationFrame ||
        window.oCancelAnimationFrame ||
        window.oCancelRequestAnimationFrame ||
        function(id) {
            window.clearTimeout(id);
        };
}());


PIXI_WINDOW.init = function (resourceList, initCanvas, drawFrame) {
    // cancelAnimFrame(PIXI_WINDOW.animID);

    PIXI_WINDOW.callbackInitCanvas = initCanvas;
    PIXI_WINDOW.callbackDrawFrame = drawFrame;

    var loader = new PIXI.loaders.Loader();
    for (var i = 0; i < resourceList.length; i++) {
        // loader.add(resourceList[i], resourceList[i]);
        loader.add(resourceList[i], {crossOrigin: 'anonymous'});
    }
    loader.on('complete', function () {
        PIXI_WINDOW.createCanvas();
        PIXI_WINDOW.callbackInitCanvas();
    });
    loader.load();
};


PIXI_WINDOW.createCanvas = function () {
    if (PIXI_WINDOW.renderer) {
        document.getElementById("canvas").removeChild(PIXI_WINDOW.renderer.view);
    }
    PIXI_WINDOW.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
    document.getElementById("canvas").appendChild(PIXI_WINDOW.renderer.view);

    PIXI_WINDOW.basetime = Date.now();
    PIXI_WINDOW.refresh();
};


PIXI_WINDOW.refresh = function () {
    var interval = (1000 / PIXI_WINDOW.fps);
    if (Date.now() >= PIXI_WINDOW.basetime + interval) {
        PIXI_WINDOW.basetime += interval;
        PIXI_WINDOW.callbackDrawFrame();
    }
    PIXI_WINDOW.animID = requestAnimFrame(PIXI_WINDOW.refresh);
};

