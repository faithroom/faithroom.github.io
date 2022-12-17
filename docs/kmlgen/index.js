'use strict';

/////////////////// mission config
// var photoFile = './image/star.png';
// var photoFile = './image/airpeak.png';
var photoFile = './image/christmas.jpg';

//org
// var baseLon = 139.368611;
// var baseLat = 35.430030;

//middle
var baseLon = 139.368391;
var baseLat = 35.430030;

//mountain side
// var baseLon = 139.368106;
// var baseLat = 35.429622;

var baseAlt = 25.0;
var baseYaw = 270;
var widthMeter = 30;
var rotationY = 180; // [deg]
var rotationZ = 90; // [deg]
var stayTime = 2000;
var speed = 2.0;
var speedHigh = 6.0;
var acc = 1.0;
var accHigh = 1.2;

/////////////////// app
var photoImage;
var pointer;
var stage;
var windowWidth, windowHeight;
var pointX, pointY;
var points = []   // x, y, highSpeed, through
var drawPoint = -1;
var kmlTemplate;
var mouseX, mouseY;

/////////////////// state
var vel = false;
var through = false;
var snap = false;

$(document).ready(function() {
    // displayMessage('initializing...', 5000, 'Can not load application');

    $('#canvas').bind('touchstart', function() {
        touch(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
    });

    $('#canvas').bind('mousedown', function() {
        touch(event.pageX, event.pageY);
    });
    $('#canvas').bind('mousemove', function() {
        move(event.pageX, event.pageY);
    });
    $(document).keydown(function(e) {
        keydown(e);
    });
    $(document).keyup(function(e) {
        keyup(e);
    });

    $("#textbox").change(function () {
        var val = $('#textbox').val();
        localStorage.setItem('mode', val);
        location.reload();
    });

    var query = getQueryString();
    var mode = query.mode || localStorage.getItem('mode') || 0;

    var srcList = [
        'pixi-window.js'
    ];
    loadScript(srcList, function () {
        initApplication();
    });

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'template.kml', true);
    xhr.onreadystatechange = function(){
        if ((xhr.readyState == 4) && (xhr.status == 200)) {
            kmlTemplate = xhr.responseText;
        }
    }
    xhr.send(null);    
});

function getQueryString() {
    var result = {};

    if (1 < window.location.search.length) {
        var parameters = window.location.search.substring(1).split( '&' );
        for (var i = 0; i < parameters.length; i++) {
            var element = parameters[ i ].split( '=' );
            result[decodeURIComponent(element[0])] = decodeURIComponent(element[1]);
        }
    }
    return result;
};


////////////////////////////////////////////////////

function initApplication() {
    PIXI_WINDOW.init(
        [photoFile],
        function () {
            stage = new PIXI.Container();

            // photoImage
            windowWidth = window.innerWidth;
            windowHeight = window.innerHeight;
            photoImage = PIXI.Sprite.fromImage(photoFile, false);
            photoImage.position = {x:0, y:0};

            var photoScale = windowWidth / photoImage.width;
            photoImage.shiftx = 0;
            photoImage.shifty = photoImage.height * photoScale - windowHeight;
            photoImage.scale = new PIXI.Point(photoScale, photoScale);
            stage.addChild(photoImage);

            // pointer
            pointer = new PIXI.Graphics();
            pointer.beginFill('0x0080ff');
            pointer.drawCircle(pointX, pointY, 8);
            pointer.endFill();
            stage.addChild(pointer);
        },
        function () {
            drawFrame();
            PIXI_WINDOW.renderer.render(stage);
        }
    );
    // displayMessage('connecting...', 5000, 'Can not connect');
}

