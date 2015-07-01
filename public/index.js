var socket = io.connect(window.location.hostname);

var debug = false;

var touchdown = false;
var lastNote = -1;
var currentNote = -1;
var lastVelocity = -1;
var currentVelocity = -1;
var orientationData = { 'roll': 0, 'pitch': 0, 'yaw': 0 };

var attachFastClick = Origami.fastclick;
attachFastClick(document.body);

var width = window.innerWidth;
var height = window.innerHeight;
var centerX = width * 0.5;
var centerY = height * 0.5;

document.body.style.background = "#000";
var paper = Raphael(0, 0, window.innerWidth, window.innerHeight);
var circle = paper.circle(centerX, centerY, 10);

document.getElementById("instrumentName").innerHTML = '...';

socket.on('connect', function(){
    socket.emit('hello-world', window.location.pathname.slice(1));
});

socket.on('instrument-granted', function(instrument) {
    if(window.DeviceOrientationEvent) {
        document.getElementById('instrumentName').innerHTML = instrument;
    }
});

if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', handlerDeviceOrientation, false);
}

var fadeToBlack = Raphael.animation({"fill": "#000", "fill-opacity" : "0"}, 1000);
var fadeInWithColor = Raphael.animation({r: width*2}, 250);

window.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    touchdown = true;
    document.getElementById("touchState").innerHTML = "pointerdown";

    var color = calcColor(orientationData);

    circle.attr("cx", e.pageX);
    circle.attr("cy", e.pageY);
    circle.attr("fill-opacity", 1);
    circle.attr("fill", color );
    circle.attr("r",1);
    circle.stop(fadeToBlack).animate(fadeInWithColor);
}, false);

window.addEventListener('pointerup', function (e) {
    e.preventDefault();
    touchdown = false;
    socket.emit('noteoff');
    document.getElementById("touchState").innerHTML = "pointerup";

    circle.animate(fadeToBlack);
}, false);

function calcColor(orientation) {
    var h = Math.min(((orientation.yaw + 0.4 * orientation.pitch - 0.4 * orientation.roll) / 360), 1);
    return Raphael.hsl2rgb(h, 1, 0.65);
}

function handlerDeviceOrientation(e) {
    if (debug) {
        var debug = "roll:" + Math.round(e.gamma) + "\n" + "pitch: " + Math.round(e.beta) + "\n" + "yaw: " + Math.round(e.alpha) + "\n";
        document.getElementById("logOrientation").innerHTML = debug;
    }

    orientationData = {
        'roll': Math.round(e.gamma),
        'pitch': Math.round(e.beta),
        'yaw': Math.round(e.alpha)
    };

    var fadeToColor = Raphael.animation({"fill": calcColor(orientationData)}, 0);

    currentNote = Math.round(e.beta);
    currentVelocity= Math.round(e.gamma);
    if (touchdown === true) {
        if ((lastNote != currentNote) && (lastVelocity != currentVelocity)) {
            socket.emit('orientation', orientationData);
            lastNote = currentNote;
            lastVelocity = currentVelocity;
        }
        circle.animate(fadeToColor);
    } else if (lastNote !== -1) {
        socket.emit('noteoff');
        lastNote = -1;
        lastVelocity = -1;
    }
}