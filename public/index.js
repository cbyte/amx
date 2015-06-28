var socket = io.connect(window.location.hostname);
var touchdown = false;
var lastNote = -1;
var currentNote = -1;
var lastVelocity = -1;
var currentVelocity = -1;
var attachFastClick = Origami.fastclick;
attachFastClick(document.body);

var width = window.innerWidth;
var height = window.innerHeight;
var centerX = width * 0.5;
var centerY = height * 0.5;

document.body.style.background = "#000";
var paper = Raphael(0, 0, window.innerWidth, window.innerHeight);
var circle = paper.circle(centerX, centerY, 10);

var instrumentName = "Cooles Instrument";
document.getElementById("instrumentName").innerHTML = instrumentName;

var orientation;

if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', handlerDeviceOrientation, false);
} else {
    document.getElementById("logOrientation").innerHTML = "Error: No Device Orientation API";
}

if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', handlerDeviceMotion, false);
} else {
    document.getElementById("logMotion").innerHTML = "Error: No Device Motion API";
}

var fadeToBlack = Raphael.animation({"fill": "#000", "fill-opacity" : "0"}, 1000);
var fadeInWithColor = Raphael.animation({r: width*2}, 250);

window.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    touchdown = true;
    document.getElementById("touchState").innerHTML = "pointerdown";

    var color = calcColor(orientation);

    circle.attr("cx", e.pageX);
    circle.attr("cy", e.pageY);
    circle.attr("fill", color );
    circle.attr("fill-opacity", 1);
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
    return hslToHex(h, 1, 0.65);
}

function handlerDeviceOrientation(e) {
    var debug = "roll:" + Math.round(e.gamma) + "\n" + "pitch: " + Math.round(e.beta) + "\n" + "yaw: " + Math.round(e.alpha) + "\n";
    document.getElementById("logOrientation").innerHTML = debug;

    orientation = {
        roll: Math.round(e.gamma),
        pitch: Math.round(e.beta),
        yaw: Math.round(e.alpha)
    };

    currentNote = Math.round(e.beta);
    currentVelocity= Math.round(e.gamma);
    if (touchdown === true) {
        if (lastNote !== currentNote && lastVelocity != currentVelocity) {
            socket.emit('orientation', orientation);
            lastNote = currentNote;
            lastVelocity = currentVelocity;
        }
    } else if (lastNote !== -1) {
        socket.emit('noteoff');
        lastNote = -1;
        lastVelocity = -1;
    }
}

function handlerDeviceMotion(e) {
    var debug = "acceleration (X,Y,Z): " + Math.round(e.acceleration.x) + ", " + Math.round(e.acceleration.y) + ", " + Math.round(e.acceleration.z) + "\n" +
                "acceleration with gravity (X,Y,Z): " + Math.round(e.accelerationIncludingGravity.x) + ", " + Math.round(e.accelerationIncludingGravity.y) + ", " + Math.round(e.accelerationIncludingGravity.z) + "\n" +
                "rotation rate (X,Y,Z): " + Math.round(e.rotationRate.beta) + ', ' + Math.round(e.rotationRate.gamma) + ', ' + Math.round(e.rotationRate.alpha) + "\n" +
                "refresh interval: " + e.interval;
    document.getElementById("logMotion").innerHTML = debug;
}

/*
hsl to hex functions from http://jsperf.com/hsl-to-hex
*/
function componentToHex(c) {
    c = Math.round(c * 255).toString(16);
    return c.length === 1 ? "0" + c : c;
}

function hslToHex(h, s, l) {
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hueToRGB(p, q, h + 1 / 3);
        g = hueToRGB(p, q, h);
        b = hueToRGB(p, q, h - 1 / 3);
    }
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hueToRGB(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
}