function drawFrame() {
    if (drawPoint != points.length) { // 全部書き直し
        drawPoint = points.length;

        stage.removeChildren();
        stage.addChild(photoImage);

        for (var i = 0; i < drawPoint; i++) {
            var item = new PIXI.Graphics();
            var color = points[i][3] ? 0xa0a0a0 : 0xff8000;
            item.beginFill(color);
            item.drawCircle(points[i][0], points[i][1], 8);
            item.endFill();
            stage.addChild(item);
        }
        for (var i = 1; i < drawPoint; i++) {
            var item = new PIXI.Graphics();
            var lineWidth = points[i][2] ? 2 : 5;
            item.lineStyle(lineWidth, 0xff0000)
                    .moveTo(points[i - 1][0], points[i - 1][1])
                    .lineTo(points[i][0], points[i][1]);
            stage.addChild(item);
        }
    }

    pointer.x = pointX;
    pointer.y = pointY;
    stage.removeChild(pointer);
    stage.addChild(pointer);
}

function loadScript(srcList, callback) {
    var loadCount = 0;

    srcList.forEach(function (src) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.src = src;
        head.appendChild(script);

        script.onload = function() {
            if (++loadCount === srcList.length) {
                callback();
            }
        };
    });
}

function drawContents() {
    var html = '';
    for (var i = 0; i < points.length; i++) {
        var p = points[i];
        html = html + p[0] + ', ' + p[1] + ', ' + p[2] + ',  ' + p[3] + '<br>';
    }
    $('#contents').html(html);

    generateKML();
}

function generateKML() {
    var coordinatesStr = '';
    var timeStr = '';
    var scale_m = widthMeter / windowWidth; // pixel -> meter
    var last_x, last_y, last_z;
    var totalTime = 0;
    var thetaY = radians(rotationY);
    var thetaZ = radians(rotationZ);

    for (var i = 0; i < points.length; i++) {
        var x = -points[i][1] * scale_m;
        var y = points[i][0] * scale_m;
        var z = 0.0;

        var t1 = Math.cos(thetaY) * z - Math.sin(thetaY) * x;
        var t2 = Math.sin(thetaY) * z + Math.cos(thetaY) * x;
        z = baseAlt - t1;
        x = t2;
console.log("#1  " + x + "  " + y + "  " + z);
        t1 = Math.cos(thetaZ) * x - Math.sin(thetaZ) * y;
        t2 = Math.sin(thetaZ) * x + Math.cos(thetaZ) * y;
        x = t1;
        y = t2;
console.log("#2  " + x + "  " + y + "  " + z);

        var dist = 0;
        if (i > 0) {
            dist = Math.sqrt((x - last_x) * (x - last_x) + (y - last_y) * (y - last_y) + (z - last_z) * (z - last_z));
        }
        var gpos = reproject(x, y);
        last_x = x;
        last_y = y;
        last_z = z;

        var lastThrough = (i > 0 && points[i - 1][3]);
        totalTime += getDurationFromDistance(dist, points[i][2], lastThrough, points[i][3]);
        coordinatesStr += gpos[1] + ',' + gpos[0] + ',' + z + ' \n';
        timeStr += totalTime + ' ';

        if (!points[i][3]) { // stay a moment
            totalTime += stayTime;
            coordinatesStr += gpos[1] + ',' + gpos[0] + ',' + z + ' \n';
            timeStr += totalTime + ' ';
        }
    }

    var contents = kmlTemplate.replace('{$coordinates}', coordinatesStr)
                                .replace('{$timestamp}', timeStr)
                                .replace('{$yaw}', baseYaw)
                                .replace('{$duration}', parseInt((totalTime + 999) / 1000 + 1));
    console.log(contents);

    return contents;
}

// [ms]
function getDurationFromDistance(dist, highSpeed, lastThrough, through) {
    var maxVel = speed;
    var maxAcc = acc;
    if (highSpeed) {
        maxVel = speedHigh;
        maxAcc = accHigh;
    }

    var duration;
    var t1 = (maxVel / maxAcc);
    if (t1 * 2 * maxVel / 2 >= dist) { // 最高速までの加減速だけで足りる場合
        duration = Math.sqrt(dist / maxAcc * 4);
    } else {
        var t2 = (dist - t1 * 2) / maxVel;
        duration = t1 * 2 + t2;
    }

    // 適当
    if (lastThrough) {
        duration *= 0.8;
    }
    if (through) {
        duration *= 0.8;
    }
    console.log("#### ", dist, highSpeed, duration);

    return parseInt(duration * 1000);
}

