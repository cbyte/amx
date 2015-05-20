var socket = io.connect('141.83.177.24:2222'); // server address

if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', handlerDeviceOrientation, false);
} else {
  document.getElementById("logOrientation").innerHTML = "Error: No Device Orientation API"
}

if (window.DeviceMotionEvent) {
  window.addEventListener('devicemotion', handlerDeviceMotion, false);
} else {
  document.getElementById("logMotion").innerHTML = "Error: No Device Motion API"
}

function handlerDeviceOrientation(e) {
  var debug = "roll:" + Math.round(e.gamma) + "\n"
            + "pitch: " + Math.round(e.beta) + "\n"
            + "yaw: "+ Math.round(e.alpha) + "\n"
  document.getElementById("logOrientation").innerHTML = debug
  var h = min((e.alpha + 0.4 * e.beta - 0.4 * e.gamma)/360), 1);
  var color = hslToHex(h, 1, 0.65) //"hsl("+h+", 100%, 65%);"
  document.body.style.background = color
  socket.emit('orientation', {roll: Math.round(e.gamma),
    pitch: Math.round(e.beta),
    yaw: Math.round(e.alpha)});
}

function handlerDeviceMotion(e) {
  var debug = "acceleration (X,Y,Z): " + Math.round(e.acceleration.x) + ", " + Math.round(e.acceleration.y)+ ", " + Math.round(e.acceleration.z) + "\n"
            + "acceleration with gravity (X,Y,Z): " + Math.round(e.accelerationIncludingGravity.x) + ", " + Math.round(e.accelerationIncludingGravity.y)+ ", " + Math.round(e.accelerationIncludingGravity.z) + "\n"
            + "rotation rate (X,Y,Z): " + Math.round(e.rotationRate.beta) + ', ' + Math.round(e.rotationRate.gamma) + ', ' + Math.round(e.rotationRate.alpha) + "\n"
            + "refresh interval: " + e.interval
  document.getElementById("logMotion").innerHTML = debug
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
