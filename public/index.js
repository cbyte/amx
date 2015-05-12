
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
	document.getElementById("logOrientation").innerHTML = 'orientation: ' + JSON.stringify(e)
	//document.getElementById("logOrientation").innerHTML = "roll:" + e.gamma+ " pitch: " + e.beta + "yaw: "+ e.alpha
}

function handlerDeviceMotion(e) {
	document.getElementById("logMotion").innerHTML = 'motion' + JSON.stringify(e)
	//document.getElementById("logMotion").innerHTML = "acceleration: " + JSON.stringify(e.acceleration) + " acceleration with gravity: " + JSON.stringify(e.accelerationIncludingGravity) + " rotation rate: " + JSON.stringify(e.rotationRate) + " refresh interval: " + e.interval;
}