function setMousePoint() {
    pointX = mouseX;
    pointY = mouseY;

    if (snap) {
        for (var i = 0; i < points.length; i++) {
            if (mouseX - 10 <= points[i][0] && points[i][0] <= mouseX + 10 &&
                mouseY - 10 <= points[i][1] && points[i][1] <= mouseY + 10) {
                pointX = points[i][0];
                pointY = points[i][1];
                return;
            }
        }

        var lastX = points[points.length - 1][0];
        var lastY = points[points.length - 1][1];
        if (Math.abs(pointX - lastX) < Math.abs(pointY - lastY)) {
            pointX = lastX;
        } else {
            pointY = lastY;
        }
    }
}

///////////////////////////////////// calc util

function radians(deg) {
    return Math.PI * deg / 180;
}

function degrees(rad) {
    var deg = rad * 180 / Math.PI;
    if (deg > 180) {
        deg -= 360;
    }
    return deg;
}

function reproject(x, y) {
    var CONSTANTS_RADIUS_OF_EARTH = 6371000;
    
    var baseRadLat = radians(baseLat);
    var baseRadLon = radians(baseLon);
    var baseSinLat = Math.sin(radians(baseLat));
    var baseCosLat = Math.cos(radians(baseLat));
    var x_rad = x / CONSTANTS_RADIUS_OF_EARTH;
    var y_rad = y / CONSTANTS_RADIUS_OF_EARTH;
    var c = Math.sqrt(x_rad * x_rad + y_rad * y_rad);

    if (Math.abs(c) > 0) {
        var sin_c = Math.sin(c);
        var cos_c = Math.cos(c);
        var lat_rad = Math.asin(cos_c * baseSinLat + (x_rad * sin_c * baseCosLat) / c);
        var lon_rad = baseRadLon + Math.atan2(y_rad * sin_c, c * baseCosLat * cos_c - x_rad * baseSinLat * sin_c);
        return [degrees(lat_rad), degrees(lon_rad)];
    }

    return [baseLat, baseLon];
}


///////////////////////////////////// Event
function touch(x, y) {
    event.preventDefault();
    points.push([pointX, pointY, vel, through])
    drawContents();
}

function move(x, y) {
    event.preventDefault();
    mouseX = x;
    mouseY = y;
    setMousePoint();
}

function keydown(e) {
    switch (e.keyCode) {
    case 8: // Backspace
        if (points.length > 0) {
            points.pop();
        }
        break;

    case 16: // shift
        through = true;
        break;

    case 17: // control
        snap = true;
        setMousePoint();
        break;

    case 38: //up
        vel = true;
        break;

    case 40: //down
        vel = false;
        break;
    }
    console.log(e.keyCode);
}

function keyup(e) {
    switch (e.keyCode) {
    case 16: // shift
        through = false;
        break;

    case 17: // control
        snap = false;
        setMousePoint();
        break;
    }
}

function setDownloadContent(fileName, id, content) {
    var blob = new Blob([content], { "type" : "text/plain" });
    document.getElementById(id).href = window.URL.createObjectURL(blob);
}

function handleDownload() {
    setDownloadContent("out.kml", "download", generateKML());
}

function handleSave() {
    var csvStr = "";
    for (var i = 0; i < points.length; i++) {
        csvStr += points[i][0] + ',' + points[i][1] + ',' + points[i][2] + ',' + points[i][3] + '\n';
    }
    setDownloadContent("data.csv", "save", csvStr);
}

function handleLoad() {
    var reader = new FileReader()
    reader.onload = function () {
        points = [];
        var csvLine = reader.result.split('\n');
        for (var i = 0; i < csvLine.length; i++) {
           var token = csvLine[i].split(',');
           if (token.length == 4) {
               points.push([parseInt(token[0]), parseInt(token[1]), (token[2]=='true'), (token[3]=='true')]);
           }
        }
    }

    let element = document.getElementById('load');
    reader.readAsText(element.files[0]);
}
