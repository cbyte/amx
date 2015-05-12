
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
        var color = "hsl("+Math.round(e.alpha)+", 100%, 70%);"
        document.body.style.backgroundColor = color
}

function handlerDeviceMotion(e) {
        var debug = "acceleration (X,Y,Z): " + Math.round(e.acceleration.x) + ", " + Math.round(e.acceleration.y)+ ", " + Math.round(e.acceleration.z) + "\n"
                  + "acceleration with gravity (X,Y,Z): " + Math.round(e.accelerationIncludingGravity.x) + ", " + Math.round(e.accelerationIncludingGravity.y)+ ", " + Math.round(e.accelerationIncludingGravity.z) + "\n"
                  + "rotation rate (X,Y,Z): " + Math.round(e.rotationRate.beta) + ', ' + Math.round(e.rotationRate.gamma) + ', ' + Math.round(e.rotationRate.alpha) + "\n"
                  + "refresh interval: " + e.interval
	document.getElementById("logMotion").innerHTML = debug
